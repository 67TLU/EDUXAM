import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { successResponse } from "../utils/api-response.js";

const router = express.Router();

// POST /api/upload
router.post("/", authenticateToken, upload.single("file"), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Không có file nào được tải lên" });
        }

        // Trả về đường dẫn truy cập file cho client
        const fileUrl = `/uploads/${req.file.filename}`;

        return successResponse(res, {
            message: "Tải lên file thành công",
            data: { url: fileUrl }
        });
    } catch (error) {
        next(error);
    }
});

export default router;