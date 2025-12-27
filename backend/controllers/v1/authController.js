import * as authServiceV1 from '#services/v1/authService.js';
import { asyncHandler } from '#utils/asyncHandler.js';
import AppError from '#utils/AppError.js';
import { sendResponse } from '#utils/response.js';


export const healthCheck = asyncHandler(async (req, res) => {

    const result = await authServiceV1.healthCheck();

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

export const getMe = asyncHandler(async (req, res) => {

});

export const login = asyncHandler(async (req, res) => {
    
    const result = await authServiceV1.login(req.body);

    if (!result || !result.token) {
        throw new AppError('Invalid login credentials', 401, 'AUTH_FAILED');
    }

    return sendResponse(res, 200, true, 'Login successful', result, {
        requestId: req.requestId
    });
});

export const logout = asyncHandler(async (req, res) => {

});

export const resetPassword = asyncHandler(async (req, res) => {

});
