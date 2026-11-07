import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const BASE = "http://localhost:4000/api";

const apiClient = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 1. Request Interceptor: Tự động đính kèm accessToken từ Zustand RAM vào header
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken; 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Hàm chạy ngầm để refresh token khi accessToken hết hạn giữa chừng
let refreshing = null;
function refreshAccessToken() {
  if (!refreshing) {
    refreshing = axios
      .post(`${BASE}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        // Đã sửa đường dẫn bóc tách token chính xác giống file App.jsx của bạn
        const accessToken = res.data.data.accessToken;
        
        // Phát sự kiện để đồng bộ cập nhật lại token mới vào Zustand store
        window.dispatchEvent(new CustomEvent("auth:token", { detail: { accessToken } }));
        return accessToken;
      })
      .finally(() => { 
        refreshing = null; 
      });
  }
  return refreshing;
}

// 2. Response Interceptor: Đánh chặn lỗi 401 để tự động làm mới phiên đăng nhập
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    const url = config?.url ?? "";
    
    // Nếu lỗi 401 (Hết hạn token) và không phải là request login hay refresh
    if (response?.status === 401 && config && !config._retry
        && !url.includes("/auth/login") 
        && !url.includes("/auth/refresh")) {
      
      config._retry = true;
      try {
        const token = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        
        // Thực hiện lại request cũ với accessToken mới nhận được
        return apiClient(config); 
      } catch (refreshError) {
        // Nếu refresh token cũng thất bại (Phiên cookie đã chết hẳn), thực hiện logout sạch app
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
