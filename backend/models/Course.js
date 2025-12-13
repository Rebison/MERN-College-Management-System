import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["Theory", "Lab", "Theory + Lab", "Project", "Seminar", "Others"],
    default: "Theory"
  },
  category: {
    type: String,
    enum: ["Core", "Open Elective", "Functional Elective", "Professional Elective", "Mandatory", "Others"],
    default: "Core"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

courseSchema.index({ courseCode: 1, department: 1 }, { unique: true });

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;
