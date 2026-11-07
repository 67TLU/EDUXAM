import { Star } from "lucide-react";
import { cn } from "cn";

// value: { rating: number }
export default function Renderer({ question, answer, onAnswer = () => {}, showCorrect = false }) {
  const settings = question.settings || {};
  const max = settings.max || 5;
  const rating = answer?.rating || 0;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onAnswer({ ...answer, rating: n })}
          className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110"
          aria-label={`${n} sao`}
        >
          <Star
            className={cn(
              "size-7",
              n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
      {rating > 0 && <span className="ml-2 text-sm font-medium text-muted-foreground">{rating}/{max}</span>}
    </div>
  );
}
