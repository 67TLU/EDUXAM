import pool from "../config/database.js";

// Lấy thống kê tổng quan hệ thống cho Admin Dashboard
export async function getSystemStats() {
    const [usersCount] = await pool.execute(`SELECT COUNT(*) as total FROM users`);
    const [formsCount] = await pool.execute(`SELECT COUNT(*) as total FROM forms`);
    const [sessionsCount] = await pool.execute(`SELECT COUNT(*) as total FROM exam_sessions`);
    const [submissionsCount] = await pool.execute(`SELECT COUNT(*) as total FROM submissions`);

    return {
        totalUsers: usersCount[0].total,
        totalForms: formsCount[0].total,
        totalExamSessions: sessionsCount[0].total,
        totalSubmissions: submissionsCount[0].total
    };
}

// Lấy nhật ký hoạt động hệ thống (Audit Logs)
export async function getAuditLogs() {
    const [rows] = await pool.execute(
        `
        SELECT al.*, u.username, u.full_name
        FROM audit_logs al
        LEFT JOIN users u ON u.id = al.user_id
        ORDER BY al.created_at DESC
        LIMIT 50
        `
    );
    return rows;
}