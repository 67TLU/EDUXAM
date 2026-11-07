import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ClipboardList, Loader2, DoorOpen, ArrowRight } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import apiClient from "../../api/client";
import { useAuthStore } from "../../store/authStore";

export default function StudentDashboard() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/exam-sessions/my-submissions").catch(() => null);
        setSubs(res?.data?.data || []);
      } catch {
        setSubs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title={`Xin chào, ${user?.full_name?.split(" ").pop()}!`}
        description="Xem lại các bài thi bạn đã và đang làm"
        actions={
          <Link to="/student/join">
            <Button><DoorOpen className="size-4" /> Vào phòng thi mới</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : subs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ClipboardList className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Bạn chưa tham gia bài thi nào. Nhập mã phòng để bắt đầu!</p>
            <Link to="/student/join"><Button variant="outline">Vào phòng thi</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y p-0">
            {subs.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{s.exam_title}</p>
                  <p className="text-xs text-muted-foreground">
                    Lần thử {s.attempt_number} • {s.submitted_at ? `Nộp lúc ${new Date(s.submitted_at).toLocaleString("vi-VN")}` : "Chưa nộp"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.total_score != null && (
                    <span className="text-sm font-bold text-primary">{s.total_score}/{s.max_score}</span>
                  )}
                  <Badge
                    variant={s.status === "graded" ? "success" : s.status === "in_progress" ? "warning" : "secondary"}
                  >
                    {s.status === "graded" ? "Đã chấm" : s.status === "in_progress" ? "Đang làm" : s.status === "submitted" ? "Chờ chấm" : s.status}
                  </Badge>
                  {s.status === "in_progress" && (
                    <Link to={`/student/exam-session/${s.session_id}`}>
                      <Button size="sm">Tiếp tục <ArrowRight className="size-3" /></Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
