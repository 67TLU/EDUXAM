import apiClient from "./client";

// Lấy danh sách thông báo của user
export const getNotificationsApi = async () => {
  const response = await apiClient.get("/notifications");
  return response.data;
};

// Đánh dấu thông báo đã đọc
export const markNotificationAsReadApi = async (id) => {
  const response = await apiClient.put(`/notifications/${id}/read`);
  return response.data;
};