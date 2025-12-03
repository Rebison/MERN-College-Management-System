// routes/v2/academicSessionRoutes.js
import express from 'express';
import { viewAcademicSessionsByBatch, viewAllAcademicSessions } from '#controllers/academicSessionController.js';

const router = express.Router();
router.post('/viewAcademicSessionsByBatch', viewAcademicSessionsByBatch('v2'));
router.get('/viewAcademicSessions', viewAllAcademicSessions('v2'));
export default router;
