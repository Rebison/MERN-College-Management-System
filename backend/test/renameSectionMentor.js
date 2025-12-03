import mongoose from "mongoose";
import dotenv from "dotenv";
import Section from "../models/section.js";

dotenv.config({ path: "../.env" });

async function renameSectionMentor() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const sections = await Section.find({
            sectionMentor: { $exists: true }
        });

        const result = await Section.find({ mentor: { $exists: true } });
        console.log("Mentor field found in:", result.length); // ✅ Should show 39+

        const legacy = await Section.find({ sectionMentor: { $exists: true } });
        console.log("Old sectionMentor fields remaining:", legacy.length); // ❌ Should be 0



        let updated = 0;

        for (const section of sections) {
            const updateData = {
                mentor: section.sectionMentor
            };

            await Section.updateOne(
                { _id: section._id },
                {
                    $set: updateData,
                    $unset: { sectionMentor: "" }
                }
            );

            console.log(`✅ Renamed mentor for section: ${section.name}`);
            updated++;
        }

        console.log(`\n🎯 Mentor field renamed in ${updated} section(s)`);
        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
    } catch (err) {
        console.error("❌ Failed to rename sectionMentor", err);
    }
}

renameSectionMentor();
