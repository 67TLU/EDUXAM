import { useState, useEffect } from "react";
import { getSystemStatsApi, getAuditLogsApi } from "../../api/admin";
import { toast } from "sonner";
import { Users, FileText, ClipboardList, ShieldAlert, Activity, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        const [statsRes, logsRes] = await Promise.all([
          getSystemStatsApi(),
          getAuditLogsApi()
        ]);
        setStats(statsRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        toast.error("Không thể tải dữ liệu quản trị hệ thống.");
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center space-x-2 text-slate-700">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Đang tải bảng điều khiển quản trị...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Bảng Điều Khiển Quản Trị (Admin Dashboard)</h1>
          <p className="text-xs text-slate-500 mt-1">Giám sát tổng quan hệ thống, người dùng và nhật ký hoạt động.</p>
        </div>

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng người dùng</p>
              <h3 className="text-xl font-bold text-slate-900">{stats?.totalUsers || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><FileText className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng biểu mẫu</p>
              <h3 className="text-xl font-bold text-slate-900">{stats?.totalForms || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><ClipboardList className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng kỳ thi</p>
              <h3 className="text-xl font-bold text-slate-900">{stats?.totalExamSessions || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Activity className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tổng bài nộp</p>
              <h3 className="text-xl font-bold text-slate-900">{stats?.totalSubmissions || 0}</h3>
            </div>
          </div>
        </div>

        {/* Bảng Nhật ký hoạt động (Audit Logs) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 font-bold text-slate-800 text-sm flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-slate-600" />
            <span>Nhật ký hoạt động hệ thống gần đây (Audit Logs)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Người thực hiện</th>
                  <th className="px-6 py-3">Hành động</th>
                  <th className="px-6 py-3">Đối tượng</th>
                  <th className="px-6 py-3">IP Address</th>
                  <th className="px-6 py-3">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-slate-400">Chưa có nhật ký ghi nhận nào.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-medium">{log.id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{log.full_name || log.username || "Hệ thống"}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{log.action}</span></td>
                      <td className="px-6 py-4 text-slate-600">{log.entity_type} (ID: {log.entity_id})</td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">{log.ip_address}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}