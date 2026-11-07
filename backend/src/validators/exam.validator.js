import { z } from "zod";

// Schema tạo kỳ thi / khảo sát
export const createExamSessionSchema = z.object({
    form_id: z.coerce.number().int().positive("Form ID không hợp lệ"),
    title: z.string().trim().min(1, "Tiêu đề kỳ thi không được để trống").max(255),
    session_type: z.enum(["survey", "exam"], {
        errorMap: () => ({ message: "Loại phiên phải là survey hoặc exam" })
    }),
    access_code: z.string().trim().min(3).max(30).optional(),
    start_time: z.string().datetime({ message: "Thời gian bắt đầu không hợp lệ (ISO 8601)" }).optional(),
    end_time: z.string().datetime({ message: "Thời gian kết thúc không hợp lệ (ISO 8601)" }).optional(),
    duration_minutes: z.coerce.number().int().positive().optional(),
    attempts_allowed: z.coerce.number().int().positive().default(1),
    shuffle_questions: z.boolean().optional(),
    shuffle_options: z.boolean().optional(),
    anti_cheat: z.boolean().optional(),
    show_result: z.boolean().optional(),
    passing_score: z.coerce.number().min(0).optional()
});

// Schema đổi trạng thái phiên thi
export const updateSessionStatusSchema = z.object({
    status: z.enum(["scheduled", "active", "finished", "cancelled"], {
        errorMap: () => ({ message: "Trạng thái phải là scheduled/active/finished/cancelled" })
    })
});

// Schema lưu nháp 1 câu
export const draftAnswerSchema = z.object({
    question_id: z.coerce.number().int().positive(),
    answer_text: z.string().max(10000).optional(),
    answer_json: z.any().optional()
});

// Schema ghi nhận chống gian lận
export const antiCheatSchema = z.object({
    event_type: z.enum(["tab_switch", "window_blur", "copy_paste", "right_click", "devtools", "fullscreen_exit"]),
    detail: z.string().max(500).optional()
});

// Schema chấm điểm tay
export const gradeAnswerSchema = z.object({
    points: z.coerce.number().min(0, "Điểm không được âm"),
    feedback: z.string().max(2000).optional()
});

// Schema tham gia phòng thi
export const joinExamSchema = z.object({
    access_code: z.string().trim().min(1, "Mã tham gia không được để trống")
});

// Schema nộp bài thi
export const submitExamSchema = z.object({
    answers: z.array(
        z.object({
            question_id: z.coerce.number().int().positive(),
            answer_text: z.string().optional(), // Dành cho tự luận / short answer
            answer_json: z.any().optional()     // Dành cho trắc nghiệm (ví dụ: { selectedOptionId: 2 })
        })
    ).min(0) // cho phép mảng rỗng khi hệ thống tự động nộp bài
});