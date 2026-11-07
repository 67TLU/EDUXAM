import { ArrowUp, ArrowDown, Copy, Pencil, Trash2 } from "lucide-react";
import QuestionPreview from "../questions/QuestionPreview";
import { QUESTION_TYPES } from "../questions/registry";

const btn = "rounded-md p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-30";

export default function QuestionList({ questions, editingId, renderEditor, onEdit, onMove, onDuplicate, onDelete, busy }) {
  if (!questions.length) {
    return <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
      Chưa có câu hỏi nào. Bấm một loại câu hỏi ở trên để thêm.</p>;
  }
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id}>
          {editingId === q.id ? renderEditor(q) : (
            <>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-gray-500">{QUESTION_TYPES[q.question_type]?.label ?? q.question_type}</span>
                <div className="flex items-center">
                  <button className={btn} title="Lên" disabled={busy || i === 0} onClick={() => onMove(i, -1)}><ArrowUp size={16} /></button>
                  <button className={btn} title="Xuống" disabled={busy || i === questions.length - 1} onClick={() => onMove(i, 1)}><ArrowDown size={16} /></button>
                  <button className={btn} title="Nhân bản" disabled={busy} onClick={() => onDuplicate(q)}><Copy size={16} /></button>
                  {QUESTION_TYPES[q.question_type] && (
                    <button className={btn} title="Sửa" disabled={busy} onClick={() => onEdit(q)}><Pencil size={16} /></button>
                  )}
                  <button className={`${btn} text-red-600`} title="Xóa" disabled={busy} onClick={() => onDelete(q)}><Trash2 size={16} /></button>
                </div>
              </div>
              <QuestionPreview question={q} index={i} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}