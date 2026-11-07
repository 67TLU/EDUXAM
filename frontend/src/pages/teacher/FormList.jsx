import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  listFormsApi, createFormApi, duplicateFormApi, deleteFormApi, updateFormApi,
} from "../../api/forms";
import { FORM_TYPE_LABEL, STATUS_LABEL, STATUS_STYLE, errMsg } from "../../builder/constants";

const createSchema = z.object({
  title: z.string().trim().min(1, "Vui lòng nhập tiêu đề").max(255),
  form_type: z.enum(["exam", "quiz", "survey"]),
});

function CreateDialog({ onClose, onCreated }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm({ resolver: zodResolver(createSchema), defaultValues: { title: "", form_type: "exam" } });
  const submit = async (v) => {
    try {
      const res = await createFormApi(v);
      toast.success("Đã tạo biểu mẫu");
      onCreated(res.data.id);
    } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md space-y-4 rounded-xl bg-white p-5">
        <h2 className="text-lg font-bold">Tạo biểu mẫu mới</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Tiêu đề *</label>
          <input autoFocus {...register("title")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
          {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Loại</label>
          <select {...register("form_type")} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="exam">Bài thi (có điểm, giới hạn thời gian)</option>
            <option value="quiz">Bài kiểm tra nhanh (có điểm)</option>
            <option value="survey">Khảo sát (không chấm điểm)</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Hủy</button>
          <button disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">Tạo và soạn câu hỏi</button>
        </div>
      </form>
    </div>
  );
}

export default function FormList() {
  const navigate = useNavigate();
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...(q && { q }), ...(status && { status }), ...(type && { form_type: type }) };
      setData((await listFormsApi(params)).data);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  }, [page, q, status, type]);

  // debounce 300ms khi gõ tìm kiếm
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const act = async (fn, okMsg) => {
    try { await fn(); toast.success(okMsg); load(); } catch (e) { toast.error(errMsg(e)); }
  };
  const pages = Math.max(1, Math.ceil(data.total / data.limit));
  const sel = "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Biểu mẫu của tôi</h1>
        <button onClick={() => setCreating(true)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">+ Tạo biểu mẫu</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Tìm theo tiêu đề..." className={`${sel} w-64`} />
        <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={sel}>
          <option value="">Tất cả loại</option>
          {Object.entries(FORM_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={sel}>
          <option value="">Đang dùng (không gồm lưu trữ)</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr><th className="px-4 py-3">Tiêu đề</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Nội dung</th><th className="px-4 py-3">Cập nhật</th><th className="px-4 py-3 text-right">Thao tác</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>}
            {!loading && !data.items.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Chưa có biểu mẫu nào.</td></tr>}
            {!loading && data.items.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium"><Link to={`/teacher/forms/${f.id}/edit`} className="text-indigo-700 hover:underline">{f.title}</Link></td>
                <td className="px-4 py-3">{FORM_TYPE_LABEL[f.form_type]}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[f.status]}`}>{STATUS_LABEL[f.status]}</span></td>
                <td className="px-4 py-3 text-gray-600">{f.question_count} câu{f.form_type !== "survey" && ` • ${Number(f.total_points)} điểm`}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(f.updated_at).toLocaleString("vi-VN")}</td>
                <td className="space-x-3 px-4 py-3 text-right text-xs">
                  <Link to={`/teacher/forms/${f.id}/edit`} className="text-indigo-600">Sửa</Link>
                  <button onClick={() => act(() => duplicateFormApi(f.id), "Đã nhân bản")} className="text-gray-600">Nhân bản</button>
                  {f.status === "archived"
                    ? <button onClick={() => act(() => updateFormApi(f.id, { status: "draft" }), "Đã khôi phục")} className="text-gray-600">Khôi phục</button>
                    : <button onClick={() => act(() => updateFormApi(f.id, { status: "archived" }), "Đã lưu trữ")} className="text-gray-600">Lưu trữ</button>}
                  <button onClick={() => window.confirm(`Xóa “${f.title}”?`) && act(() => deleteFormApi(f.id), "Đã xóa")} className="text-red-600">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{data.total} biểu mẫu</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Trước</button>
          <span>Trang {page}/{pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Sau</button>
        </div>
      </div>

      {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={(id) => navigate(`/teacher/forms/${id}/edit`)} />}
    </div>
  );
}