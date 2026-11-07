import * as authService from "../services/auth.service.js";

import {
    refreshCookieName,
    refreshCookieOptions,
    clearRefreshCookieOptions
} from "../config/cookie.js";

import { successResponse } from "../utils/api-response.js";

function getMetadata(req) {
    return {
        userAgent: req.get("user-agent"),
        ipAddress: req.ip
    };
}

function setRefreshCookie(res, token) {
    res.cookie(
        refreshCookieName,
        token,
        refreshCookieOptions
    );
}

function clearRefreshCookie(res) {
    res.clearCookie(
        refreshCookieName,
        clearRefreshCookieOptions
    );
}

// POST /api/auth/login
export async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const result = await authService.loginUser(
            email,
            password,
            getMetadata(req)
        );

        setRefreshCookie(res, result.refreshToken);

        return successResponse(res, {
            message: "Login successful",
            data: {
                user: result.user,
                accessToken: result.accessToken
            }
        });

    } catch (error) {
        next(error);
    }
}

// POST /api/auth/refresh
export async function refresh(req, res, next) {
    try {
        const oldToken = req.cookies?.[refreshCookieName];

        const result = await authService.refreshUserSession(
            oldToken,
            getMetadata(req)
        );

        setRefreshCookie(res, result.refreshToken);

        return successResponse(res, {
            message: "Token refreshed successfully",
            data: {
                user: result.user,
                accessToken: result.accessToken
            }
        });

    }  catch (error) {
    if ([401, 403].includes(error.statusCode)) {
        clearRefreshCookie(res);
    }

    next(error);
}
}

// POST /api/auth/logout
export async function logout(req, res, next) {
    try {
        const token = req.cookies?.[refreshCookieName];// Debugging line
        await authService.logoutUser(token);

        clearRefreshCookie(res);

        return successResponse(res, {
            message: "Logged out successfully"
        });

    } catch (error) {
        next(error);
    }
}

// POST /api/auth/logout-all
export async function logoutAll(req, res, next) {
    try {
        await authService.logoutAllUserSessions(
            req.user.userId
        );

        clearRefreshCookie(res);

        return successResponse(res, {
            message: "Logged out from all devices"
        });

    } catch (error) {
        next(error);
    }
}

// GET /api/auth/me
export async function getMe(req, res, next) {
    try {
        const user = await authService.getCurrentUser(
            req.user.userId
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return successResponse(res, {
            message: "Get current user successfully",
            data: {user,accessToken: req.headers.authorization?.split(" ")[1] || null},
        });

    } catch (error) {
        next(error);
    }
}
// POST /api/auth/register
export async function register(req, res, next) {
    try {
        const result = await authService.registerUser(req.body);
        return successResponse(res, {
            statusCode: 201,
            message: "Đăng ký thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
}
