import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinExamApi } from "../../api/exam";
import { toast } from "sonner";
import { KeyRound, LogIn, Loader2 } from "lucide-react";

export default function JoinRoom() {
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      toast.error("Vui lòng nhập mã tham gia phòng thi!");
      return;
    }

    try {
      setLoading(true);
      const res = await joinExamApi(accessCode.trim());
      
      const { submissionId, session, resumed } = res.data;
      toast.success(resumed ? "Đã khôi phục bài làm của bạn!" : "Vào phòng thi thành công!");

      // Chuyển hướng sang trang làm bài theo session (TakeExam sẽ tự tải đề + bài nháp)
      navigate(`/student/exam-session/${session.id}`, {
        state: { submissionId, session, startedAt: new Date().toISOString() },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã tham gia không hợp lệ hoặc kỳ thi không tồn tại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full mb-4">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tham Gia Kỳ Thi</h2>
        <p className="text-sm text-gray-500 mb-6">Nhập mã phòng thi (Access Code) do giáo viên cung cấp để bắt đầu.</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="VD: JS2026"
              className="w-full text-center tracking-widest text-lg font-bold uppercase px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition flex items-center justify-center space-x-2 disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang kết nối...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Vào Phòng Thi Ngay</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}