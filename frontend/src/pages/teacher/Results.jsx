import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getExamResultsApi, exportExamExcelApi, exportSubmissionPdfApi } from "../../api/report";
import { toast } from "sonner";
import { FileSpreadsheet, FileText, Users, Award, TrendingUp, Loader2 } from "lucide-react";

export default function Results() {
  const { sessionId } = useParams(); // Nhận ID kỳ thi từ URL (VD: /teacher/exams/2/results)
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu thống kê khi load trang
  useEffect(() => {
    async function fetchResults() {
      try {
        setLoading(true);
        const currentSessionId = sessionId || 2; // Mặc định ID 2 từ dữ liệu mẫu SQL
        const res = await getExamResultsApi(currentSessionId);
        setReportData(res.data);
      } catch (error) {
        toast.error("Không thể tải dữ liệu thống kê kết quả.");
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [sessionId]);

  const handleExportExcel = async () => {
    try {
      const currentSessionId = sessionId || 2;
      await exportExamExcelApi(currentSessionId);
      toast.success("Tải xuống file Excel bảng điểm thành công!");
    } catch (error) {
      toast.error("Lỗi khi xuất file Excel.");
    }
  };

  const handleExportPdf = async (submissionId) => {
    try {
      await exportSubmissionPdfApi(submissionId);
      toast.success("Tải xuống biên bản PDF thành công!");
    } catch (error) {
      toast.error("Lỗi khi xuất file PDF.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex items-center space-x-2 text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Đang tổng hợp kết quả hệ thống...</span>
        </div>
      </div>
    );
  }

  const { session, statistics, submissions } = reportData || {};

  return (
    <div className="py-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header & Nút Xuất File */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Kết quả: {session?.title}</h1>
            <p className="text-xs text-gray-500 mt-1">Mã tham gia phòng: <span className="font-semibold text-blue-600">{session?.access_code}</span></p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportExcel}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition flex items-center space-x-2 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel Bảng Điểm</span>
            </button>
          </div>
        </div>

        {/* Khung Thống kê Tổng quan (Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tổng bài nộp</p>
              <h3 className="text-lg font-bold text-gray-900">{statistics?.total_submissions || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Điểm trung bình</p>
              <h3 className="text-lg font-bold text-gray-900">{Number(statistics?.average_score || 0).toFixed(2)}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Award className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Điểm cao nhất</p>
              <h3 className="text-lg font-bold text-gray-900">{statistics?.max_score || 0}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center space-x-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Award className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Điểm thấp nhất</p>
              <h3 className="text-lg font-bold text-gray-900">{statistics?.min_score || 0}</h3>
            </div>
          </div>
        </div>

        {/* Bảng Danh sách Học sinh nộp bài */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 font-bold text-gray-800 text-sm">
            Danh sách bài làm chi tiết của học sinh
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-3">STT</th>
                  <th className="px-6 py-3">Học sinh</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Điểm số</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                {submissions?.map((sub, index) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{sub.full_name}</td>
                    <td className="px-6 py-4 text-gray-500">{sub.email}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">
                      {sub.total_score} / {sub.max_score}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleExportPdf(sub.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-xs flex items-center justify-end space-x-1 ml-auto"
                        title="Tải biên bản PDF kết quả cá nhân"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Tải PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}