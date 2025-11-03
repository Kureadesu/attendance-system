import express from 'express';
import Student from '../models/Student.js';
const router = express.Router();

// GET /api/classlist - Get all class list entries
router.get('/', async (req, res) => {
    try {
        const classList = await Student.findAll({
            order: [['name', 'ASC']]
        });
        res.json(classList);
    } catch (error) {
        console.error('Error fetching class list:', error);
        res.status(500).json({ error: 'Failed to fetch class list' });
    }
});

export default router;