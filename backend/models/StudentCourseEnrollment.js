import mongoose from "mongoose";

const studentCourseEnrollmentSchema = new mongoose.Schema({
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
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  type: {
    type: String,
    enum: ["regular", "arrear", "bridge", "manual", "elective", "openElective"],
    default: "regular"
  },
  status: {
    type: String,
    enum: ["active", "completed", "dropped", "failed"],
    default: "active"
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    default: null
  },
  remarks: String
}, { timestamps: true });

const StudentCourseEnrollment =
  mongoose.models.StudentCourseEnrollment ||
  mongoose.model("StudentCourseEnrollment", studentCourseEnrollmentSchema);

export default StudentCourseEnrollment;