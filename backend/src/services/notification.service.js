import pool from "../config/database.js";

// Lấy danh sách thông báo của user
export async function getUserNotifications(userId) {
    const [rows] = await pool.execute(
        `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
        `,
        [userId]
    );
    return rows;
}

// Đánh dấu đã đọc
export async function markAsRead(notificationId, userId) {
    const [result] = await pool.execute(
        `
        UPDATE notifications 
        SET is_read = 1 
        WHERE id = ? AND user_id = ?
        `,
        [notificationId, userId]
    );
    return result.affectedRows > 0;
}

// Hàm tiện ích nội bộ để tạo thông báo cho user (dùng khi có kỳ thi mới, chấm điểm xong...)
export async function createNotification(connection, userId, title, message, type) {
    await connection.execute(
        `
        INSERT INTO notifications (user_id, title, message, notification_type, is_read)
        VALUES (?, ?, ?, ?, 0)
        `,
        [userId, title, message, type]
    );
}