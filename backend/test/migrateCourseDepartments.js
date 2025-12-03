import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../models/courses.js";
import Department from "../models/departments.js";

dotenv.config({ path: "../.env" });

const departmentMapping = {
    "CSE": "CSE",
    "IBM": "CSE",
    "IOA": "CSE",
    "UpGrad": "CSE",
    "ECE": "ECE",
    "ECE/EEE": "EEE",
    "Mech": "MECH",
    "Civil": "CIVIL",
    "Chemistry": "CHEM",
    "Maths": "MATHS",
    "NCC/NSS/CSE": "NCC/NSS/CSE"
};

async function normalizeLegacyDepartments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Use lean() to access all fields, even outdated ones
        const rawCourses = await mongoose.connection.db.collection("Courses").find({}).toArray();

        let updated = 0;
        let skipped = 0;

        for (const raw of rawCourses) {
            const legacyDept = raw.department; // string like "CSE"
            const mappedCode = departmentMapping[legacyDept];

            if (!mappedCode) {
                console.warn(`⚠️ Unknown department mapping for: ${legacyDept}`);
                skipped++;
                continue;
            }

            const deptDoc = await Department.findOne({ code: mappedCode });
            if (!deptDoc) {
                console.warn(`❌ Department document not found for code: ${mappedCode}`);
                skipped++;
                continue;
            }

            // Now update using the Mongoose model
            await Course.updateOne(
                { _id: raw._id },
                { $set: { department: deptDoc._id } }
            );

            updated++;
        }

        console.log(`\n✅ Migration complete. Updated: ${updated}, Skipped: ${skipped}`);

        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Migration failed", err);
    }
}

normalizeLegacyDepartments();
