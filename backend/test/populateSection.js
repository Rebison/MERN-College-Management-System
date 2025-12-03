import mongoose from "mongoose";
import dotenv from "dotenv";
import Section from "../models/Section.js";
import Faculty from "../models/Faculty.js"; 

dotenv.config({ path: "../.env" });

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected");
} catch (error) {
  console.log("DB Connection Error:", error);
}

const U23BatchSections = [
  "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", 
  "AI + DS + IOT", "AIML", "CS", "IOA-1", "IOA-2", "IBM + UPGRAD"
];

const U23BatchMentors = [
  "Mrs. M. Revathi", "Mrs. Kavitha", "Mrs. R. Jagadeeswari",
  "Ms. V. Kanchana", "Mr. V. Ethirajulu", "Dr. K. Baalaji",
  "Ms. D. Bhavana", "Ms. K. Kotteswari", "Ms. L. Shalini",
  "Ms. R. Prathiba", "Mr. R. Selva Ganesh", "Ms. N. Kameshwari",
  "Ms. K. Muthulakshmi", "Dr. K. V. Shiny", "Ms. P. Abirami",
  "Mrs. T. Shakila", "Mrs. R. Vaishali", "Mrs. K. Sathiya Priya"
];

const U22BatchSections = [
  "A", "B", "C", "D", "E", "F", "G", "H", "J",
  "K", "L", "M", "N", "AI", "AIML", "CS", "DS", "IOT", "IBM", "IOA"
];

const U22BatchMentors = [
  "Mrs. Krithika",
  "Mrs. T. Nithya",
  "Mrs. N. Fathima Shrene Shifna",
  "Mrs. S. Salini",
  "Ms. R. Femimol",
  "Mrs. B. N. Swarna Jyothi",
  "Mr. R. Azhagusundaram",
  "Ms. Lethisia Nithiya",
  "Mrs. S. Sarjun Beevi",
  "Mr. S. Ramadoss",
  "Dr. K. Sivaraman",
  "Mrs. S. K. Uma Maheshwari",
  "Mrs. K. Anuranjani",
  "Mrs. J. Janisha",
  "Mrs. S. Pavithra",
  "Mr. K. Sudhakar",
  "Ms. Poovizhi",
  "Mrs. S. Jenita Christy",
  "Dr. K. Upendra Babu",
  "Mrs. N. Anithaa Kingsly"
];

try {
  for (let i = 0; i < U23BatchMentors.length; i++) {
    const mentor = await Faculty.findOne({ name: U23BatchMentors[i] });

    if (!mentor) {
      console.log(`Mentor ${U23BatchMentors[i]} not found`);
      continue;
    }

    const existingSection = await Section.findOne({ name: U23BatchSections[i], batch: "U23" });
    if (existingSection) {
      console.log(`Section ${U23BatchSections[i]} already exists, skipping...`);
      continue;
    }

    const sectionData = {
      name: U23BatchSections[i],
      batch: "U23",
      department: new mongoose.Types.ObjectId("67daf66e7dfbdaa433604b04"), 
      sectionMentor: mentor._id
    };

    await Section.create(sectionData);
    console.log(`Created section: ${U23BatchSections[i]} with mentor ${U23BatchMentors[i]}`);
  }
} catch (error) {
  console.log("Error in section creation:", error);
}

try {
  for (let i = 0; i < U22BatchMentors.length; i++) {
    const mentor = await Faculty.findOne({ name: U22BatchMentors[i] });

    if (!mentor) {
      console.log(`Mentor ${U22BatchMentors[i]} not found`);
      continue;
    }

    const existingSection = await Section.findOne({ name: U22BatchSections[i], batch: "U22" });
    if (existingSection) {
      console.log(`Section ${U22BatchSections[i]} already exists, skipping...`);
      continue;
    }

    const sectionData = {
      name: U22BatchSections[i],
      batch: "U22",
      department: new mongoose.Types.ObjectId("67daf66e7dfbdaa433604b04"), 
      sectionMentor: mentor._id
    };

    await Section.create(sectionData);
    console.log(`Created section: ${U22BatchSections[i]} with mentor ${U22BatchMentors[i]}`);
  }
} catch (error) {
  console.log("Error in section creation:", error);
}