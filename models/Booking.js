/**
 * ==============================================================================
 * Booking Model (models/Booking.js)
 * ==============================================================================
 * Mongoose schema for pet care appointments stored in MongoDB.
 * ==============================================================================
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
      minlength: [2, 'Owner name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    petName: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true
    },
    petType: {
      type: String,
      required: [true, 'Pet species is required'],
      enum: ['dog', 'cat', 'other'],
      default: 'dog'
    },
    petBreed: {
      type: String,
      default: 'Standard / Mixed'
    },
    service: {
      type: String,
      required: [true, 'Service type is required'],
      enum: ['walking', 'grooming', 'veterinary', 'sitting', 'taxi']
    },
    date: {
      type: String,
      required: [true, 'Booking date is required']
    },
    timeSlot: {
      type: String,
      required: [true, 'Preferred time slot is required']
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

