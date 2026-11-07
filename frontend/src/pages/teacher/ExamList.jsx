import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Loader2, Copy, BarChart3, Users, Radio } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { listSessionsApi, createSessionApi, updateSessionStatusApi, publishGradesApi } from "../../api/exam";
import { listFormsApi } from "../../api/forms";

const STATUS = {
  scheduled: { label: "Đã lên lịch", variant: "info" },
  active: { label: "Đang diễn ra", variant: "success" },
  finished: { label: "Đã kết thúc", variant: "secondary" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
};

export default function ExamList() {
  const [data, setData] = useState({ sessions: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") || "";

  const load = async () => {
    setLoading(true);
    try {
      const res = await listSessionsApi({ limit: 50, status: statusFilter || undefined });
      setData(res.data);
    } catch (e) {
      toast.error("Không tải được danh sách kỳ thi");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [statusFilter]);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã phòng: ${code}`);
  };

  const changeStatus = async (id, status) => {
    try {
      await updateSessionStatusApi(id, status);
      toast.success("Cập nhật trạng thái thành công");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const publish = async (id) => {
    try {
      const res = await publishGradesApi(id);
      toast.success(`Đã công bố ${res.data.published} bài làm`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Công bố thất bại");
    }
  };

  return (
    <div>
      <PageHeader
        title="Kỳ thi & Phòng khảo sát"
        description="Tạo phiên thi, theo dõi kết quả trực tiếp và quản lý điểm"
        actions={<Button onClick={() => setShowCreate(true)}><Plus className="size-4" /> Tạo phiên mới</Button>}
      />

      <Tabs value={statusFilter || "all"} onValueChange={(v) => setSearchParams(v === "all" ? {} : { status: v })} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="scheduled">Đã lên lịch</TabsTrigger>
          <TabsTrigger value="active">Đang diễn ra</TabsTrigger>
          <TabsTrigger value="finished">Đã kết thúc</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : data.sessions.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Chưa có phiên thi nào. Nhấn "Tạo phiên mới" để bắt đầu.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Mã phòng</TableHead>
                  <TableHead>Bài nộp</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sessions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.form_title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.session_type === "survey" ? "info" : "secondary"}>
                        {s.session_type === "survey" ? "Khảo sát" : "Thi"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => copyCode(s.access_code)} className="flex items-center gap-1 font-mono text-sm font-bold text-primary cursor-pointer hover:underline">
                        {s.access_code} <Copy className="size-3" />
                      </button>
                    </TableCell>
                    <TableCell>{s.submission_count}</TableCell>
                    <TableCell><Badge variant={STATUS[s.status]?.variant || "outline"}>{STATUS[s.status]?.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {s.status === "scheduled" && (
                          <Button size="xs" variant="outline" onClick={() => changeStatus(s.id, "active")}>Mở phòng</Button>
                        )}
                        {s.status === "active" && (
                          <>
                            <Link to={`/teacher/exams/${s.id}/live`}>
                              <Button size="xs" variant="outline"><Radio className="size-3" /> Giám sát</Button>
                            </Link>
                            <Button size="xs" variant="outline" onClick={() => changeStatus(s.id, "finished")}>Kết thúc</Button>
                          </>
                        )}
                        {s.status === "finished" && <Button size="xs" variant="outline" onClick={() => publish(s.id)}>Công bố điểm</Button>}
                        <Link to={`/teacher/exams/${s.id}/results`}>
                          <Button size="xs" variant="ghost"><BarChart3 className="size-3" /> Kết quả</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateSessionDialog open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />
    </div>
  );
}

function CreateSessionDialog({ open, onClose, onCreated }) {
  const [forms, setForms] = useState([]);
  const [form, setForm] = useState({
    form_id: "", title: "", session_type: "exam", duration_minutes: 45,
    attempts_allowed: 1, shuffle_questions: true, shuffle_options: true,
    anti_cheat: true, show_result: true, passing_score: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      listFormsApi({ status: "published", limit: 100 })
        .then((res) => setForms(res.data?.items || []))
        .catch(() => toast.error("Không tải được danh sách biểu mẫu"));
    }
  }, [open]);

  const set = (k) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [k]: v });
  };

  const handleCreate = async () => {
    if (!form.form_id || !form.title) {
      toast.error("Chọn biểu mẫu và nhập tiêu đề");
      return;
    }
    try {
      setSaving(true);
      const res = await createSessionApi({
        ...form,
        form_id: Number(form.form_id),
        duration_minutes: form.session_type === "exam" ? Number(form.duration_minutes) : undefined,
        passing_score: form.passing_score ? Number(form.passing_score) : undefined,
      });
      toast.success(`Tạo thành công! Mã phòng: ${res.data.access_code}`);
      onCreated();
    } catch (e) {
      toast.error(e.response?.data?.message || "Tạo phiên thi thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Tạo phiên thi / phòng khảo sát</DialogTitle>
          <DialogDescription>Học sinh tham gia bằng mã phòng. Mã được tạo tự động.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Biểu mẫu (đã xuất bản) *</Label>
            <Select value={form.form_id} onChange={set("form_id")}>
              <option value="">— Chọn biểu mẫu —</option>
              {forms.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tiêu đề phiên *</Label>
            <Input value={form.title} onChange={set("title")} placeholder="VD: Kiểm tra 15 phút - Tiết 1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Loại phiên</Label>
              <Select value={form.session_type} onChange={set("session_type")}>
                <option value="exam">Bài thi</option>
                <option value="survey">Khảo sát trực tiếp</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Số lần làm tối đa</Label>
              <Input type="number" min="1" value={form.attempts_allowed} onChange={set("attempts_allowed")} />
            </div>
          </div>
          {form.session_type === "exam" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Thời gian gian (phút)</Label>
                <Input type="number" min="1" value={form.duration_minutes} onChange={set("duration_minutes")} />
              </div>
              <div className="space-y-1.5">
                <Label>Điểm đạt (tùy chọn)</Label>
                <Input type="number" min="0" value={form.passing_score} onChange={set("passing_score")} placeholder="VD: 5" />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border p-3 text-sm">
            {[
              ["shuffle_questions", "Xáo trộn câu hỏi"],
              ["shuffle_options", "Xáo trộn đáp án"],
              ["anti_cheat", "Chống gian lận (chặn đổi tab, copy)"],
              ["show_result", "Hiện điểm ngay sau khi nộp"],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form[k]} onChange={set(k)} className="size-4 accent-primary" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />} Tạo phiên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
