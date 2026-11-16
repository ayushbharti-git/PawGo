/**
 * ==============================================================================
 * Newsletter Subscriber Model (models/Newsletter.js)
 * ==============================================================================
 * Mongoose schema for newsletter emails in MongoDB.
 * ==============================================================================
 */

const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true
    },
    subscribedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);

