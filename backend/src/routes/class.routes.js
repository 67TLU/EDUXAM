import express from "express";
import pool from "../config/database.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createClassSchema, joinClassSchema } from "../validators/class.validator.js";
import * as classService from "../services/class.service.js";
import { successResponse } from "../utils/api-response.js";

const router = express.Router();
router.use(authenticateToken);

// Danh sách lớp của tôi
router.get("/", requirePermission("class.view"), async (req, res, next) => {
    try {
        const isAdmin = req.user.roles?.some((r) => r.code === "admin");
        const data = await classService.listClasses(req.user.userId, isAdmin);
        return successResponse(res, { data });
    } catch (error) { next(error); }
});

// Tạo lớp học (Giáo viên / Admin)
router.post("/", requirePermission("class.manage"), validate(createClassSchema), async (req, res, next) => {
    try {
        const result = await classService.createClass(req.user.userId, req.body);
        return successResponse(res, { statusCode: 201, message: "Tạo lớp học thành công", data: result });
    } catch (error) {
        next(error);
    }
});

// Học sinh tham gia lớp học
router.post("/join", requirePermission("class.view"), validate(joinClassSchema), async (req, res, next) => {
    try {
        const result = await classService.joinClass(req.user.userId, req.body.join_code);
        return successResponse(res, { message: "Tham gia lớp học thành công", data: result });
    } catch (error) {
        next(error);
    }
});

export default router;