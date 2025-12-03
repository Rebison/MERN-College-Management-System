import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { getMaintenanceStatus, refreshMaintenanceStatus } from '../utils/maintenanceCache.js';
import { developerRoles } from "../utils/common.js";

config({ path: '../.env' });

const auth = async (req, res, next) => {
  try {
    const token = req.session.token;
    if (!token)
      return res.status(401).json({ message: "No auth token, access denied" });

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res
        .status(401)
        .json({ message: "Token verification failed, authorization denied." });

    req.user = verified;
    // req.token = token; 
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const roleAuth = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}

const serverStatus = async (req, res, next) => {
  const allowedPaths = [
    '/maintenance',
    '/maintenance/enable',
    '/maintenance/disable',
    '/maintenance/refresh',
    '/maintenance/status',
    '/maintenance/schedule',
  ];
  if (allowedPaths.includes(req.path)) return next();

  try {
    const now = new Date();
    const cache = getMaintenanceStatus();

    const isManual = cache.maintenance;
    const isScheduled =
      cache.startTime && cache.endTime &&
      now >= new Date(cache.startTime) &&
      now <= new Date(cache.endTime);

    const isExpiredSchedule =
      cache.startTime && cache.endTime &&
      now > new Date(cache.endTime);

    if (isExpiredSchedule && !isManual) {
      await setting.findByIdAndUpdate('maintenance_flag', {
        $unset: { startTime: '', endTime: '' },
        message: ''
      });
      await refreshMaintenanceStatus();
    }

    const isUnderMaintenance = isManual || isScheduled;

    if (!isUnderMaintenance) return next();

    if (req.session?.token && req.user) {
      if (developerRoles.includes(req.user.role)) {
        return next();
      }
    }

    return res.status(503).json({
      status: 'maintenance',
      message: cache.message || 'System is under maintenance'
    });
  } catch (error) {
    console.error('Maintenance middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export { auth, roleAuth, serverStatus};
