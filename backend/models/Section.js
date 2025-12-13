import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true
  },
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty"
  },
  studentCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
});

const Section = mongoose.models.Section || mongoose.model("Section", sectionSchema);

export default Section;
