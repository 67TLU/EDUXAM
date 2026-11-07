import bcrypt from "bcryptjs";

import pool from "../config/database.js";
import { env } from "../config/env.js";

import AppError from "../utils/app-error.js";
import { generateAccessToken } from "../utils/jwt.js";

import {
    generateRefreshToken,
    hashRefreshToken,
    generateTokenFamily
} from "../utils/refresh-token.js";

function getRefreshExpiry() {
    const date = new Date();
    date.setTime(
        date.getTime() +
        env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    // Chuyển đối tượng Date thành chuỗi định dạng 'YYYY-MM-DD HH:mm:ss'
    const mysqlDatetime = date.toISOString().slice(0, 19).replace('T', ' ');

    return mysqlDatetime;
}


function getRequestMetadata(metadata = {}) {
    return {
        userAgent: metadata.userAgent?.slice(0, 500) || null,
        ipAddress: metadata.ipAddress || null
    };
}

async function getPublicUser(connection, userId) {
    const [users] = await connection.execute(
        `
        SELECT
            id,
            username,
            email,
            full_name,
            avatar,
            phone,
            status
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
    );

    if (!users.length) {
        return null;
    }

    const [roles] = await connection.execute(
        `
        SELECT
            r.id,
            r.code,
            r.name
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ?
        `,
        [userId]
    );

    return {
        ...users[0],
        id: String(users[0].id),
        roles
    };
}

function createAuthResult(user, refreshToken) {
    return {
        user,
        accessToken: generateAccessToken(user),
        refreshToken
    };
}

// LOGIN
export async function loginUser(email, password, metadata) {
    const [users] = await pool.execute(
        `
        SELECT
            id,
            email,
            password_hash,
            status
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email.trim().toLowerCase()]
    );

    if (!users.length) {
        throw new AppError("Invalid email or password", 401);
    }

    const user = users[0];

    if (user.status !== "active") {
        throw new AppError("Account is not active", 403);
    }

    const isValid = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!isValid) {
        throw new AppError("Invalid email or password", 401);
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const publicUser = await getPublicUser(
            connection,
            user.id
        );

        if (!publicUser) {
            throw new AppError("User not found", 404);
        }

        const refreshToken = generateRefreshToken();
        const tokenHash = hashRefreshToken(refreshToken);
        const familyId = generateTokenFamily();
        const expiresAt = getRefreshExpiry();

        const { userAgent, ipAddress } =
            getRequestMetadata(metadata);

        await connection.execute(
            `
            INSERT INTO refresh_tokens (
                user_id,
                family_id,
                token_hash,
                expires_at,
                user_agent,
                ip_address
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                user.id,
                familyId,
                tokenHash,
                expiresAt,
                userAgent,
                ipAddress
            ]
        );

        await connection.commit();

        return createAuthResult(publicUser, refreshToken);

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// REFRESH TOKEN ROTATION
export async function refreshUserSession(oldToken, metadata) {
    if (!oldToken) {
        throw new AppError("Refresh token is required", 401);
    }

    const oldHash = hashRefreshToken(oldToken);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [tokens] = await connection.execute(
            `
            SELECT *
            FROM refresh_tokens
            WHERE token_hash = ?
            LIMIT 1
            FOR UPDATE
            `,
            [oldHash]
        );

        if (!tokens.length) {
            throw new AppError("Invalid refresh token", 401);
        }

        const currentToken = tokens[0];

        // Token đã bị revoke do rotation:
        // Có khả năng token cũ bị sử dụng lại.
        if (currentToken.revoked_at) {
            if (currentToken.replaced_by_token_id !== null) {
                await connection.execute(
                    `
                    UPDATE refresh_tokens
                    SET
                        revoked_at = COALESCE(revoked_at, NOW()),
                        revoked_reason = 'reuse_detected'
                    WHERE family_id = ?
                    `,
                    [currentToken.family_id]
                );
            }

            await connection.commit();

            throw new AppError(
                "Refresh token is invalid or has already been used",
                401
            );
        }

        if (new Date(currentToken.expires_at) <= new Date()) {
            throw new AppError("Refresh token has expired", 401);
        }

        const [users] = await connection.execute(
            `
            SELECT id, status
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [currentToken.user_id]
        );

        if (!users.length || users[0].status !== "active") {
            await connection.execute(
                `
                UPDATE refresh_tokens
                SET
                    revoked_at = COALESCE(revoked_at, NOW()),
                    revoked_reason = 'account_inactive'
                WHERE family_id = ?
                `,
                [currentToken.family_id]
            );

            await connection.commit();

            throw new AppError("Account is not active", 403);
        }

        const newRefreshToken = generateRefreshToken();
        const newHash = hashRefreshToken(newRefreshToken);
        const expiresAt = getRefreshExpiry();

        const { userAgent, ipAddress } =
            getRequestMetadata(metadata);

        const [insertResult] = await connection.execute(
            `
            INSERT INTO refresh_tokens (
                user_id,
                family_id,
                token_hash,
                expires_at,
                user_agent,
                ip_address
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                currentToken.user_id,
                currentToken.family_id,
                newHash,
                expiresAt,
                userAgent,
                ipAddress
            ]
        );

        await connection.execute(
            `
            UPDATE refresh_tokens
            SET
                revoked_at = NOW(),
                revoked_reason = 'rotated',
                replaced_by_token_id = ?,
                last_used_at = NOW()
            WHERE id = ?
            `,
            [
                insertResult.insertId,
                currentToken.id
            ]
        );

        const publicUser = await getPublicUser(
            connection,
            currentToken.user_id
        );

        if (!publicUser) {
            throw new AppError("User not found", 404);
        }

        await connection.commit();

        return createAuthResult(
            publicUser,
            newRefreshToken
        );

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// LOGOUT CURRENT DEVICE
export async function logoutUser(refreshToken) {
    if (!refreshToken) return;

    const tokenHash = hashRefreshToken(refreshToken);

    await pool.execute(
        `
        UPDATE refresh_tokens
        SET
            revoked_at = COALESCE(revoked_at, NOW()),
            revoked_reason = COALESCE(revoked_reason, 'logout')
        WHERE token_hash = ?
        `,
        [tokenHash]
    );
}

// LOGOUT ALL DEVICES
export async function logoutAllUserSessions(userId) {
    await pool.execute(
        `
        UPDATE refresh_tokens
        SET
            revoked_at = COALESCE(revoked_at, NOW()),
            revoked_reason = COALESCE(revoked_reason, 'logout_all')
        WHERE user_id = ?
          AND revoked_at IS NULL
        `,
        [userId]
    );
}

// GET CURRENT USER
export async function getCurrentUser(userId) {
    const [users] = await pool.execute(
        `
        SELECT id, status
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
    );

    if (!users.length) return null;

    if (users[0].status !== "active") {
        throw new AppError("Account is not active", 403);
    }

    const connection = await pool.getConnection();

    try {
        return await getPublicUser(connection, userId);
    } finally {
        connection.release();
    }
}
// Đăng ký tài khoản mới (giáo viên / học sinh)
export async function registerUser({ full_name, email, username, password, role }) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.execute(
            "SELECT id FROM users WHERE email = ? LIMIT 1", [email]
        );
        if (existing.length) throw new AppError("Email đã được sử dụng", 409);

        const hash = await bcrypt.hash(password, 10);
        const [result] = await connection.execute(
            `INSERT INTO users (username, email, password_hash, full_name, status)
             VALUES (?, ?, ?, ?, 'active')`,
            [username || email.split("@")[0], email, hash, full_name]
        );
        const userId = result.insertId;

        const [roleRows] = await connection.execute(
            "SELECT id FROM roles WHERE code = ? LIMIT 1", [role]
        );
        if (roleRows.length) {
            await connection.execute(
                "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
                [userId, roleRows[0].id]
            );
        }

        await connection.commit();
        return { userId };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
