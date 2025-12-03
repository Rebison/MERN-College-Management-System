import mongoose from "mongoose";
import enrolmentRequest from "../models/enrolmentRequest.js"; // adjust the path
import dotenv from "dotenv";
dotenv.config({ path: '../.env' });
// MongoDB connection
await mongoose.connect(process.env.MONGO_URI);

console.log("✅ Connected to MongoDB");

// Aggregate to find duplicates
const duplicates = await enrolmentRequest.aggregate([
  {
    $group: {
      _id: {
        student: "$student",
        academicSession: "$academicSession",
        semester: "$semester",
        sectionCourse: "$sectionCourse"
      },
      count: { $sum: 1 },
      docs: { $push: "$$ROOT" }
    }
  },
  {
    $match: { count: { $gt: 1 } }
  }
]);

if (duplicates.length === 0) {
  console.log("🎉 No duplicates found in _enrolmentRequest.");
} else {
  console.log("⚠️ Found duplicates in _enrolmentRequest:");
  duplicates.forEach((dup) => {
    console.log(
      `Student: ${dup._id.student}, Session: ${dup._id.academicSession}, Semester: ${dup._id.semester}, SectionCourse: ${dup._id.sectionCourse}, Count: ${dup.count}`
    );
    dup.docs.forEach((doc) => {
      console.log(`   ➝ _id: ${doc._id}, submittedAt: ${doc.submittedAt}`);
    });
  });
}

await mongoose.disconnect();
console.log("🔌 Disconnected from MongoDB");
