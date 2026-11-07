import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { loginApi } from "../../api/auth";
import { toast } from "sonner";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user?.roles?.[0]?.code;
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "teacher") {
        navigate("/teacher/dashboard", { replace: true });
      } else {
        navigate("/student/dashboard", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);
  // 1. Sửa useEffect: Thêm mảng dependency [ready, isAuthenticated, user, navigate] để tránh loop
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng điền đầy đủ Email và Mật khẩu!");
      return;
    }

    try {
      setLoading(true);
      const res = await loginApi(email, password);
      
      const { user: loggedInUser, accessToken } = res.data;
      setAuth(loggedInUser, accessToken);
      toast.success(`Chào mừng ${loggedInUser.full_name} đã quay trở lại!`);

      // Khi setAuth chạy xong, isAuthenticated và user thay đổi 
      // -> useEffect ở trên sẽ tự bắt được và điều hướng cho bạn một cách đồng bộ.
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Đăng Nhập Hệ Thống</h2>
          <p className="text-sm text-gray-500 mt-1">Nền tảng thi & khảo sát trực tuyến</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Đăng Nhập</span>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">Đăng ký ngay</Link>
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          Demo: nguyen@school.edu.vn / 123456 (GV) • an@student.edu.vn / 123456 (HS)
        </p>
      </div>
    </div>
  );
}
