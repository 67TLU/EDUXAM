import * as formService from "../services/form.service.js";
import { successResponse } from "../utils/api-response.js";

// POST /api/forms
export async function createForm(req, res, next) {
    try {
        // req.user được lấy từ middleware authenticateToken trước đó
        const userId = req.user.userId; 
        const formId = await formService.createForm(userId, req.body);

        return successResponse(res, {
            statusCode: 201,
            message: "Tạo biểu mẫu thành công",
            data: { id: formId }
        });
    } catch (error) {
        next(error);
    }
}

// POST /api/forms/:id/questions
export async function addQuestion(req, res, next) {
    try {
        const formId = req.params.id;
        const userId = req.user.userId;

        const questionId = await formService.addQuestionToForm(formId, userId, req.body);

        return successResponse(res, {
            statusCode: 201,
            message: "Thêm câu hỏi thành công",
            data: { id: questionId }
        });
    } catch (error) {
        next(error);
    }
}
// GET /api/forms/:id
export async function getForm(req, res, next) {
    try {
        const formId = req.params.id;
        const form = await formService.getFormById(formId);

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy biểu mẫu"
            });
        }

        return successResponse(res, {
            message: "Lấy chi tiết biểu mẫu thành công",
            data: form
        });
    } catch (error) {
        next(error);
    }
}

// PUT /api/forms/:id
export async function updateForm(req, res, next) {
    try {
        const formId = req.params.id;
        const userId = req.user.userId;

        await formService.updateForm(formId, userId, req.body);

        return successResponse(res, {
            message: "Cập nhật biểu mẫu thành công"
        });
    } catch (error) {
        next(error);
    }
}

// DELETE /api/forms/:id
export async function removeForm(req, res, next) {
    try {
        const formId = req.params.id;
        const success = await formService.deleteForm(formId);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy biểu mẫu"
            });
        }

        return successResponse(res, {
            message: "Xóa biểu mẫu thành công"
        });
    } catch (error) {
        next(error);
    }
}