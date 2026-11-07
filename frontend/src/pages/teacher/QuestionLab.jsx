import { useState } from "react";
import QuestionEditor from "../../questions/QuestionEditor";
import QuestionPreview from "../../questions/QuestionPreview";
import { QUESTION_TYPE_LIST } from "../../questions/registry";

// Trang thử nghiệm Bước 1 (chưa lưu server). Bước 2 sẽ gắn vào FormBuilder thật.
export default function QuestionLab() {
  const [type, setType] = useState(null);
  const [list, setList] = useState([]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-xl font-bold">Thử nghiệm bộ câu hỏi</h1>

      <div className="flex flex-wrap gap-2">
        {QUESTION_TYPE_LIST.map((t) => (
          <button key={t.type} onClick={() => setType(t.type)} title={t.hint}
            className={`rounded-lg border px-3 py-2 text-sm ${type === t.type ? "border-indigo-600 bg-indigo-50" : "border-gray-300 bg-white"}`}>
            + {t.label}
          </button>
        ))}
      </div>

      {type && (
        <QuestionEditor key={type} type={type}
          onSubmit={(payload) => { setList((l) => [...l, payload]); setType(null); }}
          onCancel={() => setType(null)} />
      )}

      <div className="space-y-3">
        {list.map((q, i) => <QuestionPreview key={i} question={q} index={i} />)}
        {!list.length && <p className="text-sm text-gray-500">Chưa có câu hỏi nào. Chọn một loại ở trên để thêm.</p>}
      </div>
    </div>
  );
}