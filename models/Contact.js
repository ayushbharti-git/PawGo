/**
 * ==============================================================================
 * Contact Inquiry Model (models/Contact.js)
 * ==============================================================================
 * Mongoose schema for customer inquiries and messages in MongoDB.
 * ==============================================================================
 */

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      minlength: [10, 'Message must be at least 10 characters']
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'resolved'],
      default: 'unread'
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

module.exports = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

