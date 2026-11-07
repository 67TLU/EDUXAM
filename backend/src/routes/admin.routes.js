import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { successResponse } from "../utils/api-response.js";
import * as adminService from "../services/admin.service.js";

const router = express.Router();
router.use(authenticateToken);

// Chỉ tài khoản có quyền quản lý hệ thống mới truy cập được
router.get(
    "/stats",
    requirePermission("user.view"), // Hoặc một permission quản trị riêng
    async (req, res, next) => {
        try {
            const stats = await adminService.getSystemStats();
            return successResponse(res, { message: "Lấy thống kê hệ thống thành công", data: stats });
        } catch (error) {
            next(error);
        }
    }
);

router.get(
    "/audit-logs",
    requirePermission("user.view"),
    async (req, res, next) => {
        try {
            const logs = await adminService.getAuditLogs();
            return successResponse(res, { message: "Lấy nhật ký hệ thống thành công", data: logs });
        } catch (error) {
            next(error);
        }
    }
);

export default router;