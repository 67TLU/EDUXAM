import { verifyAccessToken } from "../utils/jwt.js";
import { getCurrentUser } from "../services/auth.service.js";

export async function authenticateSocket(socket, next) {
    try {
        const token = socket.handshake.auth?.token;
        if (typeof token !== "string" || !token.trim()) {
            throw new Error("Missing access token");
        }

        const payload = verifyAccessToken(token.trim());
        const user = await getCurrentUser(payload.userId);
        if (!user) {
            throw new Error("User not found");
        }

        socket.data.user = {
            userId: String(user.id),
            fullName: user.full_name,
            roles: (user.roles || []).map((role) => role.code),
        };

        next();
    } catch {
        const error = new Error("Socket authentication failed");
        error.data = { code: "SOCKET_AUTH_FAILED" };
        next(error);
    }
}
