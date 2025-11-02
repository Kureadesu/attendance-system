// routes/subjects.js
import express from 'express';
import { getAllSubjects, createSubject } from '../controllers/subjectController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getAllSubjects);
router.post('/', authenticateToken, createSubject);

export default router;