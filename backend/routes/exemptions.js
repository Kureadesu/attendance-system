// routes/exemptions.js
import express from 'express';
import {
  createExemption,
  getExemptions,
  deleteExemption,
  checkExemption
} from '../controllers/exemptionController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All exemption routes require authentication
router.use(authenticateToken);

// Create exemption
// POST /api/exemptions
router.post('/', createExemption);

// Get exemptions with optional filtering
// GET /api/exemptions?subjectId=1&startDate=2025-01-01&endDate=2025-01-31
router.get('/', getExemptions);

// Check if subject/schedule is exempted on a date
// GET /api/exemptions/check?subjectId=1&scheduleId=1&date=2025-01-01
router.get('/check', checkExemption);

// Delete exemption
// DELETE /api/exemptions/:id
router.delete('/:id', deleteExemption);

export default router;