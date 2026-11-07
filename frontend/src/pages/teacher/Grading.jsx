import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, Loader2, ShieldAlert } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { getExamResultsApi } from "../../api/report";
import { gradeAnswerApi, getAntiCheatEventsApi, publishGradesApi } from "../../api/exam";
import apiClient from "../../api/client";

const TYPE_LABEL = {
  multiple_choice: "TN 1 đáp án", multiple_select: "TN nhiều đáp án", true_false: "Đúng/Sai",
  short_answer: "Trả lời ngắn", long_answer: "Tự luận", fill_blank: "Điền chỗ trống",
  ordering: "Sắp xếp", matching: "Ghép đôi", rating: "Đánh giá",
};

export default function Grading() {
  const { sessionId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null); // submission đang chấm
  const [answers, setAnswers] = useState([]);
  const [cheatEvents, setCheatEvents] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getExamResultsApi(sessionId);
      setReport(res.data);
    } catch {
      toast.error("Không tải được danh sách bài nộp");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [sessionId]);

  const openGrading = async (submission) => {
    setGrading(submission);
    try {
      const res = await apiClient.get(`/exam-sessions/${sessionId}/submissions/${submission.id}/answers`).catch(() => null);
      if (res) setAnswers(res.data.data);
      else setAnswers([]);
    } catch { setAnswers([]); }
    try {
      const cheat = await getAntiCheatEventsApi(submission.id);
      setCheatEvents(cheat.data || []);
    } catch { setCheatEvents([]); }
  };

  const submitGrade = async (answerId, points, maxPoints) => {
    if (points === "" || Number(points) < 0 || Number(points) > maxPoints) {
      toast.error(`Điểm phải từ 0 đến ${maxPoints}`);
      return;
    }
    try {
      await gradeAnswerApi(answerId, Number(points), "");
      toast.success("Đã lưu điểm");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Chấm điểm thất bại");
    }
  };

  const publish = async () => {
    try {
      const res = await publishGradesApi(sessionId);
      toast.success(`Đã công bố ${res.data.published} bài`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Công bố thất bại");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <PageHeader
        title={`Chấm điểm: ${report?.session?.title || ""}`}
        description="Chấm tay các câu tự luận, kiểm tra cảnh báo chống gian lận rồi công bố điểm"
        actions={
          <>
            <Link to={`/teacher/exams/${sessionId}/results`}>
              <Button variant="outline"><ArrowLeft className="size-4" /> Báo cáo</Button>
            </Link>
            <Button onClick={publish}><CheckCircle className="size-4" /> Công bố tất cả điểm</Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="p-3">Học sinh</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Điểm</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(report?.submissions || []).map((s) => (
                <tr key={s.id}>
                  <td className="p-3">
                    <p className="font-medium">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant={s.status === "graded" ? "success" : s.status === "submitted" ? "warning" : "outline"}>
                      {s.status === "graded" ? "Đã chấm" : s.status === "submitted" ? "Chờ chấm tự luận" : s.status}
                    </Badge>
                  </td>
                  <td className="p-3 font-bold">{s.total_score ?? "—"} / {s.max_score}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => openGrading(s)}>Chấm chi tiết</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dialog chấm chi tiết */}
      <Dialog open={!!grading} onOpenChange={() => setGrading(null)}>
        <DialogContent onClose={() => setGrading(null)} className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bài làm của {grading?.full_name}</DialogTitle>
            <DialogDescription>Chấm điểm từng câu tự luận bên dưới</DialogDescription>
          </DialogHeader>

          {cheatEvents.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
              <p className="flex items-center gap-1 font-semibold text-amber-800">
                <ShieldAlert className="size-4" /> {cheatEvents.length} cảnh báo chống gian lận
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-amber-700">
                {cheatEvents.map((e) => (
                  <li key={e.id}>{e.event_type} — {e.detail} ({new Date(e.created_at).toLocaleTimeString("vi-VN")})</li>
                ))}
              </ul>
            </div>
          )}

          {answers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              API chi tiết bài làm chưa có sẵn trong backend — dùng nút "Công bố tất cả điểm" để chấm theo điểm tự động.
            </p>
          ) : (
            <div className="space-y-4">
              {answers.map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <Badge variant="outline">{TYPE_LABEL[a.question_type] || a.question_type}</Badge>
                    <span className="text-xs text-muted-foreground">Tối đa {a.max_points} điểm</span>
                  </div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="mt-1 rounded bg-muted p-2 text-sm">{a.answer_text || JSON.stringify(a.answer_json)}</p>
                  {["long_answer", "file_upload"].includes(a.question_type) ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Input
                        type="number" min="0" max={a.max_points} step="0.5"
                        defaultValue={a.points_awarded}
                        placeholder="Điểm"
                        className="w-28"
                      />
                      <Button size="sm" onClick={(e) => {
                        const input = e.target.closest("div").querySelector("input");
                        submitGrade(a.id, input.value, a.max_points);
                      }}>Lưu điểm</Button>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm">
                      {a.is_correct === 1 ? "✅ Đúng" : a.is_correct === 0 ? "❌ Sai" : "➖ Không chấm"} — {a.points_awarded} điểm
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setGrading(null)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
