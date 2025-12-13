import mongoose from "mongoose";

const feeVerificationSchema = new mongoose.Schema({
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
  receiptUrl: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
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
        enum: ["Pending", "Approved", "Rejected", "Skipped"],
        default: "Pending"
      },
      remarks: String,
      actedAt: Date
    }
  ],
  approvedAt: Date,
}, { timestamps: true });

feeVerificationSchema.index({ student: 1, academicSession: 1, semester: 1 }, { unique: true });

const FeeVerification =
  mongoose.models.FeeVerification ||
  mongoose.model("FeeVerification", feeVerificationSchema);

export default FeeVerification;
