import { connect } from "mongoose";
import pkg from "xlsx";
const { readFile, utils, writeFile } = pkg;
import { courses } from "../models/index.js"; 
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

async function migrateCourseDetails() {
  try {
    const workbook = readFile("D:\\Aswa\\Database\\Timetable & Courses\\Refined Courses.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const courseData = await courses.find({});

    const jsonData = courseData.map(course => ({
      name: course.courseName,
      code: course.courseCode,
      credits: course.credits,
      department: course.department,
      _id: course._id.toString()
    }));

    const newSheet = utils.json_to_sheet(jsonData);
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;

    writeFile(workbook, "D:\\Aswa\\Database\\Timetable & Courses\\Refined Courses.xlsx");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    migrateCourseDetails();
  })
  .catch(err => console.error("MongoDB connection error:", err));
