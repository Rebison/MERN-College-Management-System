import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    regNo: {
        type: String,
        unique: true,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    studentType: {
        type: String,
        enum: ["Regular", "Lateral", "Transfer"]
    },
    courseType: {
        type: String,
        enum: ["Full Time", "Part Time"]
    },
    dob: {
        type: Date
    },
    maritalStatus: {
        type: String,
        default: "Single"
    },
    role: {
        type: String,
        default: "student"
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Program"
    },
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch"
    },
    currentAcademicYear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicSession"
    },
    currentSemester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester"
    },
    regulation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Regulation"
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    },
    teachingPlan: {
        type: String
    },
    institution: {
        type: String
    },
    mediumOfInstruction: {
        type: String,
        default: "ENGLISH"
    },
    community: {
        name: { type: String },
        details: { type: String }
    },
    nationality: { type: String },
    motherTongue: { type: String },
    religion: { type: String },
    bloodGroup: { type: String },

    contactInfo: {
        phoneNo: { type: String },
        altPhoneNo: { type: String },
        address: { type: String }
    },

    academicPerformance: {
        completedCredits: { type: Number },
        pendingCredits: { type: Number },
        transcriptGpa: { type: Number, default: 0 },
        transcriptCgpa: { type: Number }
    },

    schoolAcademicPerformance: {
        qualifyingExamPassed: { type: String },
        medium: { type: String },
        certificateRegisterNo: { type: String },
        dateOfPass: { type: Date },
        universityStudied: { type: String },
        subject: { type: String },
        maxMark: { type: Number },
        passMark: { type: Number },
        markPercentage: { type: Number }
    },

    status: {
        firstGraduateStudent: { type: String, enum: ["Yes", "No"] },
        minority: { type: String, enum: ["Yes", "No"] },
        expectedWithdrawal: { type: String, enum: ["Yes", "No"] },
        currentStatus: { type: String, enum: ["Active", "Inactive"] }
    },

    identification: {
        nationalId: { type: String, default: null },
        nationalIdType: { type: String },
        passport: {
            passportNo: { type: String, default: null },
            issueDate: { type: Date, default: null },
            validTill: { type: Date, default: null },
            placeOfIssue: { type: String, default: null },
            issuingAuthority: { type: String, default: null }
        },
        visa: {
            visaNo: { type: String, default: null },
            issueDate: { type: Date, default: null },
            validTill: { type: Date, default: null }
        }
    },
});

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
