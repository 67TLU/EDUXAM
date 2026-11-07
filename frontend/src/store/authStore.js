import { logoutApi } from "@/api/auth";
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null, 
  isAuthenticated: false,
  ready: false, // Giữ nguyên để chặn router khi đang check login

  setAuth: (user, token) => {
    // Không dùng localStorage.setItem nữa
    set({ user, accessToken: token, isAuthenticated: true, ready: true });
  },

  setReady: () => set({ ready: true }),

  logout: async() => {
    await logoutApi(); // Gọi API logout để xóa session cookie
    set({ user: null, accessToken: null, isAuthenticated: false, ready: true });
  },
}));

// Các sự kiện lắng nghe từ client vẫn giữ nguyên
window.addEventListener("auth:token", (e) => useAuthStore.setState({ accessToken: e.detail.accessToken, isAuthenticated: true }));
window.addEventListener("auth:logout", () => useAuthStore.getState().logout());
