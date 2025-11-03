// routes/subjects.js
import express from 'express';
import { Subject } from '../models/index.js';

const router = express.Router();

// GET /api/subjects - Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// GET /api/subjects/:name - Get subject by name
router.get('/:name', async (req, res) => {
  try {
    const subject = await Subject.findOne({
        where: { name: req.params.name }
    });
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    res.json(subject);
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

export default router;