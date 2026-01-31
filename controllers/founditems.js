const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token.js');
const FoundItem = require('../models/founditem.js');

// ========== Public Routes (no auth required) ==========

// GET /founditems - List all found items (public view with limited info)
router.get('/', async (req, res) => {
  try {
    const foundItems = await FoundItem.find({ status: 'FOUND' })
      .select('title category color publicDescription dateFound locationFound imageUrl')
      .sort({ createdAt: -1 });
    res.status(200).json(foundItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /founditems/:id - Get single item details (public)
router.get('/:id', async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.id)
      .select('title category color publicDescription dateFound locationFound imageUrl verificationQuestions');
    if (!foundItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    // Return verification questions WITHOUT answers
    const questionsOnly = foundItem.verificationQuestions.map(q => ({
      question: q.question
    }));
    res.status(200).json({
      ...foundItem.toObject(),
      verificationQuestions: questionsOnly
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== Protected Routes (auth required) ==========
router.use(verifyToken);

// POST /founditems - Create new found item (STAFF only)
router.post('/', async (req, res) => {
  try {
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ error: 'Only staff can create found items' });
    }
    req.body.createdBy = req.user._id;
    const foundItem = await FoundItem.create(req.body);
    res.status(201).json(foundItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /founditems/:id - Update found item (STAFF only)
router.put('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ error: 'Only staff can update found items' });
    }
    const foundItem = await FoundItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!foundItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json(foundItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /founditems/:id - Delete found item (STAFF only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'STAFF') {
      return res.status(403).json({ error: 'Only staff can delete found items' });
    }
    const foundItem = await FoundItem.findByIdAndDelete(req.params.id);
    if (!foundItem) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;