import * as examService from "../services/exam.service.js";
import { successResponse } from "../utils/api-response.js";

const h = (fn) => async (req, res, next) => {
    try { await fn(req, res); } catch (e) { next(e); }
};

// POST /api/exam-sessions — Giáo viên tạo kỳ thi / phòng khảo sát
export const createSession = h(async (req, res) => {
    const result = await examService.createExamSession(req.user.userId, req.body);
    return successResponse(res, { statusCode: 201, message: "Tạo kỳ thi thành công", data: result });
});

// GET /api/exam-sessions — Danh sách phiên thi của giáo viên
export const listSessions = h(async (req, res) => {
    const data = await examService.listExamSessions(req.user.userId, req.query);
    return successResponse(res, { data });
});

// GET /api/exam-sessions/:id — Chi tiết phiên thi
export const getSession = h(async (req, res) => {
    const data = await examService.getExamSession(req.params.id, req.user.userId);
    return successResponse(res, { data });
});

// PATCH /api/exam-sessions/:id/status — Đổi trạng thái (bắt đầu/kết thúc/hủy)
export const updateStatus = h(async (req, res) => {
    const data = await examService.updateSessionStatus(req.params.id, req.user.userId, req.body.status);
    return successResponse(res, { message: "Cập nhật trạng thái thành công", data });
});

// POST /api/exam-sessions/join — Học sinh tham gia bằng mã access_code
export const joinSession = h(async (req, res) => {
    const result = await examService.joinExamSession(req.user.userId, req.body.access_code);
    return successResponse(res, { message: result.resumed ? "Tiếp tục bài làm của bạn" : "Tham gia phòng thi thành công", data: result });
});

// GET /api/exam-sessions/:id/questions — Lấy đề thi (đã xáo trộn, không lộ đáp án)
export const getQuestions = h(async (req, res) => {
    const data = await examService.getSessionQuestions(req.params.id, req.user.userId);
    return successResponse(res, { data });
});

// PUT /api/submissions/:id/draft — Lưu nháp từng câu (autosave)
export const saveDraft = h(async (req, res) => {
    const { question_id, answer_text, answer_json } = req.body;
    const data = await examService.saveDraftAnswer(req.params.id, req.user.userId, question_id, answer_text, answer_json);
    return successResponse(res, { message: "Đã lưu", data });
});

// GET /api/submissions/:id/draft — Lấy lại bài nháp đã lưu (khôi phục sau khi reload)
export const getDraft = h(async (req, res) => {
    const [rows] = await examService.getDraftAnswers(req.params.id, req.user.userId);
    return successResponse(res, { data: rows });
});

// POST /api/submissions/:id/submit — Nộp bài
export const submitSession = h(async (req, res) => {
    const result = await examService.submitExam(req.params.id, req.user.userId, req.body.answers);
    return successResponse(res, { message: "Nộp bài thi thành công", data: result });
});

// POST /api/submissions/:id/auto-submit — Tự động nộp khi hết giờ (frontend gọi khi đồng hồ về 0)
export const autoSubmit = h(async (req, res) => {
    const result = await examService.submitExam(req.params.id, req.user.userId, req.body.answers || [], { auto: true });
    return successResponse(res, { message: "Hết giờ — hệ thống đã tự động nộp bài", data: result });
});

// POST /api/submissions/:id/anti-cheat — Ghi nhận hành vi đáng ngờ
export const antiCheat = h(async (req, res) => {
    const data = await examService.logAntiCheatEvent(req.params.id, req.user.userId, req.body.event_type, req.body.detail);
    return successResponse(res, { message: "Đã ghi nhận", data });
});

// GET /api/submissions/:id/anti-cheat — Giáo viên xem lịch sử chống gian lận
export const getAntiCheat = h(async (req, res) => {
    const data = await examService.getAntiCheatEvents(req.params.id, req.user.userId);
    return successResponse(res, { data });
});

// PUT /api/answers/:id/grade — Chấm điểm thủ công 1 câu (tự luận)
export const gradeAnswer = h(async (req, res) => {
    const data = await examService.gradeAnswer(req.params.id, req.user.userId, Number(req.body.points), req.body.feedback);
    return successResponse(res, { message: "Chấm điểm thành công", data });
});

// POST /api/exam-sessions/:id/publish — Công bố điểm + gửi thông báo
export const publishGrades = h(async (req, res) => {
    const data = await examService.publishGrades(req.params.id, req.user.userId);
    return successResponse(res, { message: `Đã công bố điểm cho ${data.published} bài làm`, data });
});

// GET /api/exam-sessions/:id/analytics — Phân tích từng câu hỏi
export const getAnalytics = h(async (req, res) => {
    const data = await examService.getQuestionAnalytics(req.params.id, req.user.userId);
    return successResponse(res, { data });
});

// GET /api/exam-sessions/:id/submissions/:subId/answers — Chi tiết bài làm để chấm
export const getSubmissionDetail = h(async (req, res) => {
    const data = await examService.getSubmissionDetail(req.params.id, req.params.subId, req.user.userId);
    return successResponse(res, { data });
});
