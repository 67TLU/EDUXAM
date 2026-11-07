import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, Copy, UserPlus } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import apiClient from "../../api/client";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Backend hiện có POST /classes; danh sách lấy qua endpoint user/classes nếu có, tạm dùng query trực tiếp
      const res = await apiClient.get("/classes").catch(() => ({ data: { data: [] } }));
      setClasses(res.data?.data || res.data || []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const copy = (code) => { navigator.clipboard.writeText(code); toast.success(`Đã sao chép mã lớp: ${code}`); };

  return (
    <div>
      <PageHeader
        title="Lớp học"
        description="Quản lý lớp học và mã tham gia"
        actions={
          <>
            <Button variant="outline" onClick={() => setShowJoin(true)}><UserPlus className="size-4" /> Tham gia lớp</Button>
            <Button onClick={() => setShowCreate(true)}><Plus className="size-4" /> Tạo lớp</Button>
          </>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Chưa có lớp học nào. Tạo lớp mới hoặc tham gia bằng mã lớp.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <Badge variant={c.status === "active" ? "success" : "secondary"}>{c.status}</Badge>
                </div>
                <button onClick={() => copy(c.join_code)} className="mt-3 flex items-center gap-1 font-mono text-sm font-bold text-primary cursor-pointer hover:underline">
                  {c.join_code} <Copy className="size-3" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateClassDialog open={showCreate} onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); load(); }} />
      <JoinClassDialog open={showJoin} onClose={() => setShowJoin(false)} onDone={() => { setShowJoin(false); load(); }} />
    </div>
  );
}

function CreateClassDialog({ open, onClose, onDone }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const handleCreate = async () => {
    if (!form.name) { toast.error("Nhập tên lớp"); return; }
    try {
      setSaving(true);
      const res = await apiClient.post("/classes", form);
      toast.success(`Tạo lớp thành công! Mã lớp: ${res.data.data?.join_code || "xem chi tiết"}`);
      onDone();
    } catch (e) {
      toast.error(e.response?.data?.message || "Tạo lớp thất bại");
    } finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Tạo lớp học</DialogTitle>
          <DialogDescription>Học sinh tham gia bằng mã lớp được tạo tự động</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Tên lớp *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: 10A1" />
          </div>
          <div className="space-y-1.5">
            <Label>Mô tả</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Khối 10 - Ban cơ bản" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />} Tạo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function JoinClassDialog({ open, onClose, onDone }) {
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const handleJoin = async () => {
    if (!code.trim()) { toast.error("Nhập mã lớp"); return; }
    try {
      setSaving(true);
      await apiClient.post("/classes/join", { join_code: code.trim().toUpperCase() });
      toast.success("Tham gia lớp thành công!");
      onDone();
    } catch (e) {
      toast.error(e.response?.data?.message || "Mã lớp không hợp lệ");
    } finally { setSaving(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Tham gia lớp học</DialogTitle>
          <DialogDescription>Nhập mã lớp do giáo viên cung cấp</DialogDescription>
        </DialogHeader>
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VD: CLS10A1" className="text-center font-mono font-bold tracking-widest" />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleJoin} disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />} Tham gia</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
