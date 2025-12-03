import { connect } from "mongoose";
import pkg from "xlsx";
const { readFile, utils, writeFile } = pkg;
import { faculty } from "../models/index.js"; 
import dotenv from "dotenv"
dotenv.config({path:"../.env"})

async function migrateFacultyIDS() {
  try {
    const workbook = readFile("D:\\Aswa\\Database\\Faculty\\Refined Faculty.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(sheet);

    const faculties = await faculty.find();

    faculties.forEach(faculty => {
      const record = jsonData.find(row => row.Faculty === faculty.name); 
      if (record) {
        record._id = faculty._id.toString();
      }
    });

    const newSheet = utils.json_to_sheet(jsonData);
    workbook.Sheets[workbook.SheetNames[0]] = newSheet;
    writeFile(workbook, "D:\\Aswa\\Database\\Faculty\\Refined Faculty.xlsx");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  }
}

connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    migrateFacultyIDS();
  })
  .catch(err => console.error("MongoDB connection error:", err));
