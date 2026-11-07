import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { updateFormApi } from "../api/forms";
import { errMsg } from "./constants";

const schema = z.object({
  title: z.string().trim().min(1, "Tiêu đề không được để trống").max(255),
  description: z.string().optional(),
  instructions: z.string().max(5000, "Tối đa 5000 ký tự").optional(),
  time_limit_minutes: z.coerce.number({ message: "Phải là số" }).int().min(0).max(1440, "Tối đa 1440 phút"),
  max_attempts: z.coerce.number({ message: "Phải là số" }).int().min(1, "Ít nhất 1 lần").max(100),
  pass_score: z.coerce.number({ message: "Phải là số" }).min(0),
  show_result: z.enum(["immediately", "after_publish", "never"]),
  shuffle_questions: z.boolean(),
  shuffle_options: z.boolean(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Màu dạng #RRGGBB"),
  track_tab_switch: z.boolean(),
  max_tab_switch: z.coerce.number({ message: "Phải là số" }).int().min(1).max(100),
  auto_submit_on_limit: z.boolean(),
  disable_copy_paste: z.boolean(),
});

const field = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

export default function SettingsTab({ form, onSaved }) {
  const s = form.settings ?? {};
  const graded = form.form_type !== "survey";
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: form.title, description: form.description ?? "", instructions: s.instructions ?? "",
      time_limit_minutes: s.time_limit_minutes ?? 0, max_attempts: s.max_attempts ?? 1,
      pass_score: s.pass_score ?? 0, show_result: s.show_result ?? "after_publish",
      shuffle_questions: s.shuffle_questions ?? false, shuffle_options: s.shuffle_options ?? false,
      primary_color: s.theme?.primary_color ?? "#4f46e5",
      track_tab_switch: s.anti_cheat?.track_tab_switch ?? true, max_tab_switch: s.anti_cheat?.max_tab_switch ?? 3,
      auto_submit_on_limit: s.anti_cheat?.auto_submit_on_limit ?? false,
      disable_copy_paste: s.anti_cheat?.disable_copy_paste ?? false,
    },
  });

  const save = async (v) => {
    const settings = { instructions: v.instructions || undefined, theme: { primary_color: v.primary_color } };
    if (graded) {
      Object.assign(settings, {
        time_limit_minutes: v.time_limit_minutes, max_attempts: v.max_attempts, pass_score: v.pass_score,
        show_result: v.show_result, shuffle_questions: v.shuffle_questions, shuffle_options: v.shuffle_options,
        anti_cheat: {
          track_tab_switch: v.track_tab_switch, max_tab_switch: v.max_tab_switch,
          auto_submit_on_limit: v.auto_submit_on_limit, disable_copy_paste: v.disable_copy_paste,
        },
      });
    }
    try {
      await updateFormApi(form.id, { title: v.title, description: v.description ?? "", settings });
      toast.success("Đã lưu cài đặt");
      onSaved();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const err = (n) => (errors[n] ? <p className="text-xs text-red-600">{errors[n].message}</p> : null);
  const check = (n, label) => (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register(n)} /> {label}</label>
  );

  return (
    <form onSubmit={handleSubmit(save)} className="max-w-2xl space-y-6">
      <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
        <h3 className="font-semibold">Thông tin chung</h3>
        <div><label className="mb-1 block text-sm font-medium">Tiêu đề *</label><input {...register("title")} className={field} />{err("title")}</div>
        <div><label className="mb-1 block text-sm font-medium">Mô tả</label><textarea rows={2} {...register("description")} className={field} /></div>
        <div><label className="mb-1 block text-sm font-medium">Hướng dẫn làm bài (hiện cho học sinh trước khi bắt đầu)</label>
          <textarea rows={3} {...register("instructions")} className={field} />{err("instructions")}</div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Màu chủ đạo</label>
          <input type="color" {...register("primary_color")} className="h-9 w-14 rounded border border-gray-300" />{err("primary_color")}
        </div>
      </section>

      {graded && (
        <>
          <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">Làm bài & chấm điểm</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="mb-1 block text-sm font-medium">Thời gian (phút)</label>
                <input type="number" min={0} {...register("time_limit_minutes")} className={field} />
                <p className="text-xs text-gray-500">0 = không giới hạn</p>{err("time_limit_minutes")}</div>
              <div><label className="mb-1 block text-sm font-medium">Số lần làm tối đa</label>
                <input type="number" min={1} {...register("max_attempts")} className={field} />{err("max_attempts")}</div>
              <div><label className="mb-1 block text-sm font-medium">Điểm đạt</label>
                <input type="number" step="0.25" min={0} {...register("pass_score")} className={field} />{err("pass_score")}</div>
            </div>
            <div><label className="mb-1 block text-sm font-medium">Hiển thị kết quả cho học sinh</label>
              <select {...register("show_result")} className={field}>
                <option value="immediately">Ngay sau khi nộp bài</option>
                <option value="after_publish">Sau khi giáo viên công bố điểm</option>
                <option value="never">Không hiển thị</option>
              </select></div>
            {check("shuffle_questions", "Trộn thứ tự câu hỏi")}
            {check("shuffle_options", "Trộn thứ tự đáp án")}
          </section>

          <section className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">Chống gian lận</h3>
            {check("track_tab_switch", "Ghi nhận khi chuyển tab / mất focus")}
            <div className="flex items-center gap-2 text-sm">Cảnh báo/xử lý sau
              <input type="number" min={1} {...register("max_tab_switch")} className="w-20 rounded-lg border border-gray-300 px-2 py-1" /> lần
            </div>
            {err("max_tab_switch")}
            {check("auto_submit_on_limit", "Tự động nộp bài khi vượt số lần")}
            {check("disable_copy_paste", "Chặn copy / dán / chuột phải")}
            <p className="text-xs text-gray-500">Các biện pháp này chỉ mang tính răn đe, web không thể chặn hoàn toàn việc chụp màn hình.</p>
          </section>
        </>
      )}

      <button type="submit" disabled={isSubmitting || !isDirty}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
        {isSubmitting ? "Đang lưu..." : "Lưu cài đặt"}
      </button>
    </form>
  );
}