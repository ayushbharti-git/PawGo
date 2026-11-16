/**
 * ==============================================================================
 * Express APIs: Local JSON Storage (routes/jsonRoutes.js)
 * ==============================================================================
 * Requirement 3: Express APIs creation to save/fetch data to local JSON files.
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const PROVIDERS_FILE = path.join(DATA_DIR, 'providers.json');
const NEWSLETTER_FILE = path.join(DATA_DIR, 'newsletter.json');

// Reusable file helpers
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
    console.error(`Error reading ${path.basename(filePath)}:`, err.message);
    return [];
  }
}

async function writeJsonFile(filePath, data) {
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function generateId() {
  return 'pwg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

// ------------------------------------------------------------------------------
// BOOKINGS (JSON)
// ------------------------------------------------------------------------------

// GET /api/json/bookings - Fetch all bookings from local JSON
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE);
    res.json({ success: true, count: bookings.length, storage: 'local_json', data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/json/bookings - Save a booking to local JSON
router.post('/bookings', async (req, res) => {
  try {
    const body = req.body;
    if (!body.ownerName || !body.email || !body.petName || !body.service || !body.date) {
      return res.status(400).json({ success: false, error: 'Missing required booking fields.' });
    }

    const record = {
      id: generateId(),
      type: 'booking',
      ownerName: String(body.ownerName).trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: String(body.phone || '').trim(),
      petName: String(body.petName).trim(),
      petType: body.petType || 'dog',
      petBreed: body.petBreed || 'Standard / Mixed',
      service: body.service,
      date: body.date,
      timeSlot: body.timeSlot || 'Morning',
      notes: body.notes || '',
      submittedAt: new Date().toISOString()
    };

    // Save to bookings.json
    const bookings = await readJsonFile(BOOKINGS_FILE);
    bookings.push(record);
    await writeJsonFile(BOOKINGS_FILE, bookings);

    // Also append to master submissions.json
    const submissions = await readJsonFile(SUBMISSIONS_FILE);
    submissions.push(record);
    await writeJsonFile(SUBMISSIONS_FILE, submissions);

    res.status(201).json({
      success: true,
      message: 'Booking saved to local JSON file successfully.',
      storage: 'local_json',
      record
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// CONTACTS (JSON)
// ------------------------------------------------------------------------------

// GET /api/json/contacts - Fetch all contact messages from local JSON
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await readJsonFile(CONTACTS_FILE);
    res.json({ success: true, count: contacts.length, storage: 'local_json', data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/json/contacts - Save contact message to local JSON
router.post('/contacts', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.email || !body.message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    const record = {
      id: generateId(),
      type: 'contact',
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      subject: body.subject || 'General Inquiry',
      message: String(body.message).trim(),
      submittedAt: new Date().toISOString()
    };

    const contacts = await readJsonFile(CONTACTS_FILE);
    contacts.push(record);
    await writeJsonFile(CONTACTS_FILE, contacts);

    const submissions = await readJsonFile(SUBMISSIONS_FILE);
    submissions.push(record);
    await writeJsonFile(SUBMISSIONS_FILE, submissions);

    res.status(201).json({
      success: true,
      message: 'Contact message saved to local JSON file.',
      storage: 'local_json',
      record
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// PROVIDERS (JSON)
// ------------------------------------------------------------------------------

// GET /api/json/providers - Fetch all provider applications from local JSON
router.get('/providers', async (req, res) => {
  try {
    const providers = await readJsonFile(PROVIDERS_FILE);
    res.json({ success: true, count: providers.length, storage: 'local_json', data: providers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/json/providers - Save provider application to local JSON
router.post('/providers', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.email || !body.specialty || !body.city) {
      return res.status(400).json({ success: false, error: 'Missing required provider fields.' });
    }

    const record = {
      id: generateId(),
      type: 'provider',
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: String(body.phone || '').trim(),
      specialty: body.specialty,
      experienceYears: parseInt(body.experienceYears, 10) || 0,
      city: String(body.city).trim(),
      bio: String(body.bio || '').trim(),
      agreement: true,
      submittedAt: new Date().toISOString()
    };

    const providers = await readJsonFile(PROVIDERS_FILE);
    providers.push(record);
    await writeJsonFile(PROVIDERS_FILE, providers);

    const submissions = await readJsonFile(SUBMISSIONS_FILE);
    submissions.push(record);
    await writeJsonFile(SUBMISSIONS_FILE, submissions);

    res.status(201).json({
      success: true,
      message: 'Provider application saved to local JSON file.',
      storage: 'local_json',
      record
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// MASTER SUBMISSIONS (JSON)
// ------------------------------------------------------------------------------

// GET /api/json/submissions - Fetch master submissions with optional ?type= filter
router.get('/submissions', async (req, res) => {
  try {
    const type = req.query.type;
    let records = await readJsonFile(SUBMISSIONS_FILE);
    if (type && type !== 'all') {
      records = records.filter(r => r.type === type);
    }
    records.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    res.json({ success: true, count: records.length, storage: 'local_json', records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/json/submissions/:id - Delete a submission from master and specific JSON files
router.delete('/submissions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let master = await readJsonFile(SUBMISSIONS_FILE);
    const initialLen = master.length;
    master = master.filter(r => r.id !== id);

    if (master.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Record not found in local JSON.' });
    }

    await writeJsonFile(SUBMISSIONS_FILE, master);

    // Synchronize removal across specific files
    const specificFiles = [BOOKINGS_FILE, CONTACTS_FILE, PROVIDERS_FILE, NEWSLETTER_FILE];
    for (const file of specificFiles) {
      let list = await readJsonFile(file);
      const filtered = list.filter(r => r.id !== id);
      if (filtered.length !== list.length) {
        await writeJsonFile(file, filtered);
      }
    }

    res.json({ success: true, message: `Record #${id} deleted from local JSON file.`, storage: 'local_json' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

