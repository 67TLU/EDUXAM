import express from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createFormSchema, updateFormSchema, listFormsQuerySchema,
    createQuestionSchema, updateQuestionSchema, reorderSchema
} from "../validators/form.validator.js";
import * as formService from "../services/form.service.js";
import * as builder from "../services/form-builder.service.js";
import { successResponse } from "../utils/api-response.js";

const router = express.Router();
router.use(authenticateToken);

// bọc async handler: lỗi tự chuyển sang errorHandler
const h = (fn) => async (req, res, next) => {
    try { await fn(req, res); } catch (e) { next(e); }
};

router.get("/", requirePermission("form.view"), validate(listFormsQuerySchema, "query"),
    h(async (req, res) => successResponse(res, { data: await builder.listForms(req.user, req.query) })));

router.post("/", requirePermission("form.create"), validate(createFormSchema),
    h(async (req, res) => {
        const id = await formService.createForm(req.user.userId, req.body);
        successResponse(res, { statusCode: 201, message: "Tạo biểu mẫu thành công", data: { id } });
    }));

router.get("/:id", requirePermission("form.view"),
    h(async (req, res) => successResponse(res, { data: await builder.getForm(req.params.id, req.user) })));

router.put("/:id", requirePermission("form.update"), validate(updateFormSchema),
    h(async (req, res) => {
        await builder.updateForm(req.params.id, req.user, req.body);
        successResponse(res, { message: "Cập nhật biểu mẫu thành công" });
    }));

router.delete("/:id", requirePermission("form.delete"),
    h(async (req, res) => {
        await builder.deleteForm(req.params.id, req.user);
        successResponse(res, { message: "Xóa biểu mẫu thành công" });
    }));

router.post("/:id/duplicate", requirePermission("form.create"),
    h(async (req, res) => {
        const id = await builder.duplicateForm(req.params.id, req.user);
        successResponse(res, { statusCode: 201, message: "Nhân bản thành công", data: { id } });
    }));

router.get("/:id/publish-check", requirePermission("form.view"),
    h(async (req, res) => {
        const { problems } = await builder.checkPublishable(req.params.id, req.user);
        successResponse(res, { data: { ok: problems.length === 0, problems } });
    }));

router.post("/:id/publish", requirePermission("form.publish"),
    h(async (req, res) => successResponse(res, { data: await builder.publishForm(req.params.id, req.user) })));

// ----- câu hỏi (route "reorder" phải đứng trước "/:qid") -----
router.post("/:id/questions", requirePermission("form.update"), validate(createQuestionSchema),
    h(async (req, res) => {
        const id = await builder.addQuestion(req.params.id, req.user, req.body);
        successResponse(res, { statusCode: 201, message: "Thêm câu hỏi thành công", data: { id } });
    }));

router.put("/:id/questions/reorder", requirePermission("form.update"), validate(reorderSchema),
    h(async (req, res) => {
        await builder.reorderQuestions(req.params.id, req.user, req.body.ids);
        successResponse(res, { message: "Cập nhật thứ tự thành công" });
    }));

router.put("/:id/questions/:qid", requirePermission("form.update"), validate(updateQuestionSchema),
    h(async (req, res) => {
        await builder.updateQuestion(req.params.id, req.params.qid, req.user, req.body);
        successResponse(res, { message: "Cập nhật câu hỏi thành công" });
    }));

router.delete("/:id/questions/:qid", requirePermission("form.update"),
    h(async (req, res) => {
        await builder.deleteQuestion(req.params.id, req.params.qid, req.user);
        successResponse(res, { message: "Xóa câu hỏi thành công" });
    }));

router.post("/:id/questions/:qid/duplicate", requirePermission("form.update"),
    h(async (req, res) => {
        const id = await builder.duplicateQuestion(req.params.id, req.params.qid, req.user);
        successResponse(res, { statusCode: 201, message: "Nhân bản câu hỏi thành công", data: { id } });
    }));

export default router;