// routes/index.js
import express from 'express';
import attendanceRoutes from './attendance.js';
import authRoutes from './auth.js';
import classListRoutes from './classList.js';
import dashboardRoutes from './dashboard.js';
import studentRoutes from './students.js';
import subjectRoutes from './subjects.js';
import { 
  getCurrentSchedule, 
  getScheduleByDay, 
  getWeeklySchedule 
} from '../controllers/scheduleController.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mount existing route modules
router.use('/attendance', attendanceRoutes);
router.use('/auth', authRoutes);
router.use('/classList', classListRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/students', studentRoutes);
router.use('/subjects', subjectRoutes);

// New schedule routes
router.get('/schedules/current', getCurrentSchedule);
router.get('/schedules/day/:day', getScheduleByDay);
router.get('/schedules/weekly', getWeeklySchedule);

export default router;