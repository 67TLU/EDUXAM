import * as reportService from "../services/report.service.js";
import { successResponse } from "../utils/api-response.js";

// GET /api/exam-sessions/:id/results
export async function getResults(req, res, next) {
    try {
        const sessionId = req.params.id;
        const data = await reportService.getExamResults(sessionId);

        return successResponse(res, {
            message: "Lấy thống kê kết quả kỳ thi thành công",
            data
        });
    } catch (error) {
        next(error);
    }
}

// GET /api/exam-sessions/:id/export-excel
export async function exportExcel(req, res, next) {
    try {
        const sessionId = req.params.id;
        await reportService.exportExamExcel(sessionId, res);
    } catch (error) {
        next(error);
    }
}

// GET /api/submissions/:id/export-pdf
export async function exportPDF(req, res, next) {
    try {
        const submissionId = req.params.id;
        await reportService.exportSubmissionPDF(submissionId, res);
    } catch (error) {
        next(error);
    }
}