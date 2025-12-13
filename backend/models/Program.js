import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
  name: {
    type: String,     // e.g., "Artificial Intelligence and Data Science",
    required: true
  },
  code: {
    type: String, // e.g., "AIDS"
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  degree: {
    type: mongoose.Schema.Types.ObjectId,     // e.g., "B.Tech", "M.Tech"
    ref: "Degree",
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

programSchema.index({ name: 1, department: 1 }, { unique: true });

const Program = mongoose.models.Program || mongoose.model("Program", programSchema);

export default Program;
