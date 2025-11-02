// routes/students.js
import express from 'express';
import { getAllStudents, getStudentAttendance } from '../controllers/studentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllStudents);
router.get('/:studentNumber/attendance', authenticateToken, getStudentAttendance);

export default router;