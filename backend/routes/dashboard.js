// routes/dashboard.js
import express from 'express';
import { getAttendanceSummary } from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/stats', getAttendanceSummary);

export default router;