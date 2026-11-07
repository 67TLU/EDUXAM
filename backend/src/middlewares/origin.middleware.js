import { env } from "../config/env.js";
import AppError from "../utils/app-error.js";

export function requireTrustedOrigin(req, res, next) {
    const origin = req.get("origin");
    if (!origin || origin !== env.CLIENT_URL) {
        return next(
            new AppError("Untrusted request origin", 403)
        );
    }

    next();
}