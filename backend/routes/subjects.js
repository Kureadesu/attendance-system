// routes/subjects.js
import express from 'express';
import { getAllSubjects, getSubjectById } from '../controllers/subjectController.js';

const router = express.Router();

// GET /api/subjects - Get all subjects with schedules
router.get('/', getAllSubjects);

// GET /api/subjects/:id - Get subject by ID with schedules
router.get('/:id', getSubjectById);

export default router;
