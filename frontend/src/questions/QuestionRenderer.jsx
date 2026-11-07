import { QUESTION_TYPES } from "./registry";
// Hiển thị cho học sinh làm bài (không hiện đáp án đúng)
export default function QuestionRenderer({ question, index, answer, onAnswer, disabled }) {
  const meta = QUESTION_TYPES[question.question_type];
  if (!meta) return <p className="text-sm text-red-600">Loại câu hỏi chưa hỗ trợ</p>;
  const { Renderer } = meta;
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm font-medium text-gray-900">
        Câu {index + 1}: {question.title}{question.is_required && <span className="text-red-500"> *</span>}
        {Number(question.points) > 0 && <span className="ml-2 text-xs font-normal text-gray-500">({Number(question.points)} điểm)</span>}
      </div>
      {question.description && <p className="text-xs text-gray-500">{question.description}</p>}
      <Renderer question={question} answer={answer} onAnswer={onAnswer} disabled={disabled} />
    </div>
  );
}