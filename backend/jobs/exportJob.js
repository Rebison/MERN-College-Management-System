import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { ExportJob } from "#models/index.js";
// import EnrollmentRequest from "../models/enrolmentRequest.js";

export default (agenda) => {
  agenda.define("export data", async (job) => {
    const { exportId, exportType } = job.attrs.data;

    const exportJob = await ExportJob.findById(exportId);
    if (!exportJob) throw new Error("Export job not found");

    exportJob.status = "processing";
    await exportJob.save();

    let filePath;

    try {
      if (exportType === "enrollment") {
        filePath = await exportEnrollmentRequests(exportJob.filters, exportId);
      } else if (exportType === "feeVerification") {
        filePath = await exportFeeVerification(exportJob.filters, exportId);
      } else if (exportType === "fee_not_started") {
        filePath = await exportFeeNotStarted(exportJob.filters, exportId);
      } else if (exportType === "fee_done_no_enrol") {
        filePath = await exportFeeDoneNoEnrol(exportJob.filters, exportId);
      } else if (exportType === "enrol_pending") {
        filePath = await exportEnrolPending(exportJob.filters, exportId);
      } else {
        throw new Error("Invalid export type");
      }

      exportJob.status = "completed";
      exportJob.filePath = filePath;
      exportJob.completedAt = new Date();
      await exportJob.save();
    } catch (err) {
      exportJob.status = "failed";
      exportJob.error = err?.message || String(err);
      await exportJob.save();
      throw err;
    }
  });
};

// export async function exportEnrollmentRequests(filters, exportId) {
//   // Clean filters: remove keys with falsy values ('', null, undefined)
//   filters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => !!v));

//   // Stage 1: match on EnrollmentRequest directly
//   const matchStage1 = {};
//   if (filters.academicSession)
//     matchStage1.academicSession = new mongoose.Types.ObjectId(
//       filters.academicSession
//     );
//   if (filters.section)
//     matchStage1.section = new mongoose.Types.ObjectId(filters.section);
//   if (filters.requestStatus && filters.requestStatus !== "all")
//     matchStage1.status = filters.requestStatus;

//   if (filters.fromDate || filters.toDate) {
//     matchStage1.submittedAt = {};
//     if (filters.fromDate)
//       matchStage1.submittedAt.$gte = new Date(filters.fromDate);
//     if (filters.toDate) matchStage1.submittedAt.$lte = new Date(filters.toDate);
//   }

//   // Stage 2: match on joined student
//   const matchStage2 = {};
//   if (filters.department)
//     matchStage2["student.department"] = new mongoose.Types.ObjectId(
//       filters.department
//     );
//   if (filters.program)
//     matchStage2["student.program"] = new mongoose.Types.ObjectId(
//       filters.program
//     );
//   if (filters.semester)
//     matchStage2["student.currentSemester"] = new mongoose.Types.ObjectId(
//       filters.semester
//     );
//   if (filters.batch)
//     matchStage2["student.batch"] = new mongoose.Types.ObjectId(filters.batch);
//   if (filters.regulation)
//     matchStage2["student.regulation"] = new mongoose.Types.ObjectId(
//       filters.regulation
//     );

//   const pipeline = [
//     { $match: matchStage1 },
//     {
//       $lookup: {
//         from: "_students",
//         localField: "student",
//         foreignField: "_id",
//         as: "student",
//       },
//     },
//     { $unwind: "$student" },
//     ...(Object.keys(matchStage2).length > 0 ? [{ $match: matchStage2 }] : []),
//     {
//       $lookup: {
//         from: "_regulations",
//         localField: "student.regulation",
//         foreignField: "_id",
//         as: "regulation",
//       },
//     },
//     { $unwind: { path: "$regulation", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "_programs",
//         localField: "student.program",
//         foreignField: "_id",
//         as: "program",
//       },
//     },
//     { $unwind: { path: "$program", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "_degrees",
//         localField: "program.degree",
//         foreignField: "_id",
//         as: "degree",
//       },
//     },
//     { $unwind: { path: "$degree", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "_departments",
//         localField: "program.department",
//         foreignField: "_id",
//         as: "department",
//       },
//     },
//     { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "_batch",
//         localField: "student.batch",
//         foreignField: "_id",
//         as: "batch",
//       },
//     },
//     { $unwind: { path: "$batch", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "_section",
//         localField: "student.section",
//         foreignField: "_id",
//         as: "section",
//       },
//     },
//     { $unwind: { path: "$section", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "_semesters",
//         localField: "student.currentSemester",
//         foreignField: "_id",
//         as: "semester",
//       },
//     },
//     { $unwind: { path: "$semester", preserveNullAndEmptyArrays: true } },
//     {
//       $lookup: {
//         from: "_courses",
//         localField: "selectedCourses.course",
//         foreignField: "_id",
//         as: "courses",
//       },
//     },
//     {
//       $lookup: {
//         from: "_faculty",
//         localField: "selectedCourses.faculty",
//         foreignField: "_id",
//         as: "faculties",
//       },
//     },
//     {
//       $project: {
//         studentName: "$student.fullName",
//         regNo: "$student.regNo",
//         regulation: "$regulation.name",
//         degree: "$degree.name",
//         program: "$program.name",
//         department: "$department.name",
//         batch: "$batch.name",
//         section: "$section.name",
//         semester: "$semester.name",
//         status: 1,
//         submittedAt: 1,
//         approvedAt: 1,
//         remarks: {
//           $map: {
//             input: {
//               $filter: {
//                 input: "$approvalFlow",
//                 as: "flow",
//                 cond: { $ne: ["$$flow.remarks", null] },
//               },
//             },
//             as: "r",
//             in: "$$r.remarks",
//           },
//         },
//         selectedCourses: {
//           $map: {
//             input: "$selectedCourses",
//             as: "sc",
//             in: {
//               courseId: "$$sc.course",
//               facultyId: "$$sc.faculty",
//             },
//           },
//         },
//         courses: "$courses.courseName",
//         faculties: "$faculties.name",
//       },
//     },
//     {
//       $sort: {
//         department: 1,
//         batch: 1,
//         regNo: 1,
//       },
//     },
//   ];

//   const data = await EnrollmentRequest.aggregate(pipeline);

//   const workbook = new ExcelJS.Workbook();
//   const sheet = workbook.addWorksheet("Enrollment Requests");

//   // Define columns
//   sheet.columns = [
//     { header: "Student Name", key: "studentName", width: 25 },
//     { header: "Reg No", key: "regNo", width: 15 },
//     { header: "Degree", key: "degree", width: 15 },
//     { header: "Program", key: "program", width: 25 },
//     { header: "Department", key: "department", width: 20 },
//     { header: "Batch", key: "batch", width: 15 },
//     { header: "Regulation", key: "regulation", width: 15 },
//     { header: "Section", key: "section", width: 15 },
//     { header: "Semester", key: "semester", width: 15 },
//     { header: "Status", key: "status", width: 15 },
//     { header: "Selected Courses", key: "selectedCourses", width: 70 },
//     { header: "Faculty Names", key: "facultyNames", width: 70 },
//     { header: "Remarks", key: "remarks", width: 50 },
//     { header: "Submitted At", key: "submittedAt", width: 25 },
//     { header: "Approved At", key: "approvedAt", width: 25 },
//   ];

//   // Header style
//   const headerRow = sheet.getRow(1);
//   headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFF" } };
//   headerRow.fill = {
//     type: "pattern",
//     pattern: "solid",
//     fgColor: { argb: "4F81BD" },
//   };

//   // Add rows
//   data.forEach((req) => {
//     const selectedCourses = (req.courses || []).join(", ");
//     const facultyNames = (req.faculties || []).join(", ");
//     const remarks = (req.remarks || []).join(" | ");

//     sheet.addRow({
//       studentName: req.studentName || "",
//       regNo: req.regNo || "",
//       degree: req.degree || "",
//       program: req.program || "",
//       department: req.department || "",
//       batch: req.batch || "",
//       regulation: req.regulation || "",
//       section: req.section || "",
//       semester: req.semester || "",
//       status: req.status || "",
//       selectedCourses,
//       facultyNames,
//       remarks,
//       submittedAt: req.submittedAt
//         ? new Date(req.submittedAt).toLocaleString("en-IN", {
//           dateStyle: "medium",
//           timeStyle: "short",
//         })
//         : "",
//       approvedAt: req.approvedAt
//         ? new Date(req.approvedAt).toLocaleString("en-IN", {
//           dateStyle: "medium",
//           timeStyle: "short",
//         })
//         : "",
//     });
//   });

//   const exportDir = path.join("exports");
//   if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });

//   const filePath = path.join(exportDir, `enrollment_export_${exportId}.xlsx`);
//   await workbook.xlsx.writeFile(filePath);

//   return filePath;
// }
