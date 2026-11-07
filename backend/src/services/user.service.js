import pool from "../config/database.js";
import bcrypt from "bcryptjs";
import AppError from "../utils/app-error.js";
export async function getUsers({
    page,
    limit,
    offset,
    search,
    status,
    role
}) {
    const conditions = [];
    const params = [];

    if (search) {
        conditions.push(`
            (
                u.username LIKE ?
                OR u.email LIKE ?
                OR u.full_name LIKE ?
            )
        `);

        const keyword = `%${search}%`;
        params.push(keyword, keyword, keyword);
    }

    if (status) {
        conditions.push("u.status = ?");
        params.push(status);
    }

    if (role) {
        conditions.push(`
            EXISTS (
                SELECT 1
                FROM user_roles ur
                JOIN roles r ON r.id = ur.role_id
                WHERE ur.user_id = u.id
                  AND r.name = ?
            )
        `);

        params.push(role);
    }

    const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const [countRows] = await pool.execute(
        `
        SELECT COUNT(*) AS total
        FROM users u
        ${whereClause}
        `,
        params
    );

    const [users] = await pool.execute(
        `
        SELECT
            u.id,
            u.username,
            u.email,
            u.full_name,
            u.status
        FROM users u
        ${whereClause}
        ORDER BY u.id DESC
        LIMIT ? OFFSET ?
        `,
        [...params, limit, offset]
    );

    if (users.length) {
        const userIds = users.map(user => user.id);
        const placeholders = userIds.map(() => "?").join(",");

        const [roleRows] = await pool.execute(
            `
            SELECT
                ur.user_id,
                r.id AS role_id,
                r.name AS role_name
            FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id IN (${placeholders})
            `,
            userIds
        );

        for (const user of users) {
            user.roles = roleRows
                .filter(roleRow => roleRow.user_id === user.id)
                .map(roleRow => ({
                    id: roleRow.role_id,
                    name: roleRow.role_name
                }));
        }
    }

    return {
        users,
        pagination: {
            page,
            limit,
            total: countRows[0].total,
            totalPages: Math.ceil(countRows[0].total / limit)
        }
    };
}

export async function getUserById(userId) {
    const [rows] = await pool.execute(
        `
        SELECT
            id,
            username,
            email,
            full_name,
            status
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
    );

    if (!rows.length) return null;

    const user = rows[0];

    const [roles] = await pool.execute(
        `
        SELECT r.id, r.name
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = ?
        `,
        [userId]
    );

    return {
        ...user,
        roles
    };
}

export async function createUser(data) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existingUsers] = await connection.execute(
            `
            SELECT id
            FROM users
            WHERE email = ? OR username = ?
            LIMIT 1
            `,
            [data.email, data.username]
        );

        if (existingUsers.length) {
            throw new AppError("Email or username already exists", 409);
        }

        const passwordHash = await bcrypt.hash(data.password, 12);

        const [result] = await connection.execute(
            `
            INSERT INTO users (
                username,
                email,
                password_hash,
                full_name,
                status
            )
            VALUES (?, ?, ?, ?, 'active')
            `,
            [
                data.username,
                data.email,
                passwordHash,
                data.full_name
            ]
        );

        const userId = result.insertId;

        if (data.roleIds.length) {
            const [roles] = await connection.execute(
                `
                SELECT id
                FROM roles
                WHERE id IN (${data.roleIds.map(() => "?").join(",")})
                `,
                data.roleIds
            );

            if (roles.length !== data.roleIds.length) {
                throw new AppError("Email or username already exists", 409);
            }

            for (const roleId of data.roleIds) {
                await connection.execute(
                    `
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES (?, ?)
                    `,
                    [userId, roleId]
                );
            }
        }

        await connection.commit();

        return userId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function updateUser(userId, data) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [users] = await connection.execute(
            "SELECT id FROM users WHERE id = ? LIMIT 1",
            [userId]
        );

        if (!users.length) {
throw new AppError("One or more roles do not exist", 400);
        }

        const fields = [];
        const params = [];

        if (data.username !== undefined) {
            fields.push("username = ?");
            params.push(data.username);
        }

        if (data.email !== undefined) {
            fields.push("email = ?");
            params.push(data.email);
        }

        if (data.full_name !== undefined) {
            fields.push("full_name = ?");
            params.push(data.full_name);
        }

        if (data.status !== undefined) {
            fields.push("status = ?");
            params.push(data.status);
        }

        if (data.password) {
            const passwordHash = await bcrypt.hash(data.password, 12);

            fields.push("password_hash = ?");
            params.push(passwordHash);
        }

        if (fields.length) {
            await connection.execute(
                `
                UPDATE users
                SET ${fields.join(", ")}
                WHERE id = ?
                `,
                [...params, userId]
            );
        }

        if (data.roleIds !== undefined) {
            const uniqueRoleIds = [...new Set(data.roleIds)];

            if (uniqueRoleIds.length) {
                const [roles] = await connection.execute(
                    `
                    SELECT id
                    FROM roles
                    WHERE id IN (${uniqueRoleIds.map(() => "?").join(",")})
                    `,
                    uniqueRoleIds
                );

                if (roles.length !== uniqueRoleIds.length) {
                    throw new AppError("One or more roles do not exist", 400);
                }
            }

            await connection.execute(
                "DELETE FROM user_roles WHERE user_id = ?",
                [userId]
            );

            for (const roleId of uniqueRoleIds) {
                await connection.execute(
                    `
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES (?, ?)
                    `,
                    [userId, roleId]
                );
            }
        }

        await connection.commit();

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

export async function deactivateUser(userId) {
    const [result] = await pool.execute(
        `
        UPDATE users
        SET status = 'inactive'
        WHERE id = ?
        `,
        [userId]
    );

    return result.affectedRows > 0;
}