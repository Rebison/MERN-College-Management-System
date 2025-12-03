import express from 'express';
const maintenanceRouter = express.Router();
// import { developerRoles } from '../utils/common.js';
import * as maintenanceController from "#controllers/maintenanceController.js";

// Middleware: Only developers can access these routes
// maintenanceRouter.use((req, res, next) => {
//   if (!req.user || !developerRoles.includes(req.user.role)) {
//     return res.status(403).json({ message: 'Access denied: Developer role required' });
//   }
//   next();
// });

maintenanceRouter.post("/refresh", maintenanceController.refresh);
maintenanceRouter.get("/status", maintenanceController.status);
maintenanceRouter.post("/enable", maintenanceController.enable);
maintenanceRouter.post("/disable", maintenanceController.disable);
maintenanceRouter.post("/schedule", maintenanceController.schedule);

export default maintenanceRouter;
