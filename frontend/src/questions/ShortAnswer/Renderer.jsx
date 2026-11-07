export default function Renderer({ question, answer, onAnswer, disabled, showCorrect }) {
  const accepted = question.settings?.accepted_answers ?? [];
  return (
    <div className="space-y-1">
      <input value={answer?.text ?? ""} disabled={disabled} onChange={(e) => onAnswer({ text: e.target.value })}
        placeholder="Nhập câu trả lời" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      {showCorrect && accepted.length > 0 && <p className="text-xs text-green-700">Đáp án chấp nhận: {accepted.join(" | ")}</p>}
    </div>
  );
}