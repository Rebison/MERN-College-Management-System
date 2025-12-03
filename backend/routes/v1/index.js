import express from 'express';

import StudRouter from './student.js';
import studPermRouter from './studentPermission.js';
import FacultyServicesRouter from "./facultyServices.js"
import CourseServicesRouter from './courseServices.js';
import SectionCourseAssignment from './secCourseAssignment.js';
import CourseAssignment from "./courseAssignment.js"
import maintenanceRouter from './maintenance.js';
import notificationRouter from './notification.js';
import EnrolmentRouter from './enrolment.js';
import BatchServicesRouter from './batchServices.js';
import SectionServicesRouter from './sectionServices.js';
import AcademicSessionServicesRouter from './academicSessionServices.js';
import SemesterServicesRouter from './semesterServices.js'
import exportRouter from './export.js';
import fetchServicesRouter from './fetchServicesRoute.js';
import DepartmentRouter from './department.js';
import ManualAssignmentRouter from './manualAssignment.js';
import coordinatorAssignmentRoutes from './coordinatorAssignmentRoutes.js';
import logErrorRouter from './logError.js'
import pushRouter from './push.js';


const router = express.Router();

router.use('/student', StudRouter);
router.use('/studentPermission', studPermRouter);
router.use('/facultyServices', FacultyServicesRouter);
router.use('/courseServices', CourseServicesRouter);
router.use('/sectionCourseAssignment', SectionCourseAssignment);
router.use('/courseAssignment', CourseAssignment);
router.use('/maintenance', maintenanceRouter);
router.use('/notifications', notificationRouter);
router.use('/enrolment', EnrolmentRouter);
router.use('/batchServices', BatchServicesRouter);
router.use('/sectionServices', SectionServicesRouter);
router.use('/academicSessionServices', AcademicSessionServicesRouter);
router.use('/semesterServices', SemesterServicesRouter);
router.use('/fetchServices', fetchServicesRouter);
router.use('/export', exportRouter);
router.use('/department', DepartmentRouter);
router.use('/manualAssignment', ManualAssignmentRouter);
router.use('/coordinatorAssignment', coordinatorAssignmentRoutes);
router.use('/logError', logErrorRouter);
router.use('/push', pushRouter);


export default router;