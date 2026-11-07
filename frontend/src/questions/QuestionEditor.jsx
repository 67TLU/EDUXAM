import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QUESTION_TYPES } from "./registry";
import QuestionPreview from "./QuestionPreview";
import { buildQuestionSchema, defaultValuesFor, toPayload } from "./schemas";

// Giáo viên soạn câu hỏi. Truyền key khác nhau khi đổi câu/loại để form reset.
// graded=false cho khảo sát (không điểm, không đáp án đúng).
export default function QuestionEditor({ type, initial, graded = true, onSubmit, onCancel, submitLabel = "Lưu câu hỏi" }) {
  const meta = QUESTION_TYPES[type];
  const methods = useForm({
    resolver: zodResolver(buildQuestionSchema(type, graded)),
    defaultValues: initial ?? defaultValuesFor(type, graded),
  });
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = methods;
  const { Editor } = meta;
  const livePreview = toPayload(type, watch());

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit((v) => onSubmit(toPayload(type, v)))} className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-indigo-200 bg-white p-4">
          <h3 className="font-semibold text-gray-900">{meta.label}</h3>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nội dung câu hỏi *</label>
            <textarea {...register("title")} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gợi ý / mô tả thêm</label>
            <input {...register("description")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <Editor graded={graded} />

          <div className="flex items-center gap-6">
            {graded && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Điểm</label>
                <input type="number" step="0.25" min={0} {...register("points")} className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                {errors.points && <p className="text-xs text-red-600">{errors.points.message}</p>}
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("is_required")} /> Bắt buộc trả lời
            </label>
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{submitLabel}</button>
            {onCancel && <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Hủy</button>}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Xem trước (cập nhật trực tiếp)</p>
          <QuestionPreview question={livePreview} />
        </div>
      </form>
    </FormProvider>
  );
}