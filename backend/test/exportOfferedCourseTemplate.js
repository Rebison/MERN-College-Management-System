import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";

import Course from "../models/courses.js";
import Section from "../models/section.js";
import Faculty from "../models/faculty.js";
import Batch from "../models/batch.js";

dotenv.config({ path: "../.env" });

async function exportOfferedCourseTemplate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const courses = await Course.find({ isActive: true }).lean();
        const sections = await Section.find({ isActive: true }).lean();
        const faculties = await Faculty.find({}).lean();
        const batches = await Batch.find({ isActive: true }).lean();

        const output = [];

        for (let i = 0; i < Math.min(courses.length, 5); i++) {
            const course = courses[i];
            const batch = batches[i % batches.length];
            const section = sections[i % sections.length];
            const faculty = faculties[i % faculties.length];

            output.push({
                courseCode: course.courseCode,
                courseId: course._id,
                academicSessionId: "6870164fadb976a34ec6a500",
                batches: [batch._id],
                instructors: [
                    {
                        faculty: faculty._id,
                        section: "67daf81a87c2b452a8dde26a"
                    }
                ],
                startDate: "2025-07-01",
                endDate: "2025-12-31"
            });
        }

        const template = `export default ${JSON.stringify(output, null, 2)};`;

        fs.writeFileSync("../scripts/offeredCoursesData.js", template);
        console.log("✅ Exported to scripts/offeredCoursesData.js");

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Failed to export offered courses template", err);
    }
}

exportOfferedCourseTemplate();
