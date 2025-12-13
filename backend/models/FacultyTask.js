import mongoose from "mongoose";

const facultyTaskSchema = new mongoose.Schema({
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  role: { type: String, enum: ["mentor", "hod", "dean", "erpCoordinator"], required: true },
  requestType: { type: String, enum: ["FeeVerification", "EnrolmentRequest"], required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Ref to actual request
  status: { type: String, enum: ["pending", "approved", "rejected", "skipped"], default: "pending" },
  remarks: String,
  createdAt: { type: Date, default: Date.now },
  actedAt: Date
});

facultyTaskSchema.index({ faculty: 1, status: 1 }); // For quick dashboard queries

const FacultyTask =
  mongoose.models.FacultyTask || mongoose.model("FacultyTask", facultyTaskSchema);

export default FacultyTask;
