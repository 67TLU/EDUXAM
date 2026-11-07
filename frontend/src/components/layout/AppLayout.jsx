import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  LayoutDashboard, FileText, ClipboardList,Users,
  LogOut, GraduationCap, Bell, DoorOpen, CheckSquare, ShieldCheck
} from "lucide-react";
import { cn } from "cn";

const NAV = {
  teacher: [
    { to: "/teacher/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/teacher/forms", label: "Biểu mẫu", icon: FileText },
    { to: "/teacher/exams", label: "Kỳ thi & Phòng khảo sát", icon: ClipboardList },
    { to: "/teacher/questions/lab", label: "Phòng thử câu hỏi", icon: CheckSquare },
    { to: "/teacher/classes", label: "Lớp học", icon: Users },
  ],
  student: [
    { to: "/student/join", label: "Vào phòng thi", icon: DoorOpen },
    { to: "/student/dashboard", label: "Bài thi của tôi", icon: ClipboardList },
    { to: "/student/notifications", label: "Thông báo", icon: Bell },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/teacher/forms", label: "Biểu mẫu", icon: FileText },
    { to: "/teacher/exams", label: "Kỳ thi", icon: ClipboardList },
    { to: "/admin/users", label: "Người dùng", icon: Users },
    { to: "/admin/audit", label: "Nhật ký hệ thống", icon: ShieldCheck },
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.roles?.[0]?.code || "student";
  const items = NAV[role] || NAV.student;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-card md:flex">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <GraduationCap className="size-6 text-primary" />
          <div className="leading-tight">
            <p className="text-sm font-bold">EduExam</p>
            <p className="text-[11px] text-muted-foreground">Thi & khảo sát trực tuyến</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">{user?.full_name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon-xs" onClick={handleLogout} title="Đăng xuất">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <p className="text-sm font-bold">EduExam</p>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={handleLogout} title="Đăng xuất">
          <LogOut className="size-4" />
        </Button>
      </div>
      <nav className="sticky top-14 z-20 flex gap-1 overflow-x-auto border-b bg-card px-3 py-2 md:hidden">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              )
            }
          >
            <Icon className="size-3.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Nội dung chính */}
      <main className="px-4 py-6 md:ml-60 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}

// Header chuẩn cho mọi trang — dùng chung để đồng nhất
export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
