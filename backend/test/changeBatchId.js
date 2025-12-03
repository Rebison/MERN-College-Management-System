import mongoose from 'mongoose';
import Section from '../models/section.js'; // adjust path
import Batch from '../models/batch.js';
import path from 'path';
import { Types } from 'mongoose';
import { config } from 'dotenv';
import fs from 'fs';
config({ path: "../.env" })

await mongoose.connect(process.env.MONGO_URI);

// Load section.json and batch.json
const sectionData = JSON.parse(fs.readFileSync(path.resolve('./section.json'), 'utf-8'));
const oldBatchData = JSON.parse(fs.readFileSync(path.resolve('./batch.json'), 'utf-8'));

const oldBatchMap = {};
for (const batch of oldBatchData) {
  oldBatchMap[batch._id] = batch;
}

const newSections = [];

for (const section of sectionData) {
  const oldBatchId = section.batch;
  const oldBatch = oldBatchMap[oldBatchId];

  if (!oldBatch) {
    console.warn(`❌ No old batch info found for section ${section.name}, batchId: ${oldBatchId}`);
    continue;
  }

  const matchedNewBatch = await Batch.findOne({
    name: oldBatch.name,
    program: oldBatch.program,
    startYear: oldBatch.startYear,
    regulation: oldBatch.regulation
  });

  if (!matchedNewBatch) {
    console.warn(`❌ No matching new batch found for ${oldBatch.name} (${oldBatchId})`);
    continue;
  }

  newSections.push({
    name: section.name,
    program: section.program,
    department: section.department,
    mentor: section.mentor,
    studentCount: section.studentCount,
    isActive: section.isActive,
    batch: matchedNewBatch._id
  });
}

// Insert all processed sections
if (newSections.length > 0) {
  const inserted = await Section.insertMany(newSections);
  console.log(`✅ Successfully inserted ${inserted.length} sections.`);
} else {
  console.log(`⚠️ No sections inserted. Please check for mismatches.`);
}

await mongoose.disconnect();