import mongoose from "mongoose";

const enrolmentRequestSchema = new mongoose.Schema({
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
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true
  },
  sectionCourse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SectionCourse",
    required: true
  },
  selectedCourses: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
      },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
      }
    }
  ],
  feeVerification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeVerification",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "erpApproved", "approved", "rejected"],
    default: "pending"
  },
  approvals: [
    {
      role: { type: String, required: true },
      faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true
      },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected", "skipped"],
        default: "pending"
      },
      remarks: String,
      actedAt: Date
    }
  ],
  approvedAt: Date,
}, { timestamps: true });

enrolmentRequestSchema.index({ student: 1, academicSession: 1, semester: 1 }, { unique: true });

const EnrolmentRequest =
  mongoose.models.EnrolmentRequest ||
  mongoose.model("EnrolmentRequest", enrolmentRequestSchema);

export default EnrolmentRequest;
