const mongoose = require("mongoose");
const xlsx = require("xlsx");
const Student = require("../models/student"); 
const StudentDep = require("../models/StudentDep");   
require("dotenv").config({path:"../.env"})

async function migrateParentData() {
  try {
    const workbook = xlsx.readFile("D:\\Aswa\\Database\\Student Database Reduced.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parentData = xlsx.utils.sheet_to_json(sheet);

    const students = await Student.find({});

    let parentsToInsert = [];

    for (let student of students) {
      let regNo = student.regNo.trim();

      let parentInfo = parentData.find(row => row["Roll No./Register No."].toString().trim() === regNo);

      if (parentInfo) {
        parentsToInsert.push({
          studentId: student._id,
          registerNumber: regNo,
          father:{
            name: parentInfo["Father Name"],
            phone: parentInfo["Father Address Phone Number"],
            altPhone: parentInfo["Father Address Mobile Number"],
            email: ""
          },
          mother:{
            name: parentInfo["Mother Name"],
            phone: parentInfo["Mother Address Phone Number"],
            altPhone: parentInfo["Mother Address Mobile Number"],
            email: ""
          }
        });
      }
    }

    if (parentsToInsert.length > 0) {
      await StudentDep.insertMany(parentsToInsert);
      console.log(`${parentsToInsert.length} parent records inserted successfully.`);
    } else {
      console.log("No matching parent records found.");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close();
  }
}

// Connect to MongoDB and start migration
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    migrateParentData();
  })
  .catch(err => console.error("MongoDB connection error:", err));
