import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { PageHeader } from "../../components/layout/AppLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import apiClient from "../../api/client";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/admin/audit-logs");
        setLogs(res.data?.data || []);
      } catch {
        toast.error("Không tải được nhật ký hệ thống");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader
        title="Nhật ký hệ thống"
        description="Theo dõi các hoạt động quan trọng: đăng nhập, tạo biểu mẫu, kỳ thi, chấm điểm"
      />
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <ShieldCheck className="size-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Chưa có nhật ký nào được ghi lại.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Người thực hiện</TableHead>
                  <TableHead>Hành động</TableHead>
                  <TableHead>Mô tả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(l.created_at).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="font-medium">{l.full_name || `User #${l.user_id}`}</TableCell>
                    <TableCell><Badge variant="info">{l.action}</Badge></TableCell>
                    <TableCell className="text-sm">{l.description}</TableCell>
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
