import { useState } from "react";

// Khung xem trước: giống hệt học sinh thấy, nhưng hiện thêm đáp án đúng cho giáo viên
export default function PreviewFrame({ question, index, Renderer }) {
  const [answer, setAnswer] = useState(null);
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-medium text-gray-900">
        {index != null && <>Câu {index + 1}: </>}{question.title || <i className="text-gray-400">(chưa có nội dung)</i>}
        {question.is_required && <span className="text-red-500"> *</span>}
        {Number(question.points) > 0 && <span className="ml-2 text-xs font-normal text-gray-500">({Number(question.points)} điểm)</span>}
      </div>
      {question.description && <p className="text-xs text-gray-500">{question.description}</p>}
      <Renderer question={question} answer={answer} onAnswer={setAnswer} showCorrect />
    </div>
  );
}