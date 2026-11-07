import { z } from "zod";

export const FORM_TYPES = ["survey", "quiz", "exam"];
export const QUESTION_TYPES = [
    "multiple_choice",   // trắc nghiệm 1 đáp án
    "multiple_select",   // trắc nghiệm nhiều đáp án
    "true_false",
    "short_answer",
    "long_answer",       // tự luận
    "rating", "date", "file_upload"
];
const CHOICE_TYPES = ["multiple_choice", "multiple_select", "true_false"];

// ---------- Cài đặt form (giáo viên chỉnh bằng giao diện, lưu JSON) ----------
export const formSettingsSchema = z.object({
    instructions: z.string().max(5000).optional(),
    time_limit_minutes: z.number().int().min(0).max(1440).optional(),   // 0 = không giới hạn
    max_attempts: z.number().int().min(1).max(100).optional(),
    shuffle_questions: z.boolean().optional(),
    shuffle_options: z.boolean().optional(),
    show_result: z.enum(["immediately", "after_publish", "never"]).optional(),
    pass_score: z.number().min(0).optional(),
    theme: z.object({
        primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Màu phải dạng #RRGGBB").optional()
    }).optional(),
    anti_cheat: z.object({
        track_tab_switch: z.boolean().optional(),
        max_tab_switch: z.number().int().min(1).max(100).optional(),
        auto_submit_on_limit: z.boolean().optional(),
        disable_copy_paste: z.boolean().optional()
    }).optional()
});

export const createFormSchema = z.object({
    title: z.string().trim().min(1, "Tiêu đề form không được để trống").max(255),
    description: z.string().trim().optional(),
    form_type: z.enum(FORM_TYPES, { message: "Loại form phải là survey, quiz hoặc exam" }),
    settings: formSettingsSchema.optional()
});

// Không cho đặt status = published qua đây (phải qua /publish để được kiểm tra)
export const updateFormSchema = z.object({
    title: z.string().trim().min(1, "Tiêu đề form không được để trống").max(255).optional(),
    description: z.string().trim().optional(),
    form_type: z.enum(FORM_TYPES).optional(),
    status: z.enum(["draft", "archived"]).optional(),
    settings: formSettingsSchema.optional()
});

export const listFormsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
    q: z.string().trim().max(100).optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
    form_type: z.enum(FORM_TYPES).optional()
});

// ---------- Câu hỏi ----------
const optionSchema = z.object({
    option_text: z.string().trim().min(1, "Nội dung đáp án không được để trống").max(1000),
    is_correct: z.boolean().default(false),
    sort_order: z.number().int().default(0)
});

// "Phải có đáp án đúng" chỉ kiểm tra lúc XUẤT BẢN (khảo sát không có đáp án đúng)
export const createQuestionSchema = z.object({
    question_type: z.enum(QUESTION_TYPES, { message: "Loại câu hỏi không hợp lệ" }),
    title: z.string().trim().min(1, "Nội dung câu hỏi không được để trống"),
    description: z.string().trim().optional(),
    is_required: z.boolean().default(false),
    points: z.number().min(0).default(0),
    sort_order: z.number().int().default(0),   // bị bỏ qua, server tự đặt thứ tự
    settings: z.record(z.string(), z.any()).optional(),
    options: z.array(optionSchema).optional()
}).superRefine((q, ctx) => {
    if (CHOICE_TYPES.includes(q.question_type) && (q.options?.length ?? 0) < 2) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "Cần ít nhất 2 đáp án" });
    }
});
export const updateQuestionSchema = createQuestionSchema;

export const reorderSchema = z.object({
    ids: z.array(z.coerce.number().int().positive()).min(1)
});