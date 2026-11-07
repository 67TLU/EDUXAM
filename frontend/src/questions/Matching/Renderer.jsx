import { useMemo, useState } from "react";
import { cn } from "cn";
import { Check, X } from "lucide-react";

// value: { matches: { [left]: right } }
export default function Renderer({ question, answer, onAnswer = () => {}, showCorrect = false }) {
  const settings = question.settings || {};
  const pairs = settings.pairs || [];
  const matches = answer?.matches || {};
  const [selectedLeft, setSelectedLeft] = useState(null);

  // Cột phải hiển thị xáo trộn
  const rights = useMemo(() => {
    const seed = (Number(question.id) || 1) * 31;
    const a = pairs.map((p) => p.right);
    let s = seed + 17;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, [pairs, question.id]);

  const pick = (right) => {
    if (selectedLeft == null) return;
    onAnswer({ ...answer, matches: { ...matches, [selectedLeft]: right } });
    setSelectedLeft(null);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Cột trái */}
      <div className="space-y-2">
        {pairs.map((p) => {
          const chosen = matches[p.left];
          const correct = showCorrect && pairs.find((x) => x.left === p.left);
          return (
            <button
              key={p.left}
              type="button"
              onClick={() => setSelectedLeft(selectedLeft === p.left ? null : p.left)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm transition-colors cursor-pointer text-left",
                selectedLeft === p.left && "border-primary ring-2 ring-ring/40",
                showCorrect && chosen != null &&
                  (chosen === p.right ? "border-emerald-400 bg-emerald-50" : "border-red-300 bg-red-50")
              )}
            >
              <span>{p.left}</span>
              {chosen != null && (
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  → {chosen}
                  {showCorrect && (chosen === p.right ? <Check className="size-3.5 text-emerald-600" /> : <X className="size-3.5 text-red-500" />)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Cột phải */}
      <div className="space-y-2">
        {rights.map((r) => {
          const used = Object.values(matches).includes(r);
          return (
            <button
              key={r}
              type="button"
              onClick={() => pick(r)}
              disabled={used && matches[selectedLeft] !== r}
              className={cn(
                "w-full rounded-lg border bg-card px-3 py-2 text-sm transition-colors cursor-pointer text-left",
                used ? "opacity-40" : "hover:border-primary",
                selectedLeft != null && !used && "border-dashed"
              )}
            >
              {r}
            </button>
          );
        })}
      </div>
    </div>
  );
}
