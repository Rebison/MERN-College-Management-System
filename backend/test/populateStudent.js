import mongoose from "mongoose";
import xlsx from "xlsx";
import student from "../models/student.js"; // Adjust to actual path
import dotenv from "dotenv";
dotenv.config({path: "../.env"});

const MONGODB_URI = process.env.MONGO_URI;

let c = 0;
let e = 0;

// Load Excel
const workbook = xlsx.readFile("D:\\Aswa\\Database\\Student\\Student Database Reduced.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

async function run() {
    await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log("✅ Connected to DB");

    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const doc = {
            admissionNo: r["Admission No."],
            firstName: r["First Name"],
            lastName: r["Last Name"],
            fullName: r["Full Name"],
            semesterYear: r["Semester/Year"],
            section: r["Section"],
            regNo: r["Roll No./Register No."],
            gender: r["Gender"],
            dob: r["DOB"] ? new Date(r["DOB"]) : null,
            maritalStatus: r["Marital Status"],
            department: r["Department"],
            program: r["Program"],
            courseType: r["CourseType"],
            teachingPlan: r["Teaching Plan"],
            institution: r["Institution"],
            year: r["Year"],
            regulation: r["Regulation"],
            mediumOfInstruction: r["Medium Of Instruction"],
            
            community: {
              name: r["Community"],
              details: r["Community Details"]
            },
            
            nationality: r["Nationality"],
            motherTongue: r["Mother Tongue"],
            religion: r["Religion"],
            bloodGroup: r["Blood Group"],
            
            contactInfo: {
                phoneNo: r["Phone No."],
                altPhoneNo: r["Mobile No."],
                address: r["Address"]
              },

            academicPerformance: {
                transcriptGpa: r["Transcript GPA"] ?? 0,
                transcriptCgpa: r["Transcript CGPA"]
            },

            schoolAcademicPerformance: {
              qualifyingExamPassed: r["Qualifying Exam Passed"],
                medium: r["Medium"],
                certificateRegisterNo: r["Certificate Regster No"],
                dateOfPass: r["Dateof Pass"] ? new Date(r["Dateof Pass"]) : null,
                universityStudied: r["University Studied"],
                subject: r["Subject"],
                maxMark: r["Max Mark"],
                passMark: r["Pass Mark"],
                markPercentage: r["Percentage"]
            },
            
            identification: {
              nationalId: r["National ID"],
                nationalIdType: r["National ID Type"]
            },
            
            email: r["Email"],
            password: "testpass",
            role: "student",
            userType: "student",
            semester: r["Semester"],
        };

        try {
            await student.create(doc);
            console.log(`✔ Inserted: ${doc.fullName || doc.regNo}`);
            c++;
        } catch (err) {
            console.error(`❌ Failed to insert row ${i + 2}:`, err.message);
            e++;
        }
    }

    console.log(`\n\nInsterted ${c} rows successfully`);
    console.log(`Failed to insert ${e} rows`);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from DB");
}

run();
