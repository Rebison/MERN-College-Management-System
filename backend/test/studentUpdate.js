import mongoose from "mongoose";
import {student, studentDep, section, departments, faculty} from "../models/index.js";
import dotenv from "dotenv"

dotenv.config({path:"../.env"});

const updateStudent = async()=> {
    try{
        mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")

        const students = await student.find({}, {_id : 1, regNo: 1, section:1, department:1})

        var count = 0

        for(const stud of students){
            var batch = stud.regNo.slice(0,3)

            const sectionData = await section.findOne({ name:stud.section, batch:batch }, { _id : 1 })
            const departmentData = await departments.findOne({ deptName:stud.department }, { _id : 1 })
            const studentDepData = await studentDep.findOne({ registerNumber: stud.regNo }, { _id : 1 })

            //console.log(sectionData, departmentData, studentDepData)   

            if(sectionData && departmentData && studentDepData){
                await student.updateOne(
                    { _id: stud._id },
                    { 
                        $set: {
                            sectionID: sectionData._id,
                            departmentID: departmentData._id,
                            studentDep: studentDepData._id
                        }
                    }
                )
                console.log(`Updated student with regNo: ${stud.regNo}`)
                count ++
            }
            console.log(`${count} records were updated.`)
        }
        

    }catch(err){
        console.log(err)
    }
}

const updateFaculty = async()=> {
    try{
        mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to MongoDB")

        const facultyData = await faculty.find({}, {name:1, department:1})
        // console.log(facultyData)

        for (const faculty of facultyData) {
            const departmentData = await departments.findOne({deptName: faculty.department})
            if(departmentData){
                await faculty.updateOne(
                    { _id: faculty._id },
                    { $set: { departmentID: departmentData._id } }
                )
                console.log(`Updated faculty: ${faculty.name} with department: ${faculty.department}`)
            } else {
                console.log(`Department not found for faculty: ${faculty.name}`)
            }
        }   
    }catch(err){
        console.log(err)
    }
}

// updateStudent()
updateFaculty()