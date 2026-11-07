import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, X } from "lucide-react";

// settings.blanks: mảng đáp án đúng cho từng chỗ trống
// Nội dung câu hỏi dùng ký hiệu ____ (4 gạch dưới) để đánh dấu chỗ trống
export default function Editor({ question = {}, onChange = () => {} }) {
  const settings = question.settings || {};
  const blanks = settings.blanks || [];

  const update = (next) => onChange({ settings: { ...settings, ...next } });

  const setBlank = (i, val) => {
    const next = [...blanks];
    next[i] = val;
    update({ blanks: next });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Viết nội dung câu hỏi, dùng <code className="rounded bg-muted px-1">____</code> (4 gạch dưới) để đánh dấu chỗ trống.
        Mỗi chỗ trống cần một đáp án đúng bên dưới.
      </p>
      <div className="space-y-2">
        <Label>Đáp án từng chỗ trống ({blanks.length})</Label>
        {blanks.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs text-muted-foreground">Chỗ trống {i + 1}</span>
            <Input value={b || ""} onChange={(e) => setBlank(i, e.target.value)} placeholder="Đáp án đúng" />
            <Button variant="ghost" size="icon-xs" onClick={() => update({ blanks: blanks.filter((_, j) => j !== i) })}>
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => update({ blanks: [...blanks, ""] })}>
          <Plus className="size-3.5" /> Thêm chỗ trống
        </Button>
      </div>
    </div>
  );
}
