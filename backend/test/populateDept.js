import Departments from "../models/Departments.js";
import Faculty from "../models/Faculty.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error);
    return;
  }
  

  try {
    const facultyData = await Faculty.find({ department: "CSE" });
    console.log(facultyData);
    const reducedFac = [];
    for (let i = 0; i < facultyData.length; i++) {
      if (facultyData[i].role === "faculty" | facultyData[i].role === "assistantHod") {
        reducedFac.push(facultyData[i]._id);
      }
    }

    const departmentData = {
      deptName: "CSE",
      hodId: "67dad7e53e53eaad02c7fea6",
      deanId: "67dad7e53e53eaad02c7fea5",
      faculty: reducedFac,
    }

    await Departments.create(departmentData);
    console.log("Department data populated successfully");
  } catch (error) {
    console.error("Error fetching faculty data:", error);
  } finally {
    mongoose.connection.close();
  }
}

main();
