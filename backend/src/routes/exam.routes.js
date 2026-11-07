import express from "express";
import pool from "../config/database.js";
import { successResponse } from "../utils/api-response.js";
import {
    createSession, listSessions, getSession, updateStatus,
    joinSession, getQuestions, saveDraft, getDraft,
    submitSession, autoSubmit, antiCheat, getAntiCheat,
    gradeAnswer, publishGrades, getAnalytics, getSubmissionDetail
} from "../controllers/exam.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
    createExamSessionSchema, updateSessionStatusSchema,
    joinExamSchema, submitExamSchema, draftAnswerSchema,
    antiCheatSchema, gradeAnswerSchema
} from "../validators/exam.validator.js";

const router = express.Router();

// bọc async handler: lỗi tự chuyển sang errorHandler
const h = (fn) => async (req, res, next) => {
    try { await fn(req, res); } catch (e) { next(e); }
};

router.use(authenticateToken);

// ----- Giáo viên -----
router.post("/", requirePermission("exam.create"), validate(createExamSessionSchema), createSession);
router.get("/", requirePermission("exam.monitor"), listSessions);
router.get("/:id", requirePermission("exam.monitor"), getSession);
router.patch("/:id/status", requirePermission("exam.create"), validate(updateSessionStatusSchema), updateStatus);
router.get("/:id/analytics", requirePermission("report.view"), getAnalytics);
router.post("/:id/publish", requirePermission("exam.grade"), publishGrades);
router.get("/:id/submissions/:subId/answers", requirePermission("exam.grade"), getSubmissionDetail);

// ----- Học sinh -----
// Lưu ý: route cụ thể "/my-submissions" phải khai báo TRƯỚC "/:id" để không bị Express bắt nhầm
router.get("/my-submissions", requirePermission("exam.submit"), h(async (req, res) => {
    const [rows] = await pool.execute(
        `
        SELECT s.id, s.session_id, s.attempt_number, s.started_at, s.submitted_at, s.status, s.total_score, s.max_score,
               es.title AS exam_title, es.access_code, es.show_result
        FROM submissions s
        JOIN exam_sessions es ON es.id = s.session_id
        WHERE s.user_id = ?
        ORDER BY s.id DESC
        LIMIT 50
        `,
        [req.user.userId]
    );
    return successResponse(res, { data: rows });
}));
router.post("/join", requirePermission("exam.submit"), validate(joinExamSchema), joinSession);
router.get("/:id/questions", requirePermission("exam.submit"), getQuestions);

// ----- Bài làm -----
router.put("/submissions/:id/draft", requirePermission("exam.submit"), validate(draftAnswerSchema), saveDraft);
router.get("/submissions/:id/draft", requirePermission("exam.submit"), getDraft);
router.post("/submissions/:id/submit", requirePermission("exam.submit"), validate(submitExamSchema), submitSession);
router.post("/submissions/:id/auto-submit", requirePermission("exam.submit"), validate(submitExamSchema), autoSubmit);
router.post("/submissions/:id/anti-cheat", requirePermission("exam.submit"), validate(antiCheatSchema), antiCheat);
router.get("/submissions/:id/anti-cheat", requirePermission("exam.monitor"), getAntiCheat);
router.put("/answers/:id/grade", requirePermission("exam.grade"), validate(gradeAnswerSchema), gradeAnswer);

export default router;
