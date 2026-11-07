import pool from "../config/database.js";

export function requirePermission(permissionName) {
    return async (req, res, next) => {
        try {
            const [rows] = await pool.execute(
                `
                SELECT 1
                FROM user_roles ur
                JOIN role_permissions rp
                    ON rp.role_id = ur.role_id
                JOIN permissions p
                    ON p.id = rp.permission_id
                WHERE ur.user_id = ?
                  AND p.code = ?
                LIMIT 1
                `,
                [req.user.userId, permissionName]
            );

            if (!rows.length) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to perform this action"
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}