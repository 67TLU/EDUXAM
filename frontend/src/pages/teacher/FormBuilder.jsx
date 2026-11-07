import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  getFormDetailApi, addQuestionApi, updateQuestionApi, deleteQuestionApi,
  duplicateQuestionApi, reorderQuestionsApi,
} from "../../api/forms";
import QuestionEditor from "../../questions/QuestionEditor";
import QuestionRenderer from "../../questions/QuestionRenderer";
import { QUESTION_TYPE_LIST } from "../../questions/registry";
import { fromQuestion } from "../../questions/schemas";
import QuestionList from "../../builder/QuestionList";
import SettingsTab from "../../builder/SettingsTab";
import PublishTab from "../../builder/PublishTab";
import { FORM_TYPE_LABEL, STATUS_LABEL, STATUS_STYLE, errMsg } from "../../builder/constants";

const TABS = [["questions", "Câu hỏi"], ["settings", "Cài đặt"], ["preview", "Xem thử"], ["publish", "Xuất bản"]];

// Xem thử đúng như học sinh thấy (không lưu gì)
function StudentPreview({ form }) {
  const [answers, setAnswers] = useState({});
  const s = form.settings ?? {};
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="rounded-lg bg-amber-50 p-2 text-center text-xs text-amber-800">Chế độ xem thử — câu trả lời không được lưu</p>
      <div className="rounded-xl border-t-4 bg-white p-5 shadow-sm" style={{ borderColor: s.theme?.primary_color ?? "#4f46e5" }}>
        <h2 className="text-lg font-bold">{form.title}</h2>
        {form.description && <p className="mt-1 text-sm text-gray-600">{form.description}</p>}
        {s.instructions && <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{s.instructions}</p>}
        {form.form_type !== "survey" && (
          <p className="mt-3 text-xs text-gray-500">
            {s.time_limit_minutes ? `Thời gian: ${s.time_limit_minutes} phút • ` : "Không giới hạn thời gian • "}
            {form.questions.length} câu
          </p>
        )}
      </div>
      {form.questions.map((q, i) => (
        <QuestionRenderer key={q.id} question={q} index={i} answer={answers[q.id]}
          onAnswer={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
      ))}
    </div>
  );
}

export default function FormBuilder() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [tab, setTab] = useState("questions");
  const [editing, setEditing] = useState(null); // {mode:"new",type} | {mode:"edit",question}
  const [busy, setBusy] = useState(false);
  const editorRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await getFormDetailApi(id);
      setForm(res.data);
      setLoadErr("");
    } catch (e) { setLoadErr(errMsg(e)); }
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (editing?.mode === "new") editorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [editing]);

  if (loadErr) return <div className="p-8 text-center text-red-600">{loadErr} <Link to="/teacher/forms" className="underline">Quay lại</Link></div>;
  if (!form) return <div className="p-8 text-center text-gray-500">Đang tải...</div>;

  const graded = form.form_type !== "survey";

  const run = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); if (okMsg) toast.success(okMsg); await load(); return true; }
    catch (e) { toast.error(errMsg(e)); return false; }
    finally { setBusy(false); }
  };

  const saveNew = async (payload) => {
    if (await run(() => addQuestionApi(form.id, payload), "Đã thêm câu hỏi")) setEditing(null);
  };
  const saveEdit = async (payload) => {
    if (await run(() => updateQuestionApi(form.id, editing.question.id, payload), "Đã cập nhật câu hỏi")) setEditing(null);
  };
  const remove = (q) => {
    if (!window.confirm("Xóa câu hỏi này?")) return;
    run(() => deleteQuestionApi(form.id, q.id), "Đã xóa câu hỏi");
  };
  const duplicate = (q) => run(() => duplicateQuestionApi(form.id, q.id), "Đã nhân bản");
  const move = async (i, d) => {
    const qs = [...form.questions];
    const j = i + d;
    if (j < 0 || j >= qs.length) return;
    [qs[i], qs[j]] = [qs[j], qs[i]];
    setForm((f) => ({ ...f, questions: qs })); // cập nhật ngay trên màn hình
    run(() => reorderQuestionsApi(form.id, qs.map((q) => Number(q.id))));
  };

  const renderEditor = (q) => (
    <QuestionEditor key={`edit-${q.id}`} type={q.question_type} graded={graded} initial={fromQuestion(q)}
      submitLabel="Lưu thay đổi" onSubmit={saveEdit} onCancel={() => setEditing(null)} />
  );

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/teacher/forms" className="text-sm text-indigo-600">← Danh sách biểu mẫu</Link>
          <h1 className="mt-1 text-xl font-bold">{form.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-800">{FORM_TYPE_LABEL[form.form_type]}</span>
            <span className={`rounded-full px-2 py-0.5 ${STATUS_STYLE[form.status]}`}>{STATUS_LABEL[form.status]}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${tab === k ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "questions" && (
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {QUESTION_TYPE_LIST.map((t) => (
              <button key={t.type} title={t.hint} disabled={busy}
                onClick={() => setEditing({ mode: "new", type: t.type })}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm hover:border-indigo-400">+ {t.label}</button>
            ))}
          </div>

          <QuestionList questions={form.questions} busy={busy}
            editingId={editing?.mode === "edit" ? editing.question.id : null} renderEditor={renderEditor}
            onEdit={(q) => setEditing({ mode: "edit", question: q })}
            onMove={move} onDuplicate={duplicate} onDelete={remove} />

          {editing?.mode === "new" && (
            <div ref={editorRef}>
              <QuestionEditor key={`new-${editing.type}`} type={editing.type} graded={graded}
                onSubmit={saveNew} onCancel={() => setEditing(null)} submitLabel="Thêm vào biểu mẫu" />
            </div>
          )}
        </div>
      )}

      {tab === "settings" && <SettingsTab key={form.updated_at} form={form} onSaved={load} />}
      {tab === "preview" && <StudentPreview form={form} />}
      {tab === "publish" && <PublishTab form={form} onPublished={load} />}
    </div>
  );
}