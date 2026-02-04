const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token.js');
const Claim = require('../models/claim.js');
const FoundItem = require('../models/founditem.js');

// All claim routes require authentication
router.use(verifyToken);

// POST /claims - Create new claim (VISITOR or STAFF)
router.post('/', async (req, res) => {
  try {
    // Verify the item exists and get verification questions
    const foundItem = await FoundItem.findById(req.body.itemId);
    if (!foundItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (foundItem.status !== 'FOUND') {
      return res.status(400).json({ error: 'Item is no longer available for claiming' });
    }

    req.body.claimantId = req.user._id;
    const claim = await Claim.create(req.body);

    // Add claim to the found item's claims array
    foundItem.claims.push(claim._id);
    await foundItem.save();

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /claims - Get all claims (different views for STAFF vs VISITOR)
router.get('/', async (req, res) => {
  try {
    let claims;
    if (req.user.role === 'STAFF') {
      // Staff sees all claims
      claims = await Claim.find()
        .populate('itemId', 'title category locationFound dateFound')
        .populate('claimantId', 'username')
        .populate('reviewedBy', 'username')
        .sort({ createdAt: -1 });
    } else {
      // Visitors only see their own claims
      claims = await Claim.find({ claimantId: req.user._id })
        .populate('itemId', 'title category locationFound dateFound publicDescription imageUrl')
        .sort({ createdAt: -1 });
    }
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /claims/:id - Get single claim details
router.get('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('itemId')
      .populate('claimantId', 'username')
      .populate('reviewedBy', 'username');
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Visitors can only view their own claims, staff can view all
    if (req.user.role !== 'STAFF' && claim.claimantId._id.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Not authorized to view this claim' });
    }

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /claims/:id - Update claim (VISITOR can update their own PENDING claims)
router.put('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Only the claimant can update their own claim
    if (claim.claimantId.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Not authorized to update this claim' });
    }

    // Only allow updating PENDING claims
    if (claim.status !== 'PENDING') {
      return res.status(400).json({ error: 'Can only edit pending claims' });
    }

    // Update allowed fields
    const { answers, additionalDetails, contactEmail, contactPhone } = req.body;
    
    claim.answers = answers || claim.answers;
    claim.additionalDetails = additionalDetails !== undefined ? additionalDetails : claim.additionalDetails;
    claim.contactEmail = contactEmail || claim.contactEmail;
    claim.contactPhone = contactPhone || claim.contactPhone;
    
    await claim.save();

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /claims/:id/review - Review claim (STAFF only)
router.put('/:id/review', async (req, res) => {
  try {
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ error: 'Only staff can review claims' });
    }

    const { status, reviewNotes } = req.body;
    
    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNotes,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('itemId');

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // If approved, update item status to CLAIMED
    if (status === 'APPROVED') {
      await FoundItem.findByIdAndUpdate(claim.itemId._id, { status: 'CLAIMED' });
    }

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /claims/:id/pickup - Mark pickup complete (STAFF only)
router.put('/:id/pickup', async (req, res) => {
  try {
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ error: 'Only staff can mark pickup complete' });
    }

    const { pickupVerificationType, pickupNotes } = req.body;

    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      {
        pickupCompleted: true,
        pickupDate: new Date(),
        pickupVerificationType,
        pickupNotes,
      },
      { new: true }
    );

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /claims/:id - Delete claim (claimant or STAFF)
router.delete('/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Only claimant or staff can delete
    if (req.user.role !== 'STAFF' && claim.claimantId.toString() !== req.user._id) {
      return res.status(403).json({ error: 'Not authorized to delete this claim' });
    }

    await Claim.findByIdAndDelete(req.params.id);

    // Remove claim from found item's claims array
    await FoundItem.findByIdAndUpdate(claim.itemId, {
      $pull: { claims: claim._id }
    });

    res.status(200).json({ message: 'Claim deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;