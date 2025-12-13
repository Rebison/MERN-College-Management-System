import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
    name: {
        type: String, // e.g., "Batch 2022"
        required: true
    },
    status: {
        type: String,
        enum: ["active", "graduated", "inactive"],
        default: "active"
    }
});

batchSchema.index({ name: 1 }, { unique: true });

const Batch = mongoose.models.Batch || mongoose.model("Batch", batchSchema);

export default Batch; 
