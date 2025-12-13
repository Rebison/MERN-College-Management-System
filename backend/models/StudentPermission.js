import mongoose from "mongoose";

const StudentApprovalStepSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["mentor", "assistantHod", "hod", "placementCell", "dean", "deanAcademics", "certificateSection", "office"],
    required: true
  },
  approver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "skipped"],
    default: "pending"
  },
  actedAt: Date,
  remarks: String,
});

const studentPermissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },
  regNo: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      "onDuty",
      "leave",
      "bonafide",
      "mediumOfInstruction",
      "internshipApproval",
      "letterHead",
      "idCard"
    ],
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  approvals: [StudentApprovalStepSchema],
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  documents: [
    {
      name: String,
      filePath: String,
    },
  ]
}, { timestamps: true });

const StudentPermission =
  mongoose.models.StudentPermission ||
  mongoose.model("StudentPermission", studentPermissionSchema);

export default StudentPermission;
