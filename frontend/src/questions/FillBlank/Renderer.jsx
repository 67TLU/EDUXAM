import { useMemo } from "react";
import { Button } from "../../components/ui/button";
import { ArrowUp, ArrowDown, GripVertical, Check } from "lucide-react";
import { cn } from "cn";

// value: { order: string[] }
export default function Renderer({ question, answer, onAnswer = () => {}, showCorrect = false }) {
  const settings = question.settings || {};
  const correctOrder = settings.items || [];

  // Thứ tự ban đầu: xáo trộn (seed theo question id để không nhảy mỗi lần render)
  const shuffled = useMemo(() => {
    const seed = Number(question.id) || 1;
    const a = [...correctOrder];
    let s = seed * 7919;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, [correctOrder, question.id]);

  const current = answer?.order?.length ? answer.order : shuffled;

  const commit = (next) => onAnswer({ ...answer, order: next });
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= current.length) return;
    const next = [...current];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const isCorrect = showCorrect && correctOrder.length > 0 &&
    current.length === correctOrder.length && current.every((v, i) => v === correctOrder[i]);

  return (
    <div className="space-y-2">
      {current.map((item, i) => (
        <div
          key={`${item}-${i}`}
          className={cn(
            "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm",
            showCorrect && isCorrect && "border-emerald-400 bg-emerald-50",
            showCorrect && !isCorrect && "border-red-300"
          )}
        >
          <GripVertical className="size-4 text-muted-foreground" />
          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
          <span className="flex-1">{item}</span>
          <Button variant="ghost" size="icon-xs" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="size-3.5" /></Button>
          <Button variant="ghost" size="icon-xs" onClick={() => move(i, 1)} disabled={i === current.length - 1}><ArrowDown className="size-3.5" /></Button>
        </div>
      ))}
      {showCorrect && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-700">
          <Check className="size-3.5" /> Thứ tự đúng: {correctOrder.join(" → ")}
        </p>
      )}
    </div>
  );
}
