const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        question: String,
        answer: String,
      },
    ],
    additionalDetails: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DENIED'],
      default: 'PENDING',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
    },
    pickupCompleted: {
      type: Boolean,
      default: false,
    },
    pickupDate: {
      type: Date,
    },
    pickupVerificationType: {
      type: String,
      enum: ['ID_CHECKED', 'MATCHED_DESCRIPTION', 'OTHER'],
    },
    pickupNotes: {
      type: String,
    },
    contactEmail: { 
      type: String, 
      required: true },
    
      contactPhone: { 
        type: String, 
        required: true }
  },
  
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Claim', claimSchema);