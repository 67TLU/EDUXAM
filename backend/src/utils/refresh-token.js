import {
    randomBytes,
    createHash,
    randomUUID
} from "node:crypto";

export function generateRefreshToken() {
    return randomBytes(64).toString("hex");
}

export function hashRefreshToken(token) {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}

export function generateTokenFamily() {
    return randomUUID();
}