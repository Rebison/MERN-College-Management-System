// services/academicSession/v1/academicSessionService.js
import { AcademicSession } from '#models/index.js';
import AppError from '#utils/AppError.js';

export async function getAcademicSessionsByBatch({ batchId }) {
  const sessions = await AcademicSession
    .find({ batch: batchId, isActive: true })
    .lean();
  if (!sessions.length) {
    throw new AppError('No active academic sessions found for the given batch', 404);
  }
  return sessions;
}

export async function getAllAcademicSessions() {
  const sessions = await AcademicSession.find();
  if (!sessions.length) {
    throw new AppError("No academic sessions found", 404);
  }
  return sessions;
}