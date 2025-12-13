import mongoose from "mongoose";

const FacultyApprovalSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["hod", "dean", "deanAcademics"],
        required: true
    },
    approver: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvedAt: { type: Date },
    remark: { type: String },
})

const facultyPermissionSchema = new mongoose.Schema({
    facultyName: { type: String, required: true },
    facultyID: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    type: {
        type: String,
        enum: ["onDuty", "leave", "vacation"],
        required: true
    },
    requestDate: { type: Date, default: Date.now },
    approvals: [FacultyApprovalSchema],
    details: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
        default: {}
    }
}, { timestamps: true });

const FacultyPermission = mongoose.models.FacultyPermission || mongoose.model("FacultyPermission", facultyPermissionSchema);

export default FacultyPermission;
