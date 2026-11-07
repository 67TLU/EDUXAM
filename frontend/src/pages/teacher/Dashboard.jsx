import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { FileText, ClipboardList, Users, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { listSessionsApi } from "../../api/exam";
import { listFormsApi } from "../../api/forms";

export default function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [exams, forms] = await Promise.all([
          listSessionsApi({ limit: 20 }),
          listFormsApi({ limit: 100 }).catch(() => ({ data: { forms: [], total: 0 } })),
        ]);
        const sessions = exams.data?.sessions || [];
        setStats({
          totalForms: forms.data?.total || forms.data?.items?.length || 0,
          totalSessions: sessions.length,
          activeSessions: sessions.filter((s) => s.status === "active").length,
          totalSubmissions: sessions.reduce((sum, s) => sum + (s.submission_count || 0), 0),
          recent: sessions.slice(0, 5),
        });
      } catch (e) {
        toast.error("Không tải được dữ liệu tổng quan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;

  const cards = [
    { label: "Biểu mẫu", value: stats.totalForms, icon: FileText, to: "/teacher/forms" },
    { label: "Kỳ thi / Phòng khảo sát", value: stats.totalSessions, icon: ClipboardList, to: "/teacher/exams" },
    { label: "Đang diễn ra", value: stats.activeSessions, icon: TrendingUp, to: "/teacher/exams?status=active" },
    { label: "Lượt làm bài", value: stats.totalSubmissions, icon: Users, to: "/teacher/exams" },
  ];

  return (
    <div>
      <PageHeader title="Tổng quan" description="Chào mừng trở lại! Đây là hoạt động gần đây của bạn." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold">Phiên thi gần đây</h2>
      <Card>
        <CardContent className="divide-y p-0">
          {stats.recent.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">Chưa có phiên thi nào. Tạo kỳ thi đầu tiên nhé!</p>
          )}
          {stats.recent.map((s) => (
            <Link
              key={s.id}
              to={`/teacher/exams/${s.id}/results`}
              className="flex items-center justify-between p-4 text-sm transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-xs text-muted-foreground">
                  Mã: {s.access_code} • {s.submission_count} bài nộp • {s.session_type === "survey" ? "Khảo sát" : "Thi"}
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
