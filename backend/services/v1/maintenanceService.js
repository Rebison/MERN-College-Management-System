// services/maintenanceService.js
import { Setting } from "#models/index.js";
import { refreshMaintenanceStatus } from "#utils/maintenanceCache.js";

export const refreshStatus = async () => {
  await refreshMaintenanceStatus();
};

export const getStatus = async () => {
  const flag = await Setting.findById("maintenance_flag");
  return {
    maintenance: flag?.maintenance || false,
    message: flag?.message || ""
  };
};

export const enableMaintenance = async (message) => {
  await Setting.findByIdAndUpdate(
    "maintenance_flag",
    {
      maintenance: true,
      message: message || "The system is under maintenance."
    },
    { upsert: true }
  );
  await refreshMaintenanceStatus();
};

export const disableMaintenance = async () => {
  await Setting.findByIdAndUpdate(
    "maintenance_flag",
    {
      maintenance: false,
      message: "",
      $unset: { startTime: "", endTime: "" }
    },
    { upsert: true }
  );
  await refreshMaintenanceStatus();
};

export const scheduleMaintenance = async (startTime, endTime, message) => {
  if (!startTime || !endTime) {
    throw new Error("Start time and end time are required");
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    throw new Error("Start time must be before end time");
  }

  await Setting.findByIdAndUpdate(
    "maintenance_flag",
    {
      $set: {
        startTime: start,
        endTime: end,
        message: message || "Scheduled maintenance in progress"
      }
    },
    { upsert: true }
  );

  await refreshMaintenanceStatus();
};
