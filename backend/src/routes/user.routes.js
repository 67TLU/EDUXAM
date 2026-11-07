import express from "express";

import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deactivateUser
} from "../controllers/user.controller.js";

import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.use(authenticateToken);

// GET /api/users
router.get(
    "/",
    requirePermission("user.view"),
    getUsers
);

// GET /api/users/:id
router.get(
    "/:id",
    requirePermission("user.view"),
    getUser
);

// POST /api/users
router.post(
    "/",
    requirePermission("user.create"),
    createUser
);

// PUT /api/users/:id
router.put(
    "/:id",
    requirePermission("user.update"),
    updateUser
);

// DELETE /api/users/:id
// Thực tế là chuyển status sang inactive
router.delete(
    "/:id",
    requirePermission("user.delete"),
    deactivateUser
);

export default router;
// PUT /api/users/:id/status — Khóa / mở khóa tài khoản (Admin)
router.put(
    "/:id/status",
    requirePermission("user.manage"),
    async (req, res, next) => {
        try {
            const { status } = req.body;
            if (!["active", "inactive", "locked"].includes(status)) {
                return res.status(400).json({ success: false, message: "Trạng thái không hợp lệ" });
            }
            const pool = (await import("../config/database.js")).default;
            const [result] = await pool.execute(
                "UPDATE users SET status = ? WHERE id = ?",
                [status, req.params.id]
            );
            if (!result.affectedRows) {
                return res.status(404).json({ success: false, message: "Không tìm thấy ngườii dùng" });
            }
            return res.json({ success: true, message: "Cập nhật trạng thái thành công" });
        } catch (error) { next(error); }
    }
);
