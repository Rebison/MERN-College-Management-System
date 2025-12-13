import mongoose from "mongoose";

const sectionCourseSchema = new mongoose.Schema({
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: true
  },
  courses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true
    }
  }]
}, { timestamps: true });

const SectionCourse = mongoose.models.SectionCourse || mongoose.model("SectionCourse", sectionCourseSchema);

export default SectionCourse;
