const countWords = (s) => (s.trim() ? s.trim().split(/\s+/).length : 0);
export default function Renderer({ question, answer, onAnswer, disabled }) {
  const text = answer?.text ?? "";
  const max = question.settings?.max_words || 0;
  return (
    <div className="space-y-1">
      <textarea value={text} disabled={disabled} rows={6} placeholder="Nhập bài làm của bạn..."
        onChange={(e) => { if (!max || countWords(e.target.value) <= max) onAnswer({ text: e.target.value }); }}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      <p className="text-right text-xs text-gray-500">{countWords(text)}{max ? ` / ${max}` : ""} từ</p>
    </div>
  );
}