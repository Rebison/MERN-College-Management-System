import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/courses.js";

dotenv.config({ path: "../.env" });

async function setCourseIsActiveTrue() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const result = await Course.updateMany(
            { isActive: { $exists: false } },
            { $set: { isActive: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} courses to isActive: true`);

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Failed to update courses", err);
    }
}

setCourseIsActiveTrue();
