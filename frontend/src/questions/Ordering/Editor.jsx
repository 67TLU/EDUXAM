import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react";

// settings.items: mảng các phần tử ĐÚNG theo thứ tự tăng dần / đúng logic
export default function Editor({ question = {}, onChange = () => {} }) {
  const settings = question.settings || {};
  const items = settings.items || [];

  const update = (next) => onChange({ settings: { ...settings, ...next } });
  const setItem = (i, val) => update({ items: items.map((x, j) => (j === i ? val : x)) });
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    update({ items: next });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Nhập các phần tử theo <b>thứ tự đúng</b>. Học sinh sẽ thấy thứ tự bị xáo trộn và phải sắp xếp lại.
      </p>
      <div className="space-y-2">
        <Label>Thứ tự đúng ({items.length} phần tử)</Label>
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">{i + 1}</span>
            <Input value={it} onChange={(e) => setItem(i, e.target.value)} placeholder={`Phần tử ${i + 1}`} />
            <Button variant="ghost" size="icon-xs" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="size-3.5" /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown className="size-3.5" /></Button>
            <Button variant="ghost" size="icon-xs" onClick={() => update({ items: items.filter((_, j) => j !== i) })}><X className="size-3.5" /></Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => update({ items: [...items, ""] })}>
          <Plus className="size-3.5" /> Thêm phần tử
        </Button>
      </div>
    </div>
  );
}
