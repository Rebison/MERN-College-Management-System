import mongoose from "mongoose";

const exportJobSchema = new mongoose.Schema({
  exportType: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  filters: { type: Object, default: {} },
  filePath: { type: String },
  error: { type: String },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

const ExportJob = mongoose.models.ExportJob || mongoose.model("ExportJob", exportJobSchema);

export default ExportJob;