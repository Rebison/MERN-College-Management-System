import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    level: { type: String, default: "error" },
    message: String,
    stack: String,
    meta: mongoose.Schema.Types.Mixed,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    route: String,
    method: String,
    requestId: String,

    // TTL index: auto-delete after 1 week (7 days)
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 7  // 7 days in seconds
    }
});

const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

export default Log;
