// routes/attendance.js
import express from 'express';
import { 
  markAttendance, 
  getAttendanceSummary, 
  getClassAttendance 
} from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateAttendance } from '../middleware/validation.js';

const router = express.Router();

router.post('/mark', authenticateToken, validateAttendance, markAttendance);
router.get('/summary', authenticateToken, getAttendanceSummary);
router.get('/', authenticateToken, getClassAttendance);

export default router;