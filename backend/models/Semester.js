import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true       // e.g., 1, 2, ..., 8
  },
  name: {
    type: String,        // e.g., "Semester 6"
    required: true
  },
  type: {
    type: String,
    enum: ["odd", "even"],
    required: true
  },
}, { timestamps: true });

semesterSchema.index({ number: 1 }, { unique: true });

const Semester = mongoose.models.Semester || mongoose.model("Semester", semesterSchema);

export default Semester;
