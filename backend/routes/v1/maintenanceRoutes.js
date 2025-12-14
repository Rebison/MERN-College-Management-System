import express from 'express';
import * as maintenanceController from "#controllers/v1/maintenanceController.js";

const maintenanceRouter = express.Router();

maintenanceRouter.post("/refresh", maintenanceController.refresh);
maintenanceRouter.get("/status", maintenanceController.status);
maintenanceRouter.post("/enable", maintenanceController.enable);
maintenanceRouter.post("/disable", maintenanceController.disable);
maintenanceRouter.post("/schedule", maintenanceController.schedule);

export default maintenanceRouter;
