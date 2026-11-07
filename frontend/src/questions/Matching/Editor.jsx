import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Plus, X } from "lucide-react";

// settings.pairs: [{ left, right }] — học sinh nối mỗi cột trái với 1 giá trị cột phải (kéo thả/nhấn chọn)
export default function Editor({ question = {}, onChange = () => {} }) {
  const settings = question.settings || {};
  const pairs = settings.pairs || [];

  const update = (next) => onChange({ settings: { ...settings, ...next } });
  const setPair = (i, field, val) =>
    update({ pairs: pairs.map((p, j) => (j === i ? { ...p, [field]: val } : p)) });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Tạo các cặp nối (cột trái — cột phải). Học sinh sẽ ghép mỗi mục trái với đúng mục phải.
      </p>
      <div className="space-y-2">
        <Label>Các cặp ghép ({pairs.length})</Label>
        <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
          <span className="text-xs text-muted-foreground">Cột trái</span>
          <span />
          <span className="text-xs text-muted-foreground">Cột phải (đáp án)</span>
          <span />
          {pairs.map((p, i) => (
            <>
              <Input key={`l${i}`} value={p.left || ""} onChange={(e) => setPair(i, "left", e.target.value)} placeholder={`Mục ${i + 1}`} />
              <span key={`a${i}`} className="text-xs text-muted-foreground">—</span>
              <Input key={`r${i}`} value={p.right || ""} onChange={(e) => setPair(i, "right", e.target.value)} placeholder="Giá trị tương ứng" />
              <Button key={`d${i}`} variant="ghost" size="icon-xs" onClick={() => update({ pairs: pairs.filter((_, j) => j !== i) })}><X className="size-3.5" /></Button>
            </>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => update({ pairs: [...pairs, { left: "", right: "" }] })}>
          <Plus className="size-3.5" /> Thêm cặp
        </Button>
      </div>
    </div>
  );
}
