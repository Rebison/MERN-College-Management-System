// services/academicSession/v2/academicSessionService.js
// Don't use the below code just make use of v1 service functions if there are no changes in business logic
// If there are changes in business logic then override the function here and export the rest of the functions from v1 service
import * as v1Service from '#services/v1/academicSessionService.js';
import { academicSession } from '#models/index.js';
import AppError from '#middlewares/AppError.js';

// Override function with new business logic
export async function getAcademicSessionsByBatch(batchId) {
  if (!batchId) throw new AppError('batchId is required', 400);
  
  // Example: populate faculty info in v2
  return academicSession
    .find({ batch: batchId })
    .populate('faculty')
    .lean();
}

// Reuse unchanged function from v1
export const getAllAcademicSessions = v1Service.getAllAcademicSessions;

// Never try to use this service function as it is just for testing purpose and should not be called in production