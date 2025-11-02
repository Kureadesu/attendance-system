// routes/students.js
import express from 'express';
import { Student } from '../models/index.js';

const router = express.Router();

// GET /api/students - Get all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// GET /api/students/:studentNumber - Get single student
router.get('/:studentNumber', async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { student_number: req.params.studentNumber }
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

export default router;