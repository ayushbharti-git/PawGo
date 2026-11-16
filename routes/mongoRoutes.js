/**
 * ==============================================================================
 * Express APIs: MongoDB CRUD Operations (routes/mongoRoutes.js)
 * ==============================================================================
 * Requirement 4: CRUD operations using Express APIs to manage data in MongoDB.
 * 
 * Endpoints:
 *   [C] Create: POST /api/mongo/bookings, POST /api/mongo/contacts, POST /api/mongo/providers
 *   [R] Read:   GET  /api/mongo/bookings, GET  /api/mongo/bookings/:id
 *               GET  /api/mongo/contacts, GET  /api/mongo/providers, GET /api/mongo/status
 *   [U] Update: PUT  /api/mongo/bookings/:id (Full)
 *               PATCH /api/mongo/bookings/:id (Partial status/notes update)
 *               PATCH /api/mongo/contacts/:id (Status update)
 *               PATCH /api/mongo/providers/:id (Status update)
 *   [D] Delete: DELETE /api/mongo/bookings/:id, DELETE /api/mongo/contacts/:id
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const Provider = require('../models/Provider');
const { getMongoStatus, isMongoConnected } = require('../config/db');

// In-memory fallback collection for testing in environments without an active MongoDB instance
const memoryFallback = {
  bookings: [],
  contacts: [],
  providers: []
};

function generateId() {
  return 'pwg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Helper to build an ID query supporting both custom `pwg_...` strings and MongoDB `_id`
 */
function buildIdQuery(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return { $or: [{ _id: id }, { id: id }] };
  }
  return { id: id };
}

// ------------------------------------------------------------------------------
// CONNECTION HEALTH & STATS
// ------------------------------------------------------------------------------

// GET /api/mongo/status - Check MongoDB connection status & live document counts
router.get('/status', async (req, res) => {
  const status = getMongoStatus();
  let counts = { bookings: 0, contacts: 0, providers: 0 };

  if (isMongoConnected()) {
    try {
      counts.bookings = await Booking.countDocuments();
      counts.contacts = await Contact.countDocuments();
      counts.providers = await Provider.countDocuments();
    } catch (e) {
      console.warn('Error counting MongoDB documents:', e.message);
    }
  } else {
    counts = {
      bookings: memoryFallback.bookings.length,
      contacts: memoryFallback.contacts.length,
      providers: memoryFallback.providers.length
    };
  }

  res.json({
    success: true,
    mongoConnected: isMongoConnected(),
    database: status,
    counts,
    message: isMongoConnected()
      ? 'MongoDB is connected and actively processing queries.'
      : 'MongoDB is offline or unreachable. To connect, start mongod or update MONGODB_URI in .env with your MongoDB Atlas connection string.'
  });
});

// ------------------------------------------------------------------------------
// BOOKINGS CRUD
// ------------------------------------------------------------------------------

// [CREATE] POST /api/mongo/bookings - Create new booking in MongoDB
router.post('/bookings', async (req, res) => {
  try {
    const { ownerName, email, phone, petName, petType, petBreed, service, date, timeSlot, notes } = req.body;

    if (!ownerName || !email || !petName || !service || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed: ownerName, email, petName, service, date, and timeSlot are required.'
      });
    }

    const bookingData = {
      id: generateId(),
      ownerName: String(ownerName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || '').trim(),
      petName: String(petName).trim(),
      petType: petType || 'dog',
      petBreed: petBreed || 'Standard / Mixed',
      service,
      date,
      timeSlot,
      notes: notes || '',
      status: 'pending',
      submittedAt: new Date()
    };

    if (isMongoConnected()) {
      const newBooking = new Booking(bookingData);
      const saved = await newBooking.save();
      return res.status(201).json({
        success: true,
        message: 'Booking created successfully in MongoDB.',
        source: 'mongodb',
        data: saved
      });
    } else {
      // Graceful fallback to memory collection
      memoryFallback.bookings.push(bookingData);
      return res.status(201).json({
        success: true,
        message: 'Booking created successfully (Fallback: MongoDB is offline).',
        source: 'memory_fallback',
        data: bookingData
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ - ALL] GET /api/mongo/bookings - Retrieve all bookings
router.get('/bookings', async (req, res) => {
  try {
    const { status, service, petType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (service) filter.service = service;
    if (petType) filter.petType = petType;

    if (isMongoConnected()) {
      const bookings = await Booking.find(filter).sort({ submittedAt: -1 });
      return res.json({
        success: true,
        count: bookings.length,
        source: 'mongodb',
        data: bookings
      });
    } else {
      let filtered = memoryFallback.bookings;
      if (status) filtered = filtered.filter(b => b.status === status);
      if (service) filtered = filtered.filter(b => b.service === service);
      if (petType) filtered = filtered.filter(b => b.petType === petType);
      return res.json({
        success: true,
        count: filtered.length,
        source: 'memory_fallback',
        data: filtered
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ - SINGLE] GET /api/mongo/bookings/:id - Retrieve single booking by ID
router.get('/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoConnected()) {
      const booking = await Booking.findOne(buildIdQuery(id));
      if (!booking) {
        return res.status(404).json({ success: false, error: `Booking with ID ${id} not found in MongoDB.` });
      }
      return res.json({ success: true, source: 'mongodb', data: booking });
    } else {
      const booking = memoryFallback.bookings.find(b => b.id === id || b._id === id);
      if (!booking) {
        return res.status(404).json({ success: false, error: `Booking with ID ${id} not found.` });
      }
      return res.json({ success: true, source: 'memory_fallback', data: booking });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE - FULL] PUT /api/mongo/bookings/:id - Full update of booking document
router.put('/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    if (isMongoConnected()) {
      const updated = await Booking.findOneAndUpdate(
        buildIdQuery(id),
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Booking not found to update.' });
      }

      return res.json({
        success: true,
        message: 'Booking fully updated in MongoDB.',
        source: 'mongodb',
        data: updated
      });
    } else {
      const idx = memoryFallback.bookings.findIndex(b => b.id === id || b._id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Booking not found to update.' });
      }
      memoryFallback.bookings[idx] = { ...memoryFallback.bookings[idx], ...updateData };
      return res.json({
        success: true,
        message: 'Booking updated (Fallback).',
        source: 'memory_fallback',
        data: memoryFallback.bookings[idx]
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE - PARTIAL] PATCH /api/mongo/bookings/:id - Partial update (status, notes, timeSlot)
router.patch('/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const allowedFields = ['status', 'notes', 'date', 'timeSlot', 'service'];
    const updateFields = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateFields[key] = req.body[key];
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ success: false, error: 'No valid update fields provided.' });
    }

    if (isMongoConnected()) {
      const updated = await Booking.findOneAndUpdate(
        buildIdQuery(id),
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Booking not found.' });
      }

      return res.json({
        success: true,
        message: 'Booking status/details patched in MongoDB.',
        source: 'mongodb',
        data: updated
      });
    } else {
      const idx = memoryFallback.bookings.findIndex(b => b.id === id || b._id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Booking not found.' });
      }
      memoryFallback.bookings[idx] = { ...memoryFallback.bookings[idx], ...updateFields };
      return res.json({
        success: true,
        message: 'Booking patched (Fallback).',
        source: 'memory_fallback',
        data: memoryFallback.bookings[idx]
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [DELETE] DELETE /api/mongo/bookings/:id - Remove booking from MongoDB
router.delete('/bookings/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoConnected()) {
      const deleted = await Booking.findOneAndDelete(buildIdQuery(id));
      if (!deleted) {
        return res.status(404).json({ success: false, error: `Booking ${id} not found to delete.` });
      }
      return res.json({
        success: true,
        message: `Booking #${id} deleted from MongoDB successfully.`,
        source: 'mongodb',
        deletedId: id
      });
    } else {
      const idx = memoryFallback.bookings.findIndex(b => b.id === id || b._id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Booking not found.' });
      }
      memoryFallback.bookings.splice(idx, 1);
      return res.json({
        success: true,
        message: `Booking #${id} deleted (Fallback).`,
        source: 'memory_fallback',
        deletedId: id
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// CONTACTS CRUD
// ------------------------------------------------------------------------------

// [CREATE] POST /api/mongo/contacts
router.post('/contacts', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
    }

    const contactData = {
      id: generateId(),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      subject: subject || 'General Inquiry',
      message: String(message).trim(),
      status: 'unread',
      submittedAt: new Date()
    };

    if (isMongoConnected()) {
      const newContact = new Contact(contactData);
      const saved = await newContact.save();
      return res.status(201).json({ success: true, message: 'Contact saved to MongoDB.', source: 'mongodb', data: saved });
    } else {
      memoryFallback.contacts.push(contactData);
      return res.status(201).json({ success: true, message: 'Contact saved (Fallback).', source: 'memory_fallback', data: contactData });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ - ALL] GET /api/mongo/contacts
router.get('/contacts', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const contacts = await Contact.find().sort({ submittedAt: -1 });
      return res.json({ success: true, count: contacts.length, source: 'mongodb', data: contacts });
    } else {
      return res.json({ success: true, count: memoryFallback.contacts.length, source: 'memory_fallback', data: memoryFallback.contacts });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE - STATUS] PATCH /api/mongo/contacts/:id
router.patch('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!['unread', 'read', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be: unread, read, or resolved' });
    }

    if (isMongoConnected()) {
      const updated = await Contact.findOneAndUpdate(buildIdQuery(id), { $set: { status } }, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Contact inquiry not found.' });
      return res.json({ success: true, message: 'Contact status updated.', source: 'mongodb', data: updated });
    } else {
      const contact = memoryFallback.contacts.find(c => c.id === id || c._id === id);
      if (!contact) return res.status(404).json({ success: false, error: 'Contact inquiry not found.' });
      contact.status = status;
      return res.json({ success: true, message: 'Contact status updated (Fallback).', source: 'memory_fallback', data: contact });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [DELETE] DELETE /api/mongo/contacts/:id
router.delete('/contacts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoConnected()) {
      const deleted = await Contact.findOneAndDelete(buildIdQuery(id));
      if (!deleted) return res.status(404).json({ success: false, error: 'Contact not found.' });
      return res.json({ success: true, message: 'Contact deleted from MongoDB.', deletedId: id });
    } else {
      const idx = memoryFallback.contacts.findIndex(c => c.id === id || c._id === id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Contact not found.' });
      memoryFallback.contacts.splice(idx, 1);
      return res.json({ success: true, message: 'Contact deleted (Fallback).', deletedId: id });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ------------------------------------------------------------------------------
// PROVIDERS CRUD
// ------------------------------------------------------------------------------

// [CREATE] POST /api/mongo/providers
router.post('/providers', async (req, res) => {
  try {
    const { name, email, phone, specialty, experienceYears, city, bio } = req.body;
    if (!name || !email || !specialty || !city) {
      return res.status(400).json({ success: false, error: 'Name, email, specialty, and city are required.' });
    }

    const providerData = {
      id: generateId(),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || '').trim(),
      specialty,
      experienceYears: parseInt(experienceYears, 10) || 0,
      city: String(city).trim(),
      bio: String(bio || '').trim(),
      agreement: true,
      status: 'applied',
      submittedAt: new Date()
    };

    if (isMongoConnected()) {
      const newProvider = new Provider(providerData);
      const saved = await newProvider.save();
      return res.status(201).json({ success: true, message: 'Provider created in MongoDB.', source: 'mongodb', data: saved });
    } else {
      memoryFallback.providers.push(providerData);
      return res.status(201).json({ success: true, message: 'Provider created (Fallback).', source: 'memory_fallback', data: providerData });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [READ - ALL] GET /api/mongo/providers
router.get('/providers', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const providers = await Provider.find().sort({ submittedAt: -1 });
      return res.json({ success: true, count: providers.length, source: 'mongodb', data: providers });
    } else {
      return res.json({ success: true, count: memoryFallback.providers.length, source: 'memory_fallback', data: memoryFallback.providers });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [UPDATE - STATUS] PATCH /api/mongo/providers/:id
router.patch('/providers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!['applied', 'under-review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid provider status.' });
    }

    if (isMongoConnected()) {
      const updated = await Provider.findOneAndUpdate(buildIdQuery(id), { $set: { status } }, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Provider not found.' });
      return res.json({ success: true, message: 'Provider status updated.', source: 'mongodb', data: updated });
    } else {
      const provider = memoryFallback.providers.find(p => p.id === id || p._id === id);
      if (!provider) return res.status(404).json({ success: false, error: 'Provider not found.' });
      provider.status = status;
      return res.json({ success: true, message: 'Provider status updated (Fallback).', source: 'memory_fallback', data: provider });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [DELETE] DELETE /api/mongo/providers/:id
router.delete('/providers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (isMongoConnected()) {
      const deleted = await Provider.findOneAndDelete(buildIdQuery(id));
      if (!deleted) return res.status(404).json({ success: false, error: 'Provider not found.' });
      return res.json({ success: true, message: 'Provider application deleted from MongoDB.', deletedId: id });
    } else {
      const idx = memoryFallback.providers.findIndex(p => p.id === id || p._id === id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Provider not found.' });
      memoryFallback.providers.splice(idx, 1);
      return res.json({ success: true, message: 'Provider deleted (Fallback).', deletedId: id });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

