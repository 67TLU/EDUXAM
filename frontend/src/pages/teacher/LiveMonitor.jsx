import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Users, Radio, ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { getSessionApi, getSessionAnalyticsApi } from "../../api/exam";
import { getSocket } from "../../lib/socket";
import { useAuthStore } from "../../store/authStore";

// Giáo viên theo dõi phòng khảo sát trực tiếp: ai đang online, câu trả lời gửi về realtime
export default function LiveMonitor() {
  const { sessionId } = useParams();
  const user = useAuthStore((s) => s.user);
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [liveAnswers, setLiveAnswers] = useState([]); // [{userId, fullName, answerData, at}]
  const [analytics, setAnalytics] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSessionApi(sessionId);
        setSession(res.data);
        const ana = await getSessionAnalyticsApi(sessionId).catch(() => null);
        if (ana) setAnalytics(ana.data);
      } catch (e) {
        toast.error(e.response?.data?.message || "Không tải được thông tin phòng");
      }
    })();
  }, [sessionId]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("join-room", { roomCode: sessionId, userId: user.id, fullName: `${user.full_name} (GV)` });

    socket.on("participants-update", ({ participants: p }) => setParticipants(p));
    socket.on("receive-live-answer", (data) => {
      setLiveAnswers((prev) => [data, ...prev].slice(0, 50));
    });
    socket.on("user-joined", ({ message }) => toast.info(message, { duration: 2000 }));

    return () => {
      socket.off("participants-update");
      socket.off("receive-live-answer");
      socket.off("user-joined");
    };
  }, [sessionId, user]);

  if (!session) {
    return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div>
      <PageHeader
        title={`Giám sát trực tiếp: ${session.title}`}
        description={`Mã phòng: ${session.access_code} — chia sẻ mã này cho học sinh`}
        actions={
          <Link to="/teacher/exams">
            <Button variant="outline"><ArrowLeft className="size-4" /> Quay lại</Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Danh sách ngườii đang online */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="size-4" /> Đang tham gia
            </CardTitle>
            <Badge variant="success">{participants.length} online</Badge>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Chưa có học sinh nào. Học sinh sẽ xuất hiện khi nhập mã phòng.
              </p>
            ) : (
              <ul className="divide-y">
                {participants.map((p) => (
                  <li key={p.userId} className="flex items-center gap-2 py-2 text-sm">
                    <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                    <span className="font-medium">{p.fullName}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {new Date(p.joinedAt).toLocaleTimeString("vi-VN")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Hoạt động realtime */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
            <Radio className="size-4 animate-pulse text-red-500" />
            <CardTitle className="text-sm">Hoạt động câu trả lời trực tiếp</CardTitle>
          </CardHeader>
          <CardContent>
            {liveAnswers.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Câu trả lời của học sinh sẽ hiện ở đây ngay khi họ chọn đáp án.
              </p>
            ) : (
              <ul className="max-h-96 space-y-2 overflow-y-auto">
                {liveAnswers.map((a, i) => (
                  <li key={i} className="rounded-lg border bg-muted/40 p-3 text-sm">
                    <p className="font-medium">{a.fullName}</p>
                    <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-xs">{JSON.stringify(a.answerData, null, 2)}</pre>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(a.at).toLocaleTimeString("vi-VN")}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Thống kê nhanh theo câu hỏi */}
      {analytics.length > 0 && (
        <>
          <h2 className="mt-8 mb-3 text-sm font-semibold">Tỉ lệ trả lời đúng theo câu hỏi</h2>
          <Card>
            <CardContent className="divide-y p-0">
              {analytics.map((q) => {
                const total = Number(q.answered_count) || 0;
                const pct = total ? Math.round((Number(q.correct_count) / total) * 100) : 0;
                return (
                  <div key={q.id} className="p-4">
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <p className="font-medium line-clamp-1">Câu {q.sort_order + 1}: {q.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{q.correct_count}/{total} đúng ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full transition-all ${pct >= 50 ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
