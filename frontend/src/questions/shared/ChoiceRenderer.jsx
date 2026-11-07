// Dùng cho: 1 đáp án, nhiều đáp án, đúng/sai
export default function ChoiceRenderer({ question, answer, onAnswer, disabled, showCorrect, multiple = false }) {
  const options = question.options ?? [];
  const idOf = (o, i) => o.id ?? i;
  const selected = multiple ? (answer?.selectedOptionIds ?? []) : [answer?.selectedOptionId];

  const pick = (id) => {
    if (disabled) return;
    if (multiple) {
      const s = new Set(selected);
      s.has(id) ? s.delete(id) : s.add(id);
      onAnswer({ selectedOptionIds: [...s] });
    } else {
      onAnswer({ selectedOptionId: id });
    }
  };

  return (
    <div className="space-y-2">
      {options.map((o, i) => {
        const id = idOf(o, i);
        const checked = selected.includes(id);
        const mark = showCorrect && o.is_correct ? "border-green-500 bg-green-50" : "border-gray-200";
        return (
          <label key={id} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm ${mark}`}>
            <input type={multiple ? "checkbox" : "radio"} name={`q-${question.id ?? "preview"}`}
              checked={checked} disabled={disabled} onChange={() => pick(id)} className="h-4 w-4" />
            <span><b>{String.fromCharCode(65 + i)}.</b> {o.option_text}</span>
            {showCorrect && o.is_correct && <span className="ml-auto text-xs text-green-700">Đáp án đúng</span>}
          </label>
        );
      })}
    </div>
  );
}