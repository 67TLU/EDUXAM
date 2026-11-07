import express from "express";
import { requireTrustedOrigin } from "../middlewares/origin.middleware.js";
import {
    login,
    refresh,
    logout,
    logoutAll,
    getMe,
    register
} from "../controllers/auth.controller.js";

import { authenticateToken } from "../middlewares/auth.middleware.js";

import validate from "../middlewares/validate.middleware.js";

import { loginSchema, registerSchema } from "../validators/auth.validator.js";

import {
    loginRateLimiter,
    refreshRateLimiter
} from "../middlewares/rate-limit.middleware.js";

const router = express.Router();

// Đăng ký
router.post(
    "/register",
    validate(registerSchema),
    register
);

// Login
router.post(
    "/login",
    loginRateLimiter,
    validate(loginSchema),
    login
);

// Refresh
router.post(
    "/refresh",requireTrustedOrigin,
    refreshRateLimiter,
    refresh
);

// Logout current device
router.post(
    "/logout",
    requireTrustedOrigin,
    logout
);

// Logout all devices
router.post(
    "/logout-all",
    authenticateToken,
    logoutAll
);

// Current user
router.get(
    "/me",
    authenticateToken,
    getMe
);

export default router;