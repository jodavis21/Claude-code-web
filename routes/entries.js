const express = require('express');
const router = express.Router();
const { entries } = require('../db/firebase-database');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET /api/entries - List all entries for authenticated user (with optional search)
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const userId = req.user.uid; // From auth middleware
    const allEntries = await entries.getAll(userId, search);
    res.json(allEntries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/entries/:id - Get single entry (if user owns it)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.uid; // From auth middleware
    const entry = await entries.getById(req.params.id, userId);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/entries - Create new entry for authenticated user
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.uid; // From auth middleware

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const entry = await entries.create(userId, title || '', content);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/entries/:id - Update entry (if user owns it)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.uid; // From auth middleware
    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const entry = await entries.update(req.params.id, userId, title || '', content);
    res.json(entry);
  } catch (error) {
    if (error.message.includes('not found or unauthorized')) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/entries/:id - Delete entry (if user owns it)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.uid; // From auth middleware
    const entry = await entries.delete(req.params.id, userId);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted', entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
