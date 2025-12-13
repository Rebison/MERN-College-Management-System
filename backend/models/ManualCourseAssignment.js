import mongoose from "mongoose";

const manualCourseAssignmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  academicSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicSession",
    required: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    default: null
  },
  action: {
    type: String,
    enum: ["add", "remove"],
    required: true
  },
  reason: {
    type: String
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true }
}, { timestamps: true });

manualCourseAssignmentSchema.index({ student: 1, academicSession: 1, semester: 1, course: 1 }, { unique: true });

const ManualCourseAssignment =
  mongoose.models.ManualCourseAssignment ||
  mongoose.model("ManualCourseAssignment", manualCourseAssignmentSchema);

export default ManualCourseAssignment;
