/**
 * ==============================================================================
 * PawGo - Unified Backend Server & Database Integration (server.js)
 * ==============================================================================
 * Requirements Satisfied:
 *   1. Fetching and showing data via External APIs calls (/api/external/*)
 *   2. Node and Express setup with environment configuration (.env)
 *   3. Express APIs creation to save/fetch data to local JSON files (/api/json/*)
 *   4. CRUD operations using Express APIs to manage data in MongoDB (/api/mongo/*)
 * ==============================================================================
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDB, getMongoStatus, isMongoConnected } = require('./config/db');
const jsonRoutes = require('./routes/jsonRoutes');
const mongoRoutes = require('./routes/mongoRoutes');
const externalRoutes = require('./routes/externalRoutes');

// Mongoose Models for dual persistence
const Booking = require('./models/Booking');
const Contact = require('./models/Contact');
const Provider = require('./models/Provider');

const app = express();
const PORT = process.env.PORT || 3000;

// Storage configuration
const DATA_DIR = path.join(__dirname, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const PROVIDERS_FILE = path.join(DATA_DIR, 'providers.json');
const NEWSLETTER_FILE = path.join(DATA_DIR, 'newsletter.json');

// MIME types dictionary for static file serving
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=UTF-8'
};

// ------------------------------------------------------------------------------
// Initialization & Storage Helpers
// ------------------------------------------------------------------------------

async function initializeDataStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }

    const files = [
      SUBMISSIONS_FILE,
      BOOKINGS_FILE,
      CONTACTS_FILE,
      PROVIDERS_FILE,
      NEWSLETTER_FILE
    ];

    for (const file of files) {
      if (!fs.existsSync(file)) {
        await fs.promises.writeFile(file, JSON.stringify([], null, 2), 'utf8');
      }
    }
  } catch (err) {
    console.error('Data storage initialization error:', err.message);
  }
}

async function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, '[]', 'utf8');
      return [];
    }
    const content = await fs.promises.readFile(filePath, 'utf8');
    if (!content.trim()) return [];
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

async function writeJsonFile(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function generateId() {
  return 'pwg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

// ------------------------------------------------------------------------------
// Validation Functions
// ------------------------------------------------------------------------------

function validateBookingData(body) {
  const errors = [];
  const ownerName = sanitizeInput(body.ownerName);
  const email = (body.email || '').trim();
  const phone = sanitizeInput(body.phone);
  const petName = sanitizeInput(body.petName);
  const petType = sanitizeInput(body.petType);
  const service = sanitizeInput(body.service);
  const date = sanitizeInput(body.date);
  const timeSlot = sanitizeInput(body.timeSlot);
  const notes = sanitizeInput(body.notes || '');

  if (!ownerName || ownerName.length < 2) errors.push('Owner full name is required (minimum 2 characters).');
  if (!email || !isValidEmail(email)) errors.push('A valid email address is required.');

  const phoneDigits = phone.replace(/[^0-9]/g, '');
  if (!phone || phoneDigits.length < 7 || phoneDigits.length > 15) errors.push('A valid phone number is required (7 to 15 digits).');

  if (!petName || petName.length < 2) errors.push('Pet name is required (minimum 2 characters).');
  if (!petType) errors.push('Please select a pet species.');

  const validServices = ['walking', 'grooming', 'veterinary', 'sitting', 'taxi'];
  if (!service || !validServices.includes(service.toLowerCase())) errors.push('Please choose a valid pet care service.');

  if (!date) {
    errors.push('Please select a booking date.');
  } else {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('Invalid booking date format.');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        errors.push('Booking date cannot be in the past.');
      }
    }
  }

  if (!timeSlot) errors.push('Please select a preferred time slot.');

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      ownerName,
      email,
      phone,
      petName,
      petType,
      petBreed: sanitizeInput(body.petBreed || 'Standard'),
      service,
      date,
      timeSlot,
      notes
    }
  };
}

function validateContactData(body) {
  const errors = [];
  const name = sanitizeInput(body.name);
  const email = (body.email || '').trim();
  const subject = sanitizeInput(body.subject);
  const message = sanitizeInput(body.message);

  if (!name || name.length < 2) errors.push('Name is required (minimum 2 characters).');
  if (!email || !isValidEmail(email)) errors.push('A valid email address is required.');
  if (!subject) errors.push('Please select an inquiry topic.');
  if (!message || message.length < 10) errors.push('Message is required (minimum 10 characters).');

  return {
    isValid: errors.length === 0,
    errors,
    data: { name, email, subject, message }
  };
}

function validateProviderData(body) {
  const errors = [];
  const name = sanitizeInput(body.name);
  const email = (body.email || '').trim();
  const phone = sanitizeInput(body.phone);
  const specialty = sanitizeInput(body.specialty);
  const experienceYears = parseInt(body.experienceYears, 10);
  const city = sanitizeInput(body.city);
  const bio = sanitizeInput(body.bio);
  const agreement = body.agreement === true || body.agreement === 'true' || body.agreement === 'on';

  if (!name || name.length < 2) errors.push('Full name is required (minimum 2 characters).');
  if (!email || !isValidEmail(email)) errors.push('A valid email address is required.');

  const phoneDigits = phone.replace(/[^0-9]/g, '');
  if (!phone || phoneDigits.length < 7 || phoneDigits.length > 15) errors.push('A valid phone number is required (7 to 15 digits).');

  if (!specialty) errors.push('Please select your care specialty.');
  if (isNaN(experienceYears) || experienceYears < 0 || experienceYears > 50) errors.push('Valid years of experience is required (0 to 50).');
  if (!city || city.length < 2) errors.push('Location / City is required.');
  if (!bio || bio.length < 20) errors.push('Short biography/experience description is required (minimum 20 characters).');
  if (!agreement) errors.push('You must confirm agreement with PawGo safety standards.');

  return {
    isValid: errors.length === 0,
    errors,
    data: { name, email, phone, specialty, experienceYears, city, bio, agreement }
  };
}

function validateNewsletterData(body) {
  const errors = [];
  const email = (body.email || '').trim();
  if (!email || !isValidEmail(email)) errors.push('Please provide a valid email address.');

  return {
    isValid: errors.length === 0,
    errors,
    data: { email }
  };
}

/**
 * Saves submission to local JSON files and optionally to MongoDB if connected
 */
async function saveSubmission(type, validatedData, specificFile) {
  const id = generateId();
  const timestamp = new Date().toISOString();

  const record = {
    id,
    type,
    ...validatedData,
    submittedAt: timestamp
  };

  // 1. Save to local JSON files
  if (specificFile) {
    const specificList = await readJsonFile(specificFile);
    specificList.push(record);
    await writeJsonFile(specificFile, specificList);
  }

  const masterList = await readJsonFile(SUBMISSIONS_FILE);
  masterList.push(record);
  await writeJsonFile(SUBMISSIONS_FILE, masterList);

  // 2. Dual persist to MongoDB if connected
  if (isMongoConnected()) {
    try {
      if (type === 'booking') {
        const mongoDoc = new Booking({ ...record });
        await mongoDoc.save();
      } else if (type === 'contact') {
        const mongoDoc = new Contact({ ...record });
        await mongoDoc.save();
      } else if (type === 'provider') {
        const mongoDoc = new Provider({ ...record });
        await mongoDoc.save();
      }
    } catch (mongoErr) {
      console.warn('MongoDB dual-persistence notice:', mongoErr.message);
    }
  }

  return record;
}

/**
 * Deletes a submission across local JSON files and MongoDB
 */
async function deleteSubmission(id) {
  let master = await readJsonFile(SUBMISSIONS_FILE);
  const initialCount = master.length;
  master = master.filter(r => r.id !== id);

  if (master.length === initialCount) {
    return false;
  }

  await writeJsonFile(SUBMISSIONS_FILE, master);

  const specificFiles = [BOOKINGS_FILE, CONTACTS_FILE, PROVIDERS_FILE, NEWSLETTER_FILE];
  for (const sFile of specificFiles) {
    let list = await readJsonFile(sFile);
    const filtered = list.filter(r => r.id !== id);
    if (filtered.length !== list.length) {
      await writeJsonFile(sFile, filtered);
    }
  }

  // Also remove from MongoDB if present
  if (isMongoConnected()) {
    try {
      await Booking.findOneAndDelete({ id });
      await Contact.findOneAndDelete({ id });
      await Provider.findOneAndDelete({ id });
    } catch (e) {
      // Ignored
    }
  }

  return true;
}

// ------------------------------------------------------------------------------
// Express Middlewares & Routes
// ------------------------------------------------------------------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets with alias /assets -> /assests
app.use('/assets', express.static(path.join(__dirname, 'assests')));
app.use(express.static(__dirname));

// Request logger
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// ------------------------------------------------------------------------------
// Mount Modular Route Handlers
// ------------------------------------------------------------------------------

// Requirement 1: External API calls
app.use('/api/external', externalRoutes);

// Requirement 3: Local JSON File Express APIs
app.use('/api/json', jsonRoutes);

// Requirement 4: MongoDB CRUD Operations Express APIs
app.use('/api/mongo', mongoRoutes);

// ------------------------------------------------------------------------------
// Legacy & Unified API Routes (Backwards Compatibility with Existing Forms)
// ------------------------------------------------------------------------------

// POST /api/bookings
app.post('/api/bookings', async (req, res) => {
  try {
    const validation = validateBookingData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }
    const record = await saveSubmission('booking', validation.data, BOOKINGS_FILE);
    return res.status(201).json({
      success: true,
      message: 'Pet care booking submitted successfully!',
      mongoConnected: isMongoConnected(),
      record
    });
  } catch (err) {
    console.error('Booking save error:', err);
    return res.status(500).json({ success: false, error: 'Server error saving booking.' });
  }
});

// POST /api/contacts
app.post('/api/contacts', async (req, res) => {
  try {
    const validation = validateContactData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }
    const record = await saveSubmission('contact', validation.data, CONTACTS_FILE);
    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been received.',
      mongoConnected: isMongoConnected(),
      record
    });
  } catch (err) {
    console.error('Contact save error:', err);
    return res.status(500).json({ success: false, error: 'Server error saving contact message.' });
  }
});

// POST /api/providers
app.post('/api/providers', async (req, res) => {
  try {
    const validation = validateProviderData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }
    const record = await saveSubmission('provider', validation.data, PROVIDERS_FILE);
    return res.status(201).json({
      success: true,
      message: 'Caregiver application submitted successfully!',
      mongoConnected: isMongoConnected(),
      record
    });
  } catch (err) {
    console.error('Provider save error:', err);
    return res.status(500).json({ success: false, error: 'Server error saving application.' });
  }
});

// POST /api/newsletter
app.post('/api/newsletter', async (req, res) => {
  try {
    const validation = validateNewsletterData(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }
    const record = await saveSubmission('newsletter', validation.data, NEWSLETTER_FILE);
    return res.status(201).json({
      success: true,
      message: 'Welcome to the PawGo Club! 20% discount code sent to your email.',
      record
    });
  } catch (err) {
    console.error('Newsletter save error:', err);
    return res.status(500).json({ success: false, error: 'Server error saving subscription.' });
  }
});

// POST /api/submissions (Unified endpoint)
app.post('/api/submissions', async (req, res) => {
  try {
    const type = req.body.type || 'general';
    let validation;

    if (type === 'booking') validation = validateBookingData(req.body);
    else if (type === 'contact') validation = validateContactData(req.body);
    else if (type === 'provider') validation = validateProviderData(req.body);
    else if (type === 'newsletter') validation = validateNewsletterData(req.body);
    else {
      const name = sanitizeInput(req.body.name || req.body.ownerName || 'Guest');
      const email = (req.body.email || '').trim();
      const message = sanitizeInput(req.body.message || req.body.notes || 'No message provided');
      if (!email || !isValidEmail(email)) {
        return res.status(400).json({ success: false, errors: ['A valid email address is required.'] });
      }
      validation = { isValid: true, errors: [], data: { name, email, message } };
    }

    if (!validation.isValid) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const record = await saveSubmission(type, validation.data, null);
    return res.status(201).json({
      success: true,
      message: 'Submission saved successfully!',
      record
    });
  } catch (err) {
    console.error('Unified submission save error:', err);
    return res.status(500).json({ success: false, error: 'Server error saving submission.' });
  }
});

// GET /api/records
app.get('/api/records', async (req, res) => {
  try {
    const type = req.query.type;
    let records = await readJsonFile(SUBMISSIONS_FILE);
    if (type && type !== 'all') {
      records = records.filter(r => r.type === type);
    }
    records.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    return res.json({ success: true, count: records.length, records });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve records.' });
  }
});

// DELETE /api/records/:id
app.delete('/api/records/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const success = await deleteSubmission(id);
    if (!success) {
      return res.status(404).json({ success: false, error: 'Record not found.' });
    }
    return res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to delete record.' });
  }
});

// ------------------------------------------------------------------------------
// Clean URL Fallback (e.g. /services -> /services.html)
// ------------------------------------------------------------------------------

app.get('/:page', (req, res, next) => {
  const filePath = path.join(__dirname, req.params.page + '.html');
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  next();
});

// JSON Syntax Error Middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, errors: ['Malformed JSON payload received.'] });
  }
  console.error('Express server error:', err);
  return res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ------------------------------------------------------------------------------
// Server Startup
// ------------------------------------------------------------------------------

if (require.main === module) {
  initializeDataStorage().then(async () => {
    // Attempt MongoDB connection
    await connectDB();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🐾 PawGo Web Application Server (Express) running!`);
      console.log(`🌐 Local URL: http://localhost:${PORT}`);
      console.log(`📁 JSON Data Directory: ${DATA_DIR}`);
      console.log(`🍃 MongoDB Status: ${isMongoConnected() ? 'CONNECTED' : 'OFFLINE (Fallback Active)'}`);
      console.log(`🔗 External API: /api/external/discovery`);
      console.log(`🔗 Local JSON API: /api/json/submissions`);
      console.log(`🔗 MongoDB CRUD API: /api/mongo/bookings`);
      console.log(`=======================================================`);
    });
  });
}

// Module exports for testing & modularity
module.exports = {
  app,
  validateBookingData,
  validateContactData,
  validateProviderData,
  validateNewsletterData,
  readJsonFile,
  writeJsonFile,
  saveSubmission,
  deleteSubmission,
  initializeDataStorage,
  generateId,
  SUBMISSIONS_FILE,
  BOOKINGS_FILE,
  CONTACTS_FILE,
  PROVIDERS_FILE,
  NEWSLETTER_FILE
};
