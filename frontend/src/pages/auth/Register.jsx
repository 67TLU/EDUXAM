import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
import apiClient from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input, Label } from "../../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Select } from "../../components/ui/select";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", email: "", username: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    try {
      setLoading(true);
      await apiClient.post("/auth/register", form);
      toast.success("Đăng ký thành công! Hãy đăng nhập.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="size-6" />
          </div>
          <CardTitle className="text-xl">Tạo tài khoản</CardTitle>
          <CardDescription>Đăng ký để tạo biểu mẫu hoặc tham gia bài thi</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Họ và tên *</Label>
              <Input value={form.full_name} onChange={set("full_name")} placeholder="Nguyễn Văn A" />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={set("email")} placeholder="email@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Tên đăng nhập</Label>
              <Input value={form.username} onChange={set("username")} placeholder="user.name" />
            </div>
            <div className="space-y-1.5">
              <Label>Mật khẩu *</Label>
              <Input type="password" value={form.password} onChange={set("password")} placeholder="Tối thiểu 6 ký tự" />
            </div>
            <div className="space-y-1.5">
              <Label>Vai trò</Label>
              <Select value={form.role} onChange={set("role")}>
                <option value="student">Học sinh</option>
                <option value="teacher">Giáo viên</option>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />} Đăng ký
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Đăng nhập</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
