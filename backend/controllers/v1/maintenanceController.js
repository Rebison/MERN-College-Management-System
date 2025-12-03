// controllers/maintenanceController.js
import * as maintenanceService from "#services/v1/maintenanceService.js";

export const refresh = async (req, res) => {
  try {
    await maintenanceService.refreshStatus();
    res.json({ message: "Maintenance status refreshed successfully" });
  } catch (error) {
    console.error("Failed to refresh maintenance cache:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const status = async (req, res) => {
  try {
    const status = await maintenanceService.getStatus();
    res.status(200).json(status);
  } catch (err) {
    res.status(500).json({ error: "Failed to get maintenance status" });
  }
};

export const enable = async (req, res) => {
  try {
    await maintenanceService.enableMaintenance(req.body.message);
    res.status(200).json({ message: "Maintenance mode enabled" });
  } catch (err) {
    res.status(500).json({ error: "Failed to enable maintenance mode" });
  }
};

export const disable = async (req, res) => {
  try {
    await maintenanceService.disableMaintenance();
    res.status(200).json({ message: "Maintenance mode disabled" });
  } catch (err) {
    res.status(500).json({ error: "Failed to disable maintenance mode" });
  }
};

export const schedule = async (req, res) => {
  try {
    const { startTime, endTime, message } = req.body;
    await maintenanceService.scheduleMaintenance(startTime, endTime, message);
    res.json({ message: "Maintenance schedule set successfully" });
  } catch (err) {
    console.error("Error scheduling maintenance:", err);
    res.status(400).json({ message: err.message });
  }
};
