import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/courses.js"; // Adjust path

dotenv.config({ path: "../.env" });

async function countCoursesByDepartment() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const result = await Course.aggregate([
            {
                $group: {
                    _id: "$department", // Group by department string
                    courseCount: { $sum: 1 }
                }
            },
            { $sort: { courseCount: -1 } }
        ]);

        console.log("\n📊 Course count by department:\n");
        result.forEach(dep => {
            console.log(`🧩 ${dep._id}: ${dep.courseCount} courses`);
        });

        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Failed to count courses by department", err);
    }
}

countCoursesByDepartment();
