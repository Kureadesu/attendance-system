// routes/attendance.js
import express from 'express';
import { 
  markAttendance, 
  getAttendanceSummary, 
  getClassAttendance,
  getAttendanceTrend 
} from '../controllers/attendanceController.js';

const router = express.Router();

// Mark attendance with schedule validation
// POST /api/attendance/mark
router.post('/mark', markAttendance);

// Get attendance summary with date range filtering
// GET /api/attendance/summary?range=today|week|month|custom
router.get('/summary', getAttendanceSummary);

// Get class attendance for specific date and subject
// GET /api/attendance/class?date=2025-11-04&subjectId=1
router.get('/class', getClassAttendance);

// Get 7-day attendance trend
// GET /api/attendance/trend
router.get('/trend', getAttendanceTrend);

export default router;