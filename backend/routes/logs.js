// routes/logs.js
import express from 'express';
import { getLogs, getLogStats } from '../controllers/logController.js';

const router = express.Router();

// Get all logs with filtering
// GET /api/logs?limit=50&offset=0&action=create&startDate=2025-01-01&endDate=2025-12-31
router.get('/', getLogs);

// Get log statistics and recent activity
// GET /api/logs/stats?period=7
router.get('/stats', getLogStats);

export default router;
