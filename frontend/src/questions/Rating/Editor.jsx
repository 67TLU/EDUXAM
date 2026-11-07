import { Label } from "../../components/ui/input";
import { Select } from "../../components/ui/select";

// settings.max: số sao tối đa (mặc định 5)
export default function Editor({ question = {}, onChange = () => {} }) {
  const settings = question.settings || {};
  const max = settings.max || 5;

  return (
    <div className="space-y-2">
      <Label>Thang điểm tối đa</Label>
      <Select value={max} onChange={(e) => onChange({ settings: { ...settings, max: Number(e.target.value) } })}>
        {[3, 5, 10].map((n) => (
          <option key={n} value={n}>{n} mức</option>
        ))}
      </Select>
      <p className="text-xs text-muted-foreground">Học sinh chọn 1 mức trên thang ({max}). Không tự động chấm điểm — dùng cho khảo sát.</p>
    </div>
  );
}
