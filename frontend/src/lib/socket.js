import { io } from "socket.io-client";
import { useAuthStore } from "../store/authStore.js";

let socket = null;

function syncSocketAuth(accessToken) {
  if (!socket) return;

  if (!accessToken) {
    socket.disconnect();
    socket = null;
    return;
  }

  if (socket.auth?.token !== accessToken) {
    socket.auth = { token: accessToken };
    // Reconnect so the server validates the refreshed JWT in a new handshake.
    socket.disconnect();
    socket.connect();
  }
}

useAuthStore.subscribe((state, previousState) => {
  if (state.accessToken !== previousState.accessToken) {
    syncSocketAuth(state.accessToken);
  }
});

export function getSocket() {
  const accessToken = useAuthStore.getState().accessToken;
  if (!accessToken) {
    throw new Error("Cần đăng nhập trước khi kết nối WebSocket");
  }

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4000", {
      auth: { token: accessToken },
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
    socket.connect();
  } else {
    syncSocketAuth(accessToken);
    if (!socket.active) socket.connect();
  }

  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
