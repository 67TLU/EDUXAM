import { verifyAccessToken } from "../utils/jwt.js";
import { getCurrentUser } from "../services/auth.service.js";

import AppError from "../utils/app-error.js";

export async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Access token is required", 401);
        }

        const token = authHeader.slice(7).trim();

        if (!token) {
            throw new AppError("Access token is required", 401);
        }

        const decoded = verifyAccessToken(token);

        const user = await getCurrentUser(decoded.userId);

        if (!user) {
            throw new AppError("User not found", 401);
        }

        req.user = {
            userId: String(user.id),
            email: user.email,
            roles: user.roles
        };

        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError" ||
            error.name === "NotBeforeError") {
            return next(
                new AppError("Invalid or expired access token", 401)
            );
        }

        next(error);
    }
}