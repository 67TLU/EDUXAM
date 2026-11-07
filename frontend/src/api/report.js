import apiClient from "./client";

// 1. Lấy kết quả & thống kê chi tiết của một kỳ thi
export const getExamResultsApi = async (sessionId) => {
  const response = await apiClient.get(`/exam-sessions/${sessionId}/results`);
  return response.data;
};

// 2. Tải xuống file Excel bảng điểm kỳ thi
export const exportExamExcelApi = async (sessionId) => {
  const response = await apiClient.get(`/exam-sessions/${sessionId}/export-excel`, {
    responseType: "blob", // Quan trọng để nhận dữ liệu dạng file binary
  });
  
  // Tạo đường dẫn tải file tạm thời trên trình duyệt
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `BangDiem_KyThi_${sessionId}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// 3. Tải xuống file PDF kết quả bài làm cá nhân
export const exportSubmissionPdfApi = async (submissionId) => {
  const response = await apiClient.get(`/submissions/${submissionId}/export-pdf`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `KetQua_BaiThi_${submissionId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};