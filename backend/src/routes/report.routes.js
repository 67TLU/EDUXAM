import express from "express";
import { getResults, exportExcel, exportPDF } from "../controllers/report.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.use(authenticateToken);

// Xem thống kê kết quả kỳ thi (Giáo viên / Admin)
router.get(
    "/exam-sessions/:id/results",
    requirePermission("report.view"),
    getResults
);

// Xuất file Excel bảng điểm kỳ thi
router.get(
    "/exam-sessions/:id/export-excel",
    requirePermission("report.export"),
    exportExcel
);

// Xuất file PDF kết quả bài làm cá nhân
router.get(
    "/submissions/:id/export-pdf",
    requirePermission("exam.submit"),
    exportPDF
);

export default router;