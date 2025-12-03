import { student, academicSession, departments, batch, section, semester, program } from "../models/index.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

try {
  mongoose.connect(process.env.MONGO_URI).then(
    console.log("MongoDB Connected")
  );
} catch (err) {
  console.error("Error connecting to Database: ", err);
}

const updateDepartmentID = async () => {
  const studentData = await student.find({});

  for (const stu of studentData) {
    const dept = stu.department;

    const deptDoc = await departments.findOne({ code: dept }, { _id: 1 });

    if (deptDoc && deptDoc._id) {
      const updatedStudent = await student.updateOne(
        { _id: stu._id },
        { $set: { departmentID: deptDoc._id } }
      );

      if (updatedStudent.modifiedCount > 0) {
        console.log(`Updated department for student ${stu.fullName}`);
      } else {
        console.log(`No updates made for student ${stu.fullName}`);
      }
    }
  }
};

const updateBatchID = async () => {
  const studentData = await student.find({});

  for (const stu of studentData) {
    const bat = stu.regNo.slice(0, 3);

    if (bat) {
      if (bat === "U22"){
        const batchDoc = await batch.findOne({ name: "Batch 2022" }, { _id : 1 });
        if ( batchDoc && batchDoc._id ){
          const updatedStudent = await student.updateOne(
            { _id: stu._id },
            { $set: { batch: batchDoc._id } }
          );

          if (updatedStudent.modifiedCount > 0) {
            console.log(`Updated batch for student ${stu.fullName}, Batch Code: ${bat}`);
          } else {
            console.log(`No updates made for student ${stu.fullName}, Batch Code: ${bat}`);
          }
        }
      } else if (bat === "U23") {
        const batchDoc = await batch.findOne({ name: "Batch 2023" }, { _id : 1 });
        if ( batchDoc && batchDoc._id ){
          const updatedStudent = await student.updateOne(
            { _id: stu._id },
            { $set: { batch: batchDoc._id } }
          );

          if (updatedStudent.modifiedCount > 0) {
            console.log(`Updated batch for student ${stu.fullName}, Batch Code: ${bat}`);
          } else {
            console.log(`No updates made for student ${stu.fullName}, Batch Code: ${bat}`);
          }
        }
      }
    }
  }
};

const updateSectionID = async () => {
  const studentData = await student.find({});

  for (const stu of studentData) {
    // const sec = stu.section;
    // const batch = stu.batch;

    // if (!sec || !batch) {
    //   console.log(`Skipping student ${stu.fullName} due to missing section or batch`);}

    // const secDoc = await section.findOne({ name: sec, batch : batch }, { _id: 1 });

    // if (secDoc && secDoc._id) {
    //   const updatedStudent = await student.updateOne(
    //     { _id: stu._id },
    //     { $set: { sectionID: secDoc._id } }
    //   );

    //   if (updatedStudent.modifiedCount > 0) {
    //     console.log(`Updated section for student ${stu.fullName}`);
    //   } else {
    //     console.log(`No updates made for student ${stu.fullName}`);
    //   }
    // }

    const secID = stu.sectionID;

    if (!secID) {
      console.log(`Skipping student ${stu.fullName} due to missing sectionID`);
      continue;
    }

    stu.section = secID;
    await stu.save();
    console.log(`Updated sectionID for student ${stu.fullName} to ${secID}`);
  }
}

const updateSemesterAndAcademicYear = async () => {
  const semesterData = await semester.findOne({ number: 7 }, { _id: 1 });
  const yearData = await academicSession.findOne({ name: "2025-26 Odd Semester" });

  if (!semesterData || !semesterData._id) {
    console.log("Semester data not found.");
    return;
  }

  if (!yearData || !yearData._id) {
    console.log("Academic year data not found.");
    return;
  }

  const studentData = await student.find({});

  for (const stu of studentData) {
    if (!stu || stu.program !== "B.Tech-Computer Science and Engineering") continue;

    const update = {
      currentSemester: semesterData._id,
      currentAcademicYear: yearData._id
    };

    const updatedStudent = await student.updateOne(
      { _id: stu._id },
      { $set: update }
    );

    if (updatedStudent.modifiedCount > 0) {
      console.log(`Updated student ${stu.fullName}`);
    } else {
      console.log(`No update needed for student ${stu.fullName}`);
    }
  }
};


// updateDepartmentID();
// updateBatchID()
// updateSectionID()
 
updateSemesterAndAcademicYear().then(() => {
  console.log("Semester & AcademicYear updated successfully.");
  mongoose.connection.close();
})