// routes/index.js
import express from 'express';
import attendanceRoutes from './attendance.js';
import authRoutes from './auth.js';
import classListRoutes from './classList.js';
import dashboardRoutes from './dashboard.js';
import studentRoutes from './students.js';
import subjectRoutes from './subjects.js';
import scheduleRoutes from './schedule.js';
import logRoutes from './logs.js';

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
router.use('/schedules', scheduleRoutes);
router.use('/logs', logRoutes);

export default router;