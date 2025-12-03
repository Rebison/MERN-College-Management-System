import mongoose from "mongoose";
import dotenv from "dotenv";
import Section from "../models/section.js";
import Batch from "../models/batch.js";
import Program from "../models/program.js";
import Department from "../models/departments.js";

dotenv.config({ path: "../.env" });

async function migrateSections() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Step 1: Load Batch References
    const batchU22 = await Batch.findOne({ name: "Batch 2022" }).populate("program");
    const batchU23 = await Batch.findOne({ name: "Batch 2023" }).populate("program");

    if (!batchU22 || !batchU23) {
      console.error("❌ Missing Batch 2022 or 2023");
      return;
    }

    // Step 2: Build Program → Department Map
    const programDeptMap = {};
    const allPrograms = await Program.find({}).populate("department");
    allPrograms.forEach(p => {
      programDeptMap[p._id.toString()] = p.department._id;
    });

    // Step 3: Load All Sections
    const allSections = await Section.find({}).lean();

    let updated = 0;
    let skipped = 0;

    for (const section of allSections) {
      if (typeof section.batch === "string") {
        let batchObj;

        if (section.batch === "U22") batchObj = batchU22;
        else if (section.batch === "U23") batchObj = batchU23;
        else {
          console.warn(`⚠️ Unknown batch: ${section.batch}`);
          skipped++;
          continue;
        }

        const programId = batchObj.program._id;
        const departmentId = programDeptMap[programId.toString()];

        if (!departmentId) {
          console.warn(`❌ Could not resolve department for program ${programId}`);
          skipped++;
          continue;
        }

        const updateFields = {
          batch: batchObj._id,
          program: programId,
          department: departmentId,
          studentCount: section.studentCount || 0,
          isActive: section.isActive !== false
        };

        // ✅ Migrate mentor field
        if (section.sectionMentor && !section.mentor) {
          updateFields.mentor = section.sectionMentor;
        }

        // Perform update
        await Section.updateOne({ _id: section._id }, { $set: updateFields });

        // Remove old field if it exists
        if (section.sectionMentor) {
          await Section.updateOne({ _id: section._id }, { $unset: { sectionMentor: "" } });
        }

        console.log(`✅ Updated section: ${section.name} (${section.batch})`);
        updated++;
      }
    }

    console.log(`\n🎯 Section Migration Complete — Updated: ${updated}, Skipped: ${skipped}`);

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (err) {
    console.error("❌ Migration failed", err);
  }
}

migrateSections();
