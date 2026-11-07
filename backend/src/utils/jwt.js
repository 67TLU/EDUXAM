import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateAccessToken(user) {
    return jwt.sign(
        {
            userId: String(user.id),
            type: "access"
        },
        env.JWT_ACCESS_SECRET,
        {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
            issuer: "online-education-api",
            audience: "online-education-client"
        }
    );
}

export function verifyAccessToken(token) {
    const payload = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET,
        {
            issuer: "online-education-api",
            audience: "online-education-client"
        }
    );

    if (payload.type !== "access") {
        throw new Error("Invalid token type");
    }

    return payload;
}