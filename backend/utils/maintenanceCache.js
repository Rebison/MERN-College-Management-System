import { Setting } from '../models/index.js';

let maintenanceCache = {
    maintenance: false,
    message: '',
    startTime: null,
    endTime: null,
    lastChecked: null
};

const refreshMaintenanceStatus = async () => {
    try {
        const flag = await Setting.findById('maintenance_flag');
        if (!flag) {
            maintenanceCache = {
                maintenance: false,
                message: '',
                startTime: null,
                endTime: null,
                lastChecked: new Date()
            };
            return;
        }

        maintenanceCache = {
            maintenance: flag.maintenance || false,
            message: flag.message || '',
            startTime: flag.startTime || null,
            endTime: flag.endTime || null,
            lastChecked: new Date()
        };
    } catch (err) {
        console.error('Failed to refresh maintenance status:', err);
    }
};

// Refresh every 60 seconds
setInterval(refreshMaintenanceStatus, 60 * 1000);

// Initial load on server start
refreshMaintenanceStatus();

const getMaintenanceStatus = () => maintenanceCache;

export {
    getMaintenanceStatus,
    refreshMaintenanceStatus
};
