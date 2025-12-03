import mongoose from "mongoose";
import feeVerification from "../models/feeVerification.js"; // adjust the path
import { config } from "dotenv";
import fs from "fs";

config({ path: '../.env' });
// MongoDB connection
await mongoose.connect(process.env.MONGO_URI);

console.log("✅ Connected to MongoDB");
const report = {};
// Aggregate to find duplicates
const duplicates = await feeVerification.aggregate([
    {
        $group: {
            _id: {
                student: "$student",
                academicSession: "$academicSession",
                semester: "$semester",
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
    console.log("🎉 No duplicates found.");
} else {
    console.log("⚠️ Found duplicates:");
    duplicates.forEach((dup) => {
        console.log(
            `Student: ${dup._id.student}, Session: ${dup._id.academicSession}, Semester: ${dup._id.semester}, Count: ${dup.count}`
        );
        dup.docs.forEach((doc) => {
            console.log(`   ➝ _id: ${doc._id}, createdAt: ${doc.createdAt}`);
        });
    });
    report.feeVerification = duplicates.map((dup) => ({
        key: dup._id,
        totalCount: dup.count,
        documents: dup.docs.map((doc) => ({
            _id: doc._id,
            student: doc.student,
            academicSession: doc.academicSession,
            semester: doc.semester,
            status: doc.status,
            createdAt: doc.createdAt,
            approvedAt: doc.approvedAt
        }))
    }));
}
const filePath = "./duplicates_fee_report.json";
fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

await mongoose.disconnect();
console.log("🔌 Disconnected from MongoDB");
