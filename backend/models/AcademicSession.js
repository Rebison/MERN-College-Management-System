import mongoose from "mongoose";

const academicSessionSchema = new mongoose.Schema({
  year: String,      // e.g., 2024-2025
  startDate: Date,
  endDate: Date,
  isCurrent: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
});

const AcademicSession = mongoose.models.AcademicSession || mongoose.model("AcademicSession", academicSessionSchema);

export default AcademicSession;