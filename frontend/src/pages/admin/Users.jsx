import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, ShieldCheck, GraduationCap } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Select } from "../../components/ui/select";
import apiClient from "../../api/client";

const ROLE_LABEL = { admin: ["Quản trị", "destructive"], teacher: ["Giáo viên", "info"], student: ["Học sinh", "success"] };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/users", { params: { q: q || undefined } });
      setUsers(res.data?.data?.users || res.data?.data || []);
    } catch {
      toast.error("Không tải được danh sách ngườii dùng");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (user, status) => {
    try {
      await apiClient.put(`/users/${user.id}/status`, { status });
      toast.success("Cập nhật trạng thái thành công");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const filtered = users.filter((u) => {
    if (roleFilter && !(u.roles || []).some((r) => r.code === roleFilter)) return false;
    if (q && !`${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Quản lý ngườii dùng" description="Xem và quản lý tài khoản giáo viên, học sinh" />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên / email..." className="w-64 pl-8" />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-40">
          <option value="">Tất cả vai trò</option>
          <option value="teacher">Giáo viên</option>
          <option value="student">Học sinh</option>
          <option value="admin">Quản trị</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      {(u.roles || []).map((r) => {
                        const [label, variant] = ROLE_LABEL[r.code] || [r.name, "outline"];
                        return <Badge key={r.code} variant={variant} className="mr-1">{label}</Badge>;
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.status === "active" ? "success" : u.status === "locked" ? "destructive" : "secondary"}>
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {u.status === "active" ? (
                        <button onClick={() => setStatus(u, "locked")} className="text-xs font-medium text-red-600 hover:underline cursor-pointer">Khóa</button>
                      ) : (
                        <button onClick={() => setStatus(u, "active")} className="text-xs font-medium text-emerald-600 hover:underline cursor-pointer">Mở khóa</button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
