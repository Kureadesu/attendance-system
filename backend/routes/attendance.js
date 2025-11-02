// routes/attendance.js
import express from 'express';

const router = express.Router();

// GET /api/attendance/summary - Temporary mock data
router.get('/summary', async (req, res) => {
  try {
    // For now, return mock data until you implement attendance tracking
    const summary = {
      absentToday: 0,
      lateToday: 0,
      presentToday: 0,
      totalRecords: 0
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching attendance summary:', error);
    res.status(500).json({ error: 'Failed to fetch attendance summary' });
  }
});

export default router;