/**
 * ==============================================================================
 * Provider Application Model (models/Provider.js)
 * ==============================================================================
 * Mongoose schema for caregiver network applications in MongoDB.
 * ==============================================================================
 */

const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience must be realistic']
    },
    city: {
      type: String,
      required: [true, 'City/Region is required'],
      trim: true
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      minlength: [20, 'Bio must be at least 20 characters']
    },
    agreement: {
      type: Boolean,
      required: true,
      default: true
    },
    status: {
      type: String,
      enum: ['applied', 'under-review', 'approved', 'rejected'],
      default: 'applied'
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

module.exports = mongoose.models.Provider || mongoose.model('Provider', providerSchema);

