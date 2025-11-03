// backend/routes/dashboardRoutes.js
import express from 'express';
import { Student, Subject, Attendance } from '../models/index.js'; // Add your models

const router = express.Router();

// GET /api/dashboard/overview - Get all dashboard data in one call
router.get('/overview', async (req, res) => {
  try {
    // Get all data in parallel for better performance
    const [students, subjects, attendanceSummary] = await Promise.all([
      Student.findAll({
        where: { is_active: true },
        order: [['name', 'ASC']],
        limit: 10 // Only get recent students for dashboard
      }),
      Subject.findAll({
        order: [['name', 'ASC']],
        limit: 8 // Only get main subjects for dashboard
      }),
      // Calculate attendance summary
      calculateAttendanceSummary()
    ]);

    res.json({
      students,
      subjects,
      summary: attendanceSummary,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/dashboard/stats - Get only statistics (lighter payload)
router.get('/stats', async (req, res) => {
  try {
    const [totalStudents, totalSubjects, attendanceStats] = await Promise.all([
      Student.count({ where: { is_active: true } }),
      Subject.count(),
      calculateAttendanceStats()
    ]);

    res.json({
      totalStudents,
      totalSubjects,
      ...attendanceStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Helper function to calculate attendance summary
const calculateAttendanceSummary = async () => {
  // Mock data for now - replace with actual attendance calculations
  return {
    presentToday: 45,
    absentToday: 3,
    lateToday: 2,
    attendanceRate: 90.5,
    totalRecords: 50
  };
};

// Helper function to calculate attendance stats
const calculateAttendanceStats = async () => {
  // Mock data for now
  return {
    presentToday: 45,
    absentToday: 3,
    lateToday: 2,
    attendanceRate: 90.5
  };
};

export default router;