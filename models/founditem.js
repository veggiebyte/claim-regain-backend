const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    color: {
      type: String,
    },
    publicDescription: {
      type: String,
      required: true,
    },
    privateNotes: {
      type: String,
    },
    dateFound: {
      type: Date,
      required: true,
    },
    locationFound: {
      type: String,
      required: true,
    },
    storageLocation: {
      type: String,
    },
    requiresIdForPickup: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['FOUND', 'CLAIMED', 'DONATED', 'DISPOSED'],
      default: 'FOUND',
    },
    verificationQuestions: [
      {
        question: String,
        answer: String,
      },
    ],
    imageUrl: {
      type: String,
    },
    claims: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Claim',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FoundItem', foundItemSchema);