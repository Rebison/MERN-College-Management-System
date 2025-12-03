import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import Course from "../models/courses.js";
import Program from "../models/program.js";
import departments from "../models/departments.js";

dotenv.config({ path: "../.env" });

async function exportCurriculumStructure() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const courses = await Course.find({})
            .populate("department")
            .lean();

        const curriculumMap = new Map();

        for (const course of courses) {
            const deptCode = course.department?.code || "UNKNOWN";
            const curriculumType = course.category?.toLowerCase() === "elective"
                ? "elective"
                : course.type?.toLowerCase().includes("lab")
                    ? "lab"
                    : "core";

            const regulation = "R2021";     // Default, adjust if you have actual field
            const semester = 5;             // Default, you can edit this later manually

            const key = `${deptCode}-${regulation}-sem${semester}-${curriculumType}`;

            if (!curriculumMap.has(key)) {
                curriculumMap.set(key, {
                    programCode: deptCode,
                    regulation,
                    semester,
                    curriculumType,
                    courseCodes: []
                });
            }

            curriculumMap.get(key).courseCodes.push(course.courseCode);
        }

        const finalOutput = Array.from(curriculumMap.values());

        // Save to file
        const fileContent = `export default ${JSON.stringify(finalOutput, null, 2)};`;
        fs.writeFileSync("../scripts/curriculumData.js", fileContent);

        console.log(`✅ Exported ${finalOutput.length} curriculum blocks to curriculumData.js`);

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Failed to export curriculum", err);
    }
}

exportCurriculumStructure();
