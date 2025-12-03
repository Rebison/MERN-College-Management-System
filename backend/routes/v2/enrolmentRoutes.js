import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { auth, roleAuth } from "#middlewares/auth.js";
// import feeReceipt from "../models/feeVerification.js";
import EnrolmentService from "../../services/enrolmentServices.js";
// import student from "../../models/student.js";
// import feeVerification from "../../models/feeVerification.js";
// import academicSession from "../../models/academicSession.js";
// import section from "../../models/section.js";
// import coordinatorAssignment from "../../models/coordinatorAssignment.js";
// import batch from "../models/batch.js";
import { Student, FeeVerification, AcademicSession, Section, CoordinatorAssignment } from "#models/index.js";
import { sendCustomEmail } from "../../emails/emailService.js";
import { getFeeVerificationTemplate } from "../../emails/templates/feeVerificationTemplate.js";
import { createMulterUploader } from "../../utils/multerConfig.js";
import { createNotification } from "../../services/notificationService.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const EnrolmentRouter = express.Router();
const enrolmentService = new EnrolmentService();

export const validateStudentForFee = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const Student = await student.findById(studentId).populate("batch section");

    if (!Student || !Student.regNo || !Student.section) {
      return res.status(400).json({ error: "Invalid student details." });
    }

    const AcademicSession = await academicSession.findById(Student.currentAcademicYear);
    if (!AcademicSession) {
      return res.status(400).json({ error: "No current academic session" });
    }

    // Save for later use
    req.Student = Student;
    req.AcademicSession = AcademicSession;

    // Build upload folder path dynamically
    req.uploadPath = path.join(
      "student",
      "fee-receipt",
      Student.batch.name,
      Student.section.name
    );

    fs.mkdirSync(path.join("uploads", req.uploadPath), { recursive: true });

    next();
  } catch (err) {
    console.error("❌ Validation error:", err);
    return res.status(500).json({ error: "Failed to validate student" });
  }
};

// const storage = multer.diskStorage({
//   destination: async function (req, file, cb) {
//     try {
//       const studentId = req.user.id;
//       const stud = await student.findById(studentId).populate("batch section");

//       if (!stud || !stud.regNo || !stud.section) {
//         return cb(new Error("Invalid student details."));
//       }

//       const batch = stud.batch.name;
//       const section = stud.section.name;
//       const dir = path.join(
//         "uploads",
//         "student",
//         "fee-receipt",
//         batch,
//         section
//       );

//       fs.mkdirSync(dir, { recursive: true });
//       cb(null, dir);
//     } catch (err) {
//       cb(err, null);
//     }
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
//     );
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
//   fileFilter: (req, file, cb) => {
//     const allowedMimeTypes = [
//       "application/pdf",
//       "application/octet-stream",
//       "binary/octet-stream",
//       "application/x-pdf",
//     ];

//     const ext = path.extname(file.originalname).toLowerCase();

//     if (ext === ".pdf" && allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else if (ext === ".pdf") {
//       // Allow PDF extension even if MIME is weird
//       cb(null, true);
//     } else {
//       cb(new Error("Only PDF files are allowed."), false);
//     }
//   },
// }).single("document");

// ✅ Pre-check student, then pass upload middleware

const uploadFeeReceipt = createMulterUploader({
  folder: "feeReceipts",
  type: "single",
  fieldName: "document",
  maxSizeMB: 10,
  allowedExt: [".pdf"],
  allowedMime: [
    "application/pdf",
    "application/octet-stream",
    "binary/octet-stream",
    "application/x-pdf",
  ],
});

EnrolmentRouter.post(
  "/upload-fee",
  roleAuth(["student"]),
  validateStudentForFee, // ✅ middleware first
  uploadFeeReceipt, // then multer
  async (req, res) => {
    try {
      const { Student, AcademicSession } = req;
      const filePath = req.file?.path?.replace(/\\/g, "/");

      if (!req.file) {
        return res.status(400).json({ error: "File not uploaded" });
      }

      // ✅ Check existing record
      const existingRecord = await feeVerification.findOne({
        student: Student._id,
        academicSession: AcademicSession._id,
      });

      if (existingRecord) {
        if (["pending", "approved"].includes(existingRecord.status)) {
          return res.status(409).json({
            error: "Fee receipt already uploaded and under process",
          });
        }

        if (existingRecord.status === "rejected") {
          existingRecord.receiptUrl = filePath;
          existingRecord.status = "pending";
          existingRecord.approvals.forEach((a) => {
            a.status = "pending";
            a.remarks = "";
          });
          existingRecord.resubmittedAt = new Date();
          await existingRecord.save();

          try {
            await sendCustomEmail(Student.email, getFeeVerificationTemplate, {
              type: "submitted",
              recipientName: Student.fullName,
              verificationId: existingRecord._id.toString(),
              submissionDate: dayjs
                .utc(existingRecord.createdAt)
                .tz("Asia/Kolkata")
                .format("DD-MM-YYYY hh:mm A"),
              portalLink: "https://srishty.bharathuniv.ac.in/academics",
            });
          } catch (emailErr) {
            console.error("⚠ Email sending failed:", emailErr.message);
          }

          return res.status(200).json({
            message: "Fee receipt updated successfully",
            id: existingRecord._id,
          });
        }
      }

      // ✅ Fresh submission
      const Section = await section.findById(Student.section).populate("mentor");
      if (!Section || !Section.mentor) {
        return res.status(400).json({ error: "Mentor not assigned for this section" });
      }

      const erpCoordinators = await coordinatorAssignment.find({
        department: Student.department,
        role: "erpCoordinator",
        status: "active",
        $or: [{ batch: Student.batch }, { batch: null }],
      });

      if (!erpCoordinators.length) {
        return res.status(400).json({ error: "ERP Coordinators not found" });
      }

      const erpApprovals = erpCoordinators.map((c) => ({
        role: "erpCoordinator",
        faculty: c?.faculty,
        isAdmin: c?.isAdmin,
        status: "pending",
      }));

      const FeeVerification = new feeVerification({
        student: Student._id,
        academicSession: AcademicSession._id,
        semester: Student.currentSemester,
        receiptUrl: filePath,
        status: "pending",
        approvals: [
          { role: "mentor", faculty: Section.mentor._id, status: "pending" },
          ...erpApprovals,
        ],
      });

      await FeeVerification.save();

      try {
        await createNotification(Student._id, "Student", { // Change the line after finishing all the database changes
          message: "Your fee verification request has been submitted successfully.",
          email: {
            to: Student?.email,
            template: "getFeeVerificationTemplate",
            data: {
              verificationId: FeeVerification._id.toString(),
              type: "submitted",
              recipientName: Student?.fullName
            }
          },
          socket: null,
          push: null
        });
      } catch (err) {
        console.log("Error occured while sending the notification", err);
      }


      return res
        .status(201)
        .json({ message: "Fee receipt submitted successfully" });
    } catch (err) {
      console.error("❌ Upload fee error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ Upload Fee Receipt with new coordinator logic
// EnrolmentRouter.post("/upload-fee", roleAuth(["student"]), async (req, res) => {
//   upload(req, res, async function (err) {
//     if (err) {
//       console.error("Multer error:", err);
//       return res.status(400).json({ error: err.message });
//     }

//     try {
//       const studentId = req.user.id;

//       const Student = await student.findById(studentId);
//       if (!Student) return res.status(404).json({ error: "Student not found" });

//       const session = await academicSession.findById(
//         Student.currentAcademicYear
//       );
//       if (!session)
//         return res.status(400).json({ error: "No current academic session" });

//       // Check if already uploaded
//       const existingRecord = await feeVerification.findOne({
//         student: Student._id,
//         academicSession: session._id,
//       });

//       if (existingRecord) {
//         if (
//           existingRecord.status === "pending" ||
//           existingRecord.status === "approved"
//         ) {
//           return res
//             .status(409)
//             .json({ error: "Fee receipt already uploaded and under process" });
//         }

//         // If rejected → Update the old record instead of creating new
//         if (existingRecord.status === "rejected") {
//           existingRecord.receiptUrl = req.file.path.replace(/\\/g, "/");
//           existingRecord.status = "pending";
//           existingRecord.approvals.forEach((a) => {
//             a.status = "pending";
//             a.remarks = "";
//           });
//           existingRecord.resubmittedAt = new Date();
//           await existingRecord.save();

//           try {
//             await sendCustomEmail(Student.email, getFeeVerificationTemplate, {
//               type: "submitted",
//               recipientName: Student.fullName,
//               verificationId: existingRecord._id.toString(),
//               submissionDate: dayjs
//                 .utc(FeeVerification.createdAt)
//                 .tz("Asia/Kolkata")
//                 .format("DD-MM-YYYY hh:mm A"),
//               portalLink: "https://srishty.bharathuniv.ac.in/academics",
//             });
//           } catch (emailErr) {
//             console.error("⚠ Email sending failed:", emailErr.message);
//           }
//           return res
//             .status(200)
//             .json({
//               message: "Fee receipt updated successfully",
//               id: existingRecord._id,
//             });
//         }
//       }

//       // ✅ Fetch mentor
//       const Section = await section
//         .findById(Student.section)
//         .populate("mentor");
//       if (!Section || !Section.mentor) {
//         return res
//           .status(400)
//           .json({ error: "Mentor not assigned for this section" });
//       }

//       // ✅ Fetch ERP Coordinators (Batch + Admin)
//       const erpCoordinators = await coordinatorAssignment
//         .find({
//           department: Student.department,
//           role: "erpCoordinator",
//           status: "active",
//           $or: [
//             { batch: Student.batch }, // Batch-level ERP coordinators
//             { batch: null }, // ERP admin(s)
//           ],
//         })
//         .select("faculty isAdmin");

//       if (!erpCoordinators.length) {
//         return res.status(400).json({ error: "ERP Coordinators not found" });
//       }

//       const receiptUrl = req.file.path.replace(/\\/g, "/");

//       // ✅ Build approval steps
//       const erpApprovals = erpCoordinators.map((c) => ({
//         role: "erpCoordinator",
//         faculty: c?.faculty,
//         isAdmin: c?.isAdmin,
//         status: "pending",
//       }));

//       const FeeVerification = new feeVerification({
//         student: Student._id,
//         academicSession: session._id,
//         semester: Student.currentSemester,
//         receiptUrl,
//         status: "pending",
//         approvals: [
//           {
//             role: "mentor",
//             faculty: Section.mentor._id,
//             status: "pending",
//           },
//           ...erpApprovals,
//         ],
//       });

//       await FeeVerification.save();

//       try {
//         await sendCustomEmail(Student.email, getFeeVerificationTemplate, {
//           type: "submitted",
//           recipientName: Student.fullName,
//           verificationId: FeeVerification._id.toString(),
//           submissionDate: dayjs
//             .utc(FeeVerification.createdAt)
//             .tz("Asia/Kolkata")
//             .format("DD-MM-YYYY hh:mm A"),
//           portalLink: "https://srishty.bharathuniv.ac.in/academics",
//         });
//       } catch (emailErr) {
//         console.error("⚠ Email sending failed:", emailErr.message);
//       }

//       return res.status(201).json({
//         message: "Fee receipt submitted successfully",
//         id: FeeVerification._id,
//       });
//     } catch (err) {
//       console.error("❌ uploadReceipt error:", err);
//       return res.status(500).json({ error: "Server error" });
//     }
//   });
// });

// View enrolment requests
EnrolmentRouter.get(
  "/view-enrolment-request",
  roleAuth([
    "faculty",
    "assistantHod",
    "hod",
    "departmentDean",
    "deanAcademics",
  ]),
  enrolmentService.getEnrolmentRequestsForFaculty
);

// Approve enrolment request
EnrolmentRouter.patch(
  "/approve-enrolment-request/:type/:id",
  roleAuth([
    "faculty",
    "assistantHod",
    "hod",
    "departmentDean",
    "deanAcademics",
  ]),
  enrolmentService.approveEnrolmentRequests
);

EnrolmentRouter.get(
  "/view-enrolment-status",
  roleAuth(["student"]),
  enrolmentService.getStudentRequestStatus
);

// View enrolment posting
EnrolmentRouter.get(
  "/view-enrolment-posting",
  roleAuth(["student"]),
  enrolmentService.viewEnrolmentPosting
);

EnrolmentRouter.post(
  "/post-enrolment-request",
  roleAuth(["student"]),
  enrolmentService.generateEnrolmentRequest
);

// View All Requests made (Tracking enrolment)
EnrolmentRouter.get("/view-all-requests", enrolmentService.viewAllRequests);

EnrolmentRouter.get(
  "/get-all-request-for-faculty",
  enrolmentService.getAllRequestsForFaculty
);

EnrolmentRouter.get(
  "/get-acted-request",
  enrolmentService.getActedEnrolmentRequestsForFaculty
);

// Approve Enrolment page filter
EnrolmentRouter.get(
  "/filter-scope",
  roleAuth([
    "faculty",
    "assistantHod",
    "hod",
    "departmentDean",
    "deanAcademics",
  ]),
  enrolmentService.getFilterScope
);

export default EnrolmentRouter;
