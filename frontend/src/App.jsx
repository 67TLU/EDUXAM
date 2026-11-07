import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import { useAuthStore } from "./store/authStore";
import { getMeApi } from "./api/auth";

import TeacherDashboard from "./pages/teacher/Dashboard";
import FormList from "./pages/teacher/FormList";
import FormBuilder from "./pages/teacher/FormBuilder";
import QuestionLab from "./pages/teacher/QuestionLab";
import ExamList from "./pages/teacher/ExamList";
import LiveMonitor from "./pages/teacher/LiveMonitor";
import Results from "./pages/teacher/Results";
import Grading from "./pages/teacher/Grading";
import Classes from "./pages/teacher/Classes";

import JoinRoom from "./pages/student/JoinRoom";
import TakeExam from "./pages/student/TakeExam";
import StudentDashboard from "./pages/student/StudentDashboard";
import Notifications from "./pages/student/Notifications";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/Users";
import AdminAudit from "./pages/admin/Audit";
import axios from "axios";

// Bootstrap promise (handles React StrictMode remount without skipping session restore)
let bootstrapPromise = null;

function runBootstrap() {
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const refreshRes = await axios.post(
        `http://localhost:4000/api/auth/refresh`,
        null,
        { withCredentials: true }
      );

      const accessToken = refreshRes?.data?.data?.accessToken;

      if (!accessToken) {
        throw new Error("Không tìm thấy accessToken trong response body.");
      }

      useAuthStore.setState({ accessToken, isAuthenticated: true });

      const meRes = await getMeApi();
      const user = meRes?.data?.user ?? null;

      useAuthStore.setState({
        user,
        ready: true,
      });
    } catch (err) {
      useAuthStore.getState().logout();
      useAuthStore.getState().setReady();
    }
  })();

  return bootstrapPromise;
}

export default function App() {
  const ready = useAuthStore((state) => state.ready);

  useEffect(() => {
    runBootstrap();
  }, []);


  // Chặn không cho Router render khi chưa khôi phục xong phiên đăng nhập (tránh bị đá sang /login)
  if (!ready) {
    return null; // Hoặc hiển thị màn hình Loading/Spinner đẹp mắt ở đây nếu muốn
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<p className="p-8 text-center">Bạn không có quyền truy cập trang này.</p>} />

        {/* ===== Giáo viên + Admin (dùng chung layout) ===== */}
        <Route element={<ProtectedRoute allowedRoles={["teacher", "admin"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/forms" element={<FormList />} />
            <Route path="/teacher/forms/create" element={<Navigate to="/teacher/forms" replace />} />
            <Route path="/teacher/forms/:id/edit" element={<FormBuilder />} />
            <Route path="/teacher/questions/lab" element={<QuestionLab />} />
            <Route path="/teacher/exams" element={<ExamList />} />
            <Route path="/teacher/exams/:sessionId/live" element={<LiveMonitor />} />
            <Route path="/teacher/exams/:sessionId/results" element={<Results />} />
            <Route path="/teacher/exams/:sessionId/grading" element={<Grading />} />
            <Route path="/teacher/classes" element={<Classes />} />
          </Route>
        </Route>

        {/* ===== Học sinh ===== */}
        <Route element={<ProtectedRoute allowedRoles={["student", "admin"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/join" element={<JoinRoom />} />
            <Route path="/student/notifications" element={<Notifications />} />
          </Route>
          {/* Làm bài không dùng layout (toàn màn hình, tránh mọi thao tác gây mất tập trung) */}
          <Route path="/student/exam-session/:sessionId" element={<TakeExam />} />
        </Route>

        {/* ===== Admin ===== */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AppLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/audit" element={<AdminAudit />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

