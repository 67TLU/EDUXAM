import apiClient from "./client";

// Lấy thống kê tổng quan hệ thống
export const getSystemStatsApi = async () => {
  const response = await apiClient.get("/admin/stats");
  return response.data;
};

// Lấy nhật ký hoạt động hệ thống (Audit Logs)
export const getAuditLogsApi = async () => {
  const response = await apiClient.get("/admin/audit-logs");
  return response.data;
};