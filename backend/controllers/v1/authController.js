import * as authServiceV1 from '#services/v1/authService.js';
import { asyncHandler } from '#utils/asyncHandler.js';
import AppError from '#utils/AppError.js';
import { sendResponse } from '#utils/response.js';

const serviceMap = {
    v1: authServiceV1,
    v2: authServiceV1 // Placeholder for future versions
};

const getService = (version) => serviceMap[version] || serviceMap.v1;

export const healthCheck = (version = 'v1') =>
    asyncHandler(async (req, res) => {
        const service = getService(version);
        if (!service.healthCheck) {
            throw new AppError(`Method not available in ${version}`, 501);
        }
        const result = await service.healthCheck();

        if (result.status === 'maintenance') {
            return sendResponse(res, 503, false, result.message, null, {
                startTime: result.startTime,
                endTime: result.endTime,
                timestamp: result.timestamp
            });
        }

        return sendResponse(res, 200, true, 'System is healthy', result, {
            timestamp: result.timestamp
        });
    });

export const getMe = (version = 'v1') =>
    asyncHandler(async (req, res) => {
        const service = getService(version);

    });

export const login = (version = 'v1') =>
    asyncHandler(async (req, res) => {
        const service = getService(version);
        if (!service.loginService) {
            throw new AppError(`Method not available in ${version}`, 501);
        }
        const result = await service.loginService(req.body);

        if (!result || !result.token) {
            throw new AppError('Invalid login credentials', 401, 'AUTH_FAILED');
        }

        return sendResponse(res, 200, true, 'Login successful', result, {
            requestId: req.requestId
        });
    });

export const logout = (version = 'v1') =>
    asyncHandler(async (req, res) => {
        const service = getService(version);

    });
    
export const resetPassword = (version = 'v1') =>
    asyncHandler(async (req, res) => {
        const service = getService(version);

    });
