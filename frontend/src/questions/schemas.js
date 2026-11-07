import { z } from "zod";

export const CHOICE_TYPES = ["multiple_choice", "multiple_select", "true_false"];
export const isChoice = (type) => CHOICE_TYPES.includes(type);

const optionSchema = z.object({
  option_text: z.string().trim().min(1, "Đáp án không được để trống"),
  is_correct: z.boolean(),
});

// graded = true  : bài thi/kiểm tra (cần đáp án đúng, điểm)
// graded = false : khảo sát (không có đáp án đúng)
export function buildQuestionSchema(type, graded = true) {
  const base = {
    title: z.string().trim().min(1, "Nội dung câu hỏi không được để trống"),
    description: z.string().optional(),
    is_required: z.boolean(),
    points: z.coerce.number({ message: "Điểm phải là số" }).min(0, "Điểm không được âm"),
  };
  if (isChoice(type)) {
    return z.object({ ...base, options: z.array(optionSchema).min(2, "Cần ít nhất 2 đáp án") })
      .superRefine((v, ctx) => {
        if (!graded) return;
        const n = v.options.filter((o) => o.is_correct).length;
        const bad = type === "multiple_select" ? n < 1 : n !== 1;
        if (bad) ctx.addIssue({ code: "custom", path: ["options"],
          message: type === "multiple_select" ? "Chọn ít nhất 1 đáp án đúng" : "Chọn đúng 1 đáp án đúng" });
      });
  }
  if (type === "short_answer") {
    return z.object({ ...base, accepted_text: z.string(), case_sensitive: z.boolean() })
      .superRefine((v, ctx) => {
        if (graded && !v.accepted_text.trim())
          ctx.addIssue({ code: "custom", path: ["accepted_text"], message: "Nhập ít nhất 1 đáp án được chấp nhận" });
      });
  }
  if (type === "long_answer") {
    return z.object({ ...base, max_words: z.coerce.number({ message: "Phải là số" }).int().min(0) });
  }
  throw new Error(`Chưa hỗ trợ loại câu hỏi: ${type}`);
}

export function defaultValuesFor(type, graded = true) {
  const common = { title: "", description: "", is_required: false, points: graded ? 1 : 0 };
  if (type === "true_false")
    return { ...common, options: [{ option_text: "Đúng", is_correct: graded }, { option_text: "Sai", is_correct: false }] };
  if (isChoice(type))
    return { ...common, options: [{ option_text: "", is_correct: graded }, { option_text: "", is_correct: false }] };
  if (type === "short_answer") return { ...common, accepted_text: "", case_sensitive: false };
  if (type === "long_answer") return { ...common, max_words: 0 };
  return common;
}

// Giá trị form -> payload đúng với API backend
export function toPayload(type, v) {
  const out = {
    question_type: type,
    title: (v.title ?? "").trim(),
    description: v.description?.trim() || undefined,
    is_required: !!v.is_required,
    points: Number(v.points) || 0,
  };
  if (isChoice(type)) {
    out.options = (v.options ?? []).map((o, i) => ({
      option_text: o.option_text, is_correct: !!o.is_correct, sort_order: i,
    }));
  } else if (type === "short_answer") {
    out.settings = {
      accepted_answers: (v.accepted_text ?? "").split("\n").map((s) => s.trim()).filter(Boolean),
      case_sensitive: !!v.case_sensitive,
    };
  } else if (type === "long_answer") {
    out.settings = { max_words: Number(v.max_words) || 0 };
  }
  return out;
}

// Câu hỏi từ API -> giá trị form (khi sửa)
export function fromQuestion(q) {
  const v = { title: q.title, description: q.description ?? "", is_required: !!q.is_required, points: Number(q.points) || 0 };
  if (isChoice(q.question_type))
    v.options = (q.options ?? []).map((o) => ({ option_text: o.option_text, is_correct: !!o.is_correct }));
  if (q.question_type === "short_answer") {
    v.accepted_text = (q.settings?.accepted_answers ?? []).join("\n");
    v.case_sensitive = !!q.settings?.case_sensitive;
  }
  if (q.question_type === "long_answer") v.max_words = q.settings?.max_words ?? 0;
  return v;
}