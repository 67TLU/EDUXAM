import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Clock, Send, Loader2, AlertTriangle, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import {
  getExamQuestionsApi, getDraftApi, saveDraftApi, submitExamApi, autoSubmitApi, logAntiCheatApi,
} from "../../api/exam";
import { QUESTION_TYPES, toSubmitAnswer } from "../../questions/registry";
import { getSocket } from "../../lib/socket";
import { useAuthStore } from "../../store/authStore";

const draftKey = (submissionId) => `exam-draft-${submissionId}`;

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TakeExam() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(location.state?.session || null);
  const [submissionId, setSubmissionId] = useState(location.state?.submissionId || null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { [questionId]: value }
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null); // giây; null = không giới hạn
  const [cheatCount, setCheatCount] = useState(0);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // ---------- Tải đề thi + khôi phục bài nháp ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await getExamQuestionsApi(sessionId);
        const data = res.data;
        setSession(data.session);
        setSubmissionId(data.submissionId);
        setQuestions(data.questions);

        // Ưu tiên 1: nháp trên server (đồng bộ nhiều thiết bị)
        // Ưu tiên 2: localStorage (chống mất khi lỡ tải lại)
        let restored = {};
        try {
          const draft = await getDraftApi(data.submissionId);
          for (const row of draft.data) {
            restored[row.question_id] = row.answer_json || { text: row.answer_text };
          }
        } catch { /* bỏ qua, dùng localStorage */ }
        if (!Object.keys(restored).length) {
          try {
            const local = JSON.parse(localStorage.getItem(draftKey(data.submissionId)) || "{}");
            restored = local.answers || {};
          } catch { /* ignore */ }
        }
        setAnswers(restored);

        // Đồng hồ đếm ngược
        if (data.session.duration_minutes) {
          const started = location.state?.startedAt ? new Date(location.state.startedAt).getTime() : Date.now();
          const elapsed = Math.floor((Date.now() - started) / 1000);
          setTimeLeft(Math.max(data.session.duration_minutes * 60 - elapsed, 0));
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Không tải được đề thi");
        navigate("/student/join");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  // ---------- Autosave: localStorage mỗi 5s + server mỗi 10s ----------
  useEffect(() => {
    if (!submissionId) return;
    const local = setInterval(() => {
      localStorage.setItem(draftKey(submissionId), JSON.stringify({ answers: answersRef.current, savedAt: Date.now() }));
    }, 5000);
    const server = setInterval(async () => {
      for (const [qid, val] of Object.entries(answersRef.current)) {
        const q = questions.find((x) => x.id === Number(qid));
        if (!q) continue;
        const payload = toSubmitAnswer(q, val) || {};
        try { await saveDraftApi(submissionId, payload); } catch { /* mất mạng thì localStorage vẫn giữ */ }
      }
    }, 10000);
    return () => { clearInterval(local); clearInterval(server); };
  }, [submissionId, questions]);

  // ---------- Đồng hồ: hết giờ tự động nộp ----------
  const doSubmit = useRef(null);
  useEffect(() => {
    if (timeLeft == null) return;
    if (timeLeft <= 0) {
      toast.warning("Hết giờ! Hệ thống đang tự động nộp bài...");
      doSubmit.current?.(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // ---------- Chống gian lận ----------
  useEffect(() => {
    if (!session?.anti_cheat || !submissionId) return;
    const log = (type, detail) => {
      setCheatCount((c) => c + 1);
      logAntiCheatApi(submissionId, type, detail).catch(() => {});
      toast.warning(`Cảnh báo: ${detail}`, { duration: 2500 });
    };
    const onVisibility = () => {
      if (document.hidden) log("tab_switch", "Chuyển sang tab khác khi đang làm bài");
    };
    const onBlur = () => log("window_blur", "Cửa sổ làm bài bị mất focus");
    const onCopy = (e) => { e.preventDefault(); log("copy_paste", "Thao tác sao chép bị chặn"); };
    const onPaste = (e) => { e.preventDefault(); log("copy_paste", "Thao tác dán bị chặn"); };
    const onContext = (e) => { e.preventDefault(); log("right_click", "Nhấn chuột phải bị chặn"); };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContext);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContext);
    };
  }, [session?.anti_cheat, submissionId]);

  // ---------- Socket: vào phòng để giáo viên theo dõi ----------
  useEffect(() => {
    if (!session?.id || !user) return;
    const socket = getSocket();
    socket.emit("join-room", { roomCode: String(session.id), userId: user.id, fullName: user.full_name });
    return () => closeSocketLeave();
    function closeSocketLeave() { /* giữ kết nối để giáo viên thấy trạng thái */ }
  }, [session?.id, user]);

  // ---------- Nộp bài ----------
  const submit = async (auto = false) => {
    if (submitting) return;
    const formatted = Object.entries(answersRef.current)
      .map(([qid, val]) => {
        const q = questions.find((x) => x.id === Number(qid));
        return q ? toSubmitAnswer(q, val) : null;
      })
      .filter(Boolean);

    if (!auto && formatted.length === 0) {
      toast.error("Bạn chưa trả lời câu hỏi nào!");
      return;
    }
    if (!auto && !window.confirm(`Nộp bài ngay? Đã trả lời ${formatted.length}/${questions.length} câu.`)) return;

    setSubmitting(true);
    try {
      const res = auto
        ? await autoSubmitApi(submissionId, formatted)
        : await submitExamApi(submissionId, formatted);
      localStorage.removeItem(draftKey(submissionId));
      const { totalScore, maxScore } = res.data;
      if (session.show_result) {
        toast.success(`Nộp bài thành công! Điểm: ${totalScore}/${maxScore}`);
      } else {
        toast.success("Nộp bài thành công! Giáo viên sẽ công bố điểm sau.");
      }
      navigate("/student/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.message || "Lỗi khi nộp bài.");
      setSubmitting(false);
    }
  };
  doSubmit.current = submit;

  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] != null && JSON.stringify(answers[q.id]) !== "{}").length,
    [questions, answers]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" /> Đang tải đề thi...
      </div>
    );
  }

  const question = questions[current];
  const meta = question ? QUESTION_TYPES[question.question_type] : null;

  return (
    <div className="min-h-screen bg-muted/30 py-6 px-4">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Header: thông tin + đồng hồ */}
        <div className="sticky top-4 z-10 rounded-xl border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="font-bold">{session?.title || "Bài thi"}</h1>
              <p className="text-xs text-muted-foreground">
                Câu {current + 1}/{questions.length} • Đã trả lời {answeredCount}/{questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {session?.anti_cheat && (
                <Badge variant="warning"><ShieldAlert className="size-3" /> {cheatCount} cảnh báo</Badge>
              )}
              {timeLeft != null && (
                <Badge variant={timeLeft < 300 ? "destructive" : "secondary"}>
                  <Clock className="size-3" /> {fmt(timeLeft)}
                </Badge>
              )}
            </div>
          </div>
          <Progress value={(answeredCount / Math.max(questions.length, 1)) * 100} />
        </div>

        {/* Câu hỏi hiện tại */}
        {question && meta && (
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="text-sm font-medium">
              Câu {current + 1}: {question.title}
              {question.is_required && <span className="text-red-500"> *</span>}
              {question.points > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({question.points} điểm)</span>}
            </div>
            {question.description && <p className="text-xs text-muted-foreground">{question.description}</p>}
            <meta.Renderer
              question={question}
              answer={answers[question.id]}
              onAnswer={(val) => setAnswers((a) => ({ ...a, [question.id]: val }))}
            />
          </div>
        )}

        {/* Điều hướng câu hỏi */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>
            <ChevronLeft className="size-4" /> Câu trước
          </Button>
          <div className="flex flex-wrap justify-center gap-1">
            {questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrent(i)}
                className={`size-7 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                  i === current
                    ? "bg-primary text-primary-foreground"
                    : answers[q.id] != null
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))} disabled={current === questions.length - 1}>
            Câu sau <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Nộp bài */}
        <Button
          onClick={() => submit(false)}
          disabled={submitting}
          className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
          size="lg"
        >
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Nộp bài thi
        </Button>
        <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
          <AlertTriangle className="size-3" /> Bài làm được tự động lưu — tải lại trang sẽ không mất đáp án.
        </p>
      </div>
    </div>
  );
}
