import mongoose from "mongoose";
import batch from "../models/batch.js"; // adjust path as needed
import faculty from "../models/faculty.js"; // or user model if that's where faculty are
import dotenv from "dotenv";

dotenv.config({path: "../.env"})
await mongoose.connect(process.env.MONGO_URI);

// Example list of batch IDs and coordinator user IDs
const coordinatorData = [
  {
    batchCode: "Batch 2022", // or _id if you use ObjectId
    coordinators: [
      { role: "erpCoordinator", userEmail: "mathucse04@gmail.com" },
    ]
  },
  {
    batchCode: "Batch 2023",
    coordinators: [
      { role: "erpCoordinator", userEmail: "sathiyapriya.cse@bharathuniv.ac.in" }
    ]
  }
];

for (const entry of coordinatorData) {
  const targetBatch = await batch.findOne({ name: entry.batchCode }); // or findById if using ObjectId
  if (!targetBatch) {
    console.warn(`Batch ${entry.batchCode} not found`);
    continue;
  }

  const newCoordinators = [];

  for (const coord of entry.coordinators) {
    const facultyUser = await faculty.findOne({ email: coord.userEmail });
    if (!facultyUser) {
      console.warn(`Faculty with email ${coord.userEmail} not found`);
      continue;
    }

    newCoordinators.push({
      role: coord.role,
      faculty: facultyUser._id
    });
  }

  targetBatch.coordinators.push(...newCoordinators);
  await targetBatch.save();
  console.log(`✅ Batch ${entry.batchCode} updated with coordinators`);
}

await mongoose.disconnect();
