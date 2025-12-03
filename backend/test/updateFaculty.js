import { faculty, departments } from "../models/index.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({path:"../.env"});

try{
  mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");  
}catch(err){
  console.error("Error connecting to MongoDB:", err);
  process.exit(1);  
}

const updateFaculty = async() => {
  const facultyData = await faculty.find({});

  for(const fac of facultyData) {
    const depart = fac.department;

    const departmentData = await departments.findOne({ code: depart });
    if (!departmentData) {
      console.log(`Department ${depart} not found for faculty ${fac.name}`);
      continue;
    }

    fac.departmentID = departmentData._id;
    await fac.save();
    console.log(`Updated faculty ${fac.name} with department ID ${departmentData._id}`);
  }
};

const updateFaculty2 = async() => {
  const facultyData = await faculty.find({});
  console.log(facultyData)
}

updateFaculty2().then(()=>{
  console.log("Faculty update completed successfully.");
  mongoose.connection.close();
})