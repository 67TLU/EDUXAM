import { useEffect, useState } from "react";
import { toast } from "sonner";
import { publishCheckApi, publishFormApi } from "../api/forms";
import { STATUS_LABEL, STATUS_STYLE, errMsg } from "./constants";

export default function PublishTab({ form, onPublished }) {
  const [check, setCheck] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    publishCheckApi(form.id).then((r) => setCheck(r.data)).catch(() => setCheck(null));
  }, [form.id, form.updated_at, form.questions.length]);

  const publish = async () => {
    setBusy(true);
    try {
      const res = await publishFormApi(form.id);
      toast.success(`Đã xuất bản (phiên bản ${res.data.version})`);
      onPublished();
    } catch (e) { toast.error(errMsg(e)); }
    finally { setBusy(false); }
  };

  const total = form.questions.reduce((s, q) => s + Number(q.points || 0), 0);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Trạng thái:</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[form.status]}`}>{STATUS_LABEL[form.status]}</span>
        </div>
        <p className="text-sm text-gray-600">{form.questions.length} câu hỏi{form.form_type !== "survey" && <> • tổng {total} điểm</>}</p>
        {form.status === "draft" && (
          <p className="text-xs text-gray-500">Khi bạn sửa biểu mẫu đã xuất bản, nó quay về “Nháp” và cần xuất bản lại để áp dụng thay đổi cho các kỳ thi mới.</p>
        )}
      </div>

      {check && !check.ok && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="mb-2 text-sm font-medium text-red-800">Cần sửa trước khi xuất bản:</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
            {check.problems.map((p, i) => <li key={i}>{p.question ? `Câu ${p.question}: ` : ""}{p.message}</li>)}
          </ul>
        </div>
      )}
      {check?.ok && <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">Biểu mẫu hợp lệ, sẵn sàng xuất bản.</p>}

      <button onClick={publish} disabled={busy || !check?.ok}
        className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
        {busy ? "Đang xuất bản..." : form.status === "published" ? "Đã xuất bản" : "Xuất bản"}
      </button>
      <p className="text-xs text-gray-500">Sau khi xuất bản, bước tiếp theo là tạo phòng thi/khảo sát và lấy mã tham gia (làm ở Bước 3).</p>
    </div>
  );
}