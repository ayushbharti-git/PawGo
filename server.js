/**
 * ==============================================================================
 * PawGo - Backend Server & Local JSON Storage
 * ==============================================================================
 * 
 * Course Evaluation 2: Node.js Backend Implementation
 * Purpose:
 *   1. Serve static website files (HTML, CSS, JS, images, videos)
 *   2. Provide REST API endpoints for receiving form submissions
 *   3. Validate and sanitize incoming data on the server
 *   4. Persist submissions asynchronously into local JSON files in `data/`
 *   5. Prevent corrupted writes and handle errors safely
 * 
 * Beginner Notes:
 *   - Uses Express when installed, with an automatic fallback to Node's built-in
 *     'http' module so the server works even before running 'npm install'.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.PORT || 3000;
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
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=UTF-8'
};

// ==============================================================================
// Helper Functions: File I/O & Validation
// ==============================================================================

/**
 * Ensure the data directory and required JSON files exist.
 */
async function initializeDataStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
      console.log('✓ Created data directory:', DATA_DIR);
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
        console.log('✓ Initialized empty JSON storage file:', path.basename(file));
      }
    }
  } catch (err) {
    console.error('Error initializing data storage:', err.message);
  }
}

/**
 * Safely read a JSON file. Returns an array.
 * If the file is missing or contains malformed JSON, returns [] to avoid crashing.
 */
async function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, '[]', 'utf8');
      return [];
    }
    const content = await fs.promises.readFile(filePath, 'utf8');
    if (!content.trim()) {
      return [];
    }
    return JSON.parse(content);
  } catch (err) {
    console.error(`Warning: Failed to parse JSON from ${path.basename(filePath)}. Resetting to empty array.`, err.message);
    return [];
  }
}

/**
 * Safely write data to a JSON file with pretty-formatting.
 */
async function writeJsonFile(filePath, data) {
  const serialized = JSON.stringify(data, null, 2);
  // Atomic write via temp file or direct write
  await fs.promises.writeFile(filePath, serialized, 'utf8');
}

/**
 * Sanitize a string to avoid storing malicious control characters or dangerous scripts.
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Simple email validation regex
 */
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Generate a unique ID for a submission
 */
function generateId() {
  return 'pwg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

// ==============================================================================
// Validation Logics for Each Form Type
// ==============================================================================

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

  if (!ownerName || ownerName.length < 2) {
    errors.push('Owner full name is required (minimum 2 characters).');
  }
  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }
  if (!phone || phone.length < 7) {
    errors.push('A valid phone number is required (minimum 7 digits).');
  }
  if (!petName || petName.length < 2) {
    errors.push('Pet name is required.');
  }
  if (!petType) {
    errors.push('Please select a pet type.');
  }
  if (!service) {
    errors.push('Please choose a pet care service.');
  }
  if (!date) {
    errors.push('Please select a booking date.');
  }
  if (!timeSlot) {
    errors.push('Please select a time slot.');
  }

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

  if (!name || name.length < 2) {
    errors.push('Name is required (minimum 2 characters).');
  }
  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }
  if (!subject) {
    errors.push('Please select an inquiry topic.');
  }
  if (!message || message.length < 10) {
    errors.push('Message is required (minimum 10 characters).');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      name,
      email,
      subject,
      message
    }
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

  if (!name || name.length < 2) {
    errors.push('Full name is required.');
  }
  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }
  if (!phone || phone.length < 7) {
    errors.push('Phone number is required.');
  }
  if (!specialty) {
    errors.push('Please select your care specialty.');
  }
  if (isNaN(experienceYears) || experienceYears < 0) {
    errors.push('Valid years of experience is required.');
  }
  if (!city) {
    errors.push('Location / City is required.');
  }
  if (!bio || bio.length < 20) {
    errors.push('Short biography/experience description is required (minimum 20 characters).');
  }
  if (!agreement) {
    errors.push('You must confirm agreement with PawGo safety standards.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      name,
      email,
      phone,
      specialty,
      experienceYears,
      city,
      bio,
      agreement
    }
  };
}

function validateNewsletterData(body) {
  const errors = [];
  const email = (body.email || '').trim();

  if (!email || !isValidEmail(email)) {
    errors.push('Please provide a valid email address.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: { email }
  };
}

// ==============================================================================
// Submission Storage Handler
// ==============================================================================

/**
 * Generic handler to save a submission into both its specific file and master submissions file.
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

  // 1. Append to the specific file
  if (specificFile) {
    const specificList = await readJsonFile(specificFile);
    specificList.push(record);
    await writeJsonFile(specificFile, specificList);
  }

  // 2. Append to the master submissions file
  const masterList = await readJsonFile(SUBMISSIONS_FILE);
  masterList.push(record);
  await writeJsonFile(SUBMISSIONS_FILE, masterList);

  return record;
}

// ==============================================================================
// Server Implementation
// ==============================================================================

// Try using Express if installed
let useExpress = false;
let expressApp = null;

try {
  const express = require('express');
  expressApp = express();
  useExpress = true;
} catch (e) {
  useExpress = false;
  console.log('ℹ Notice: Express module not found. Running with Node.js built-in HTTP server.');
}

if (useExpress) {
  // ----------------------------------------------------------------------------
  // Express Setup
  // ----------------------------------------------------------------------------
  const express = require('express');

  // Middleware
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(express.static(__dirname));

  // Logging middleware
  expressApp.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
  });

  // POST /api/bookings
  expressApp.post('/api/bookings', async (req, res) => {
    try {
      const validation = validateBookingData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }
      const record = await saveSubmission('booking', validation.data, BOOKINGS_FILE);
      return res.status(201).json({
        success: true,
        message: 'Pet care booking submitted successfully!',
        record
      });
    } catch (err) {
      console.error('Booking save error:', err);
      return res.status(500).json({ success: false, error: 'Server error saving booking.' });
    }
  });

  // POST /api/contacts
  expressApp.post('/api/contacts', async (req, res) => {
    try {
      const validation = validateContactData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }
      const record = await saveSubmission('contact', validation.data, CONTACTS_FILE);
      return res.status(201).json({
        success: true,
        message: 'Thank you! Your message has been received.',
        record
      });
    } catch (err) {
      console.error('Contact save error:', err);
      return res.status(500).json({ success: false, error: 'Server error saving contact message.' });
    }
  });

  // POST /api/providers
  expressApp.post('/api/providers', async (req, res) => {
    try {
      const validation = validateProviderData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ success: false, errors: validation.errors });
      }
      const record = await saveSubmission('provider', validation.data, PROVIDERS_FILE);
      return res.status(201).json({
        success: true,
        message: 'Caregiver application submitted successfully! Our team will contact you.',
        record
      });
    } catch (err) {
      console.error('Provider save error:', err);
      return res.status(500).json({ success: false, error: 'Server error saving application.' });
    }
  });

  // POST /api/newsletter
  expressApp.post('/api/newsletter', async (req, res) => {
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

  // POST /api/submissions (Master unified endpoint)
  expressApp.post('/api/submissions', async (req, res) => {
    try {
      const type = req.body.type || 'general';
      let validation;

      if (type === 'booking') {
        validation = validateBookingData(req.body);
      } else if (type === 'contact') {
        validation = validateContactData(req.body);
      } else if (type === 'provider') {
        validation = validateProviderData(req.body);
      } else if (type === 'newsletter') {
        validation = validateNewsletterData(req.body);
      } else {
        // Generic submission fallback
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

  // GET /api/records (Admin/Student review endpoint)
  expressApp.get('/api/records', async (req, res) => {
    try {
      const type = req.query.type;
      let records = await readJsonFile(SUBMISSIONS_FILE);
      
      if (type && type !== 'all') {
        records = records.filter(r => r.type === type);
      }

      // Sort newest first
      records.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      return res.json({ success: true, count: records.length, records });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to retrieve records.' });
    }
  });

  // DELETE /api/records/:id (Student practical demonstration)
  expressApp.delete('/api/records/:id', async (req, res) => {
    try {
      const id = req.params.id;
      let records = await readJsonFile(SUBMISSIONS_FILE);
      const initialLength = records.length;
      records = records.filter(r => r.id !== id);

      if (records.length === initialLength) {
        return res.status(404).json({ success: false, error: 'Record not found.' });
      }

      await writeJsonFile(SUBMISSIONS_FILE, records);
      return res.json({ success: true, message: 'Record deleted successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete record.' });
    }
  });

  // Start Express server if run directly
  if (require.main === module) {
    initializeDataStorage().then(() => {
      expressApp.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🐾 PawGo Web Application Server (Express) running!`);
        console.log(`🌐 Local URL: http://localhost:${PORT}`);
        console.log(`📁 JSON Data Directory: ${DATA_DIR}`);
        console.log(`=======================================================`);
      });
    });
  }

} else {
  // ----------------------------------------------------------------------------
  // Built-in Node.js HTTP Server Fallback (Zero external dependencies)
  // ----------------------------------------------------------------------------
  const http = require('http');
  const url = require('url');

  /**
   * Helper to parse JSON body from incoming HTTP request
   */
  function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
        // Limit request size to 1MB
        if (body.length > 1e6) {
          req.destroy();
          reject(new Error('Request payload too large'));
        }
      });
      req.on('end', () => {
        try {
          if (!body.trim()) {
            return resolve({});
          }
          // Handle both application/json and application/x-www-form-urlencoded
          const contentType = req.headers['content-type'] || '';
          if (contentType.includes('application/x-www-form-urlencoded')) {
            const parsed = new URLSearchParams(body);
            const obj = {};
            for (const [key, val] of parsed.entries()) {
              obj[key] = val;
            }
            return resolve(obj);
          }
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
      req.on('error', err => reject(err));
    });
  }

  /**
   * Helper to send JSON responses
   */
  function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data, null, 2));
  }

  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      return res.end();
    }

    // --------------------------------------------------------------------------
    // API Routes
    // --------------------------------------------------------------------------
    if (pathname.startsWith('/api/')) {

      // POST /api/bookings
      if (pathname === '/api/bookings' && method === 'POST') {
        try {
          const body = await parseRequestBody(req);
          const validation = validateBookingData(body);
          if (!validation.isValid) {
            return sendJson(res, 400, { success: false, errors: validation.errors });
          }
          const record = await saveSubmission('booking', validation.data, BOOKINGS_FILE);
          return sendJson(res, 201, {
            success: true,
            message: 'Pet care booking submitted successfully!',
            record
          });
        } catch (err) {
          console.error('Booking save error:', err);
          return sendJson(res, 500, { success: false, error: 'Server error saving booking.' });
        }
      }

      // POST /api/contacts
      if (pathname === '/api/contacts' && method === 'POST') {
        try {
          const body = await parseRequestBody(req);
          const validation = validateContactData(body);
          if (!validation.isValid) {
            return sendJson(res, 400, { success: false, errors: validation.errors });
          }
          const record = await saveSubmission('contact', validation.data, CONTACTS_FILE);
          return sendJson(res, 201, {
            success: true,
            message: 'Thank you! Your message has been received.',
            record
          });
        } catch (err) {
          console.error('Contact save error:', err);
          return sendJson(res, 500, { success: false, error: 'Server error saving contact message.' });
        }
      }

      // POST /api/providers
      if (pathname === '/api/providers' && method === 'POST') {
        try {
          const body = await parseRequestBody(req);
          const validation = validateProviderData(body);
          if (!validation.isValid) {
            return sendJson(res, 400, { success: false, errors: validation.errors });
          }
          const record = await saveSubmission('provider', validation.data, PROVIDERS_FILE);
          return sendJson(res, 201, {
            success: true,
            message: 'Caregiver application submitted successfully! Our team will contact you.',
            record
          });
        } catch (err) {
          console.error('Provider save error:', err);
          return sendJson(res, 500, { success: false, error: 'Server error saving application.' });
        }
      }

      // POST /api/newsletter
      if (pathname === '/api/newsletter' && method === 'POST') {
        try {
          const body = await parseRequestBody(req);
          const validation = validateNewsletterData(body);
          if (!validation.isValid) {
            return sendJson(res, 400, { success: false, errors: validation.errors });
          }
          const record = await saveSubmission('newsletter', validation.data, NEWSLETTER_FILE);
          return sendJson(res, 201, {
            success: true,
            message: 'Welcome to the PawGo Club! 20% discount code sent to your email.',
            record
          });
        } catch (err) {
          console.error('Newsletter save error:', err);
          return sendJson(res, 500, { success: false, error: 'Server error saving subscription.' });
        }
      }

      // POST /api/submissions (Master unified endpoint)
      if (pathname === '/api/submissions' && method === 'POST') {
        try {
          const body = await parseRequestBody(req);
          const type = body.type || 'general';
          let validation;

          if (type === 'booking') {
            validation = validateBookingData(body);
          } else if (type === 'contact') {
            validation = validateContactData(body);
          } else if (type === 'provider') {
            validation = validateProviderData(body);
          } else if (type === 'newsletter') {
            validation = validateNewsletterData(body);
          } else {
            const name = sanitizeInput(body.name || body.ownerName || 'Guest');
            const email = (body.email || '').trim();
            const message = sanitizeInput(body.message || body.notes || 'No message provided');
            if (!email || !isValidEmail(email)) {
              return sendJson(res, 400, { success: false, errors: ['A valid email address is required.'] });
            }
            validation = { isValid: true, errors: [], data: { name, email, message } };
          }

          if (!validation.isValid) {
            return sendJson(res, 400, { success: false, errors: validation.errors });
          }

          const record = await saveSubmission(type, validation.data, null);
          return sendJson(res, 201, {
            success: true,
            message: 'Submission saved successfully!',
            record
          });
        } catch (err) {
          console.error('Unified submission save error:', err);
          return sendJson(res, 500, { success: false, error: 'Server error saving submission.' });
        }
      }

      // GET /api/records
      if (pathname === '/api/records' && method === 'GET') {
        try {
          const type = parsedUrl.query.type;
          let records = await readJsonFile(SUBMISSIONS_FILE);
          if (type && type !== 'all') {
            records = records.filter(r => r.type === type);
          }
          records.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
          return sendJson(res, 200, { success: true, count: records.length, records });
        } catch (err) {
          return sendJson(res, 500, { success: false, error: 'Failed to retrieve records.' });
        }
      }

      // DELETE /api/records/:id
      if (pathname.startsWith('/api/records/') && method === 'DELETE') {
        try {
          const id = pathname.replace('/api/records/', '');
          let records = await readJsonFile(SUBMISSIONS_FILE);
          const initialLength = records.length;
          records = records.filter(r => r.id !== id);

          if (records.length === initialLength) {
            return sendJson(res, 404, { success: false, error: 'Record not found.' });
          }

          await writeJsonFile(SUBMISSIONS_FILE, records);
          return sendJson(res, 200, { success: true, message: 'Record deleted successfully.' });
        } catch (err) {
          return sendJson(res, 500, { success: false, error: 'Failed to delete record.' });
        }
      }

      return sendJson(res, 404, { success: false, error: 'API route not found.' });
    }

    // --------------------------------------------------------------------------
    // Static File Serving
    // --------------------------------------------------------------------------
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
      safePath = 'index.html';
    }

    const filePath = path.join(__dirname, safePath);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      return res.end('Access Denied');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        return res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>404 Not Found - PawGo</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 4rem;">
              <h1>404 - Page Not Found</h1>
              <p>The requested page or file does not exist.</p>
              <a href="index.html" style="color: #ff6b4a; font-weight: bold;">Return to Home</a>
            </body>
          </html>
        `);
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });

  if (require.main === module) {
    initializeDataStorage().then(() => {
      server.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🐾 PawGo Web Application Server (Native HTTP) running!`);
        console.log(`🌐 Local URL: http://localhost:${PORT}`);
        console.log(`📁 JSON Data Directory: ${DATA_DIR}`);
        console.log(`=======================================================`);
      });
    });
  }
}

// Module exports for testing & modularity
module.exports = {
  validateBookingData,
  validateContactData,
  validateProviderData,
  validateNewsletterData,
  readJsonFile,
  writeJsonFile,
  saveSubmission,
  initializeDataStorage,
  generateId,
  SUBMISSIONS_FILE,
  BOOKINGS_FILE,
  CONTACTS_FILE,
  PROVIDERS_FILE,
  NEWSLETTER_FILE
};
