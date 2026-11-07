import { env } from "./env.js";

export const refreshCookieName = "refreshToken";

export const refreshCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS
        * 24 * 60 * 60 * 1000
};

export const clearRefreshCookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth"
};