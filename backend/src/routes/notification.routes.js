import express from "express";
import pool from "../config/database.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { successResponse } from "../utils/api-response.js";
import { getUserNotifications, markAsRead } from "../services/notification.service.js";

const router = express.Router();
router.use(authenticateToken);

router.get("/", async (req, res, next) => {
    try {
        const notifications = await getUserNotifications(req.user.userId);
        return successResponse(res, { message: "Lấy thông báo thành công", data: notifications });
    } catch (error) {
        next(error);
    }
});

router.put("/:id/read", async (req, res, next) => {
    try {
        await markAsRead(req.params.id, req.user.userId);
        return successResponse(res, { message: "Đã cập nhật trạng thái thông báo" });
    } catch (error) {
        next(error);
    }
});

export default router;