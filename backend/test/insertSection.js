import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Section from '../models/section.js'; // ✅ Make sure this points to your Section model
import dotenv from 'dotenv';

dotenv.config({ path: "../.env" });

await mongoose.connect(process.env.MONGO_URI); // 🔁 Replace with your DB

const sectionData = JSON.parse(fs.readFileSync(path.resolve('./section.json'), 'utf-8'));

try {
    const inserted = await Section.insertMany(sectionData);
    console.log(`✅ Successfully inserted ${inserted.length} sections.`);
} catch (error) {
    console.error('❌ Insertion error:', error);
}

await mongoose.disconnect();
