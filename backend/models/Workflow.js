import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema({
    name: {
        type: String,   // e.g., "Enrollment Workflow", "Bonafide Approval"
        required: true
    }, 

    requestType: {
        type: String,
        required: true
    },

    subType: String, // e.g., "bonafide", "leave", etc.
    userType: String, // e.g., "student", "faculty", etc.
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },

    roleFlow: [
        {
            role: {
                type: String,
                required: true,
            },
            mandatory: { type: Boolean, default: true },
            level: Number
        }
    ],

    isActive: { type: Boolean, default: true }
});

const Workflow = mongoose.models.Workflow || mongoose.model("Workflow", workflowSchema);

export default Workflow;