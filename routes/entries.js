const express = require('express');
const router = express.Router();
const { entries } = require('../db/firebase-database');

// GET /api/entries - List all entries (with optional search)
router.get('/', async (req, res) => {
  try {
    const search = req.query.search || '';
    const allEntries = await entries.getAll(search);
    res.json(allEntries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/entries/:id - Get single entry
router.get('/:id', async (req, res) => {
  try {
    const entry = await entries.getById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/entries - Create new entry
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const entry = await entries.create(title || '', content);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/entries/:id - Update entry
router.put('/:id', async (req, res) => {
  try {
    const existing = await entries.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    const { title, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const entry = await entries.update(req.params.id, title || '', content);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/entries/:id - Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await entries.delete(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted', entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
