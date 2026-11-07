import pool from "../config/database.js";
import AppError from "../utils/app-error.js";
import { randomBytes } from "node:crypto";

// Giáo viên tạo lớp học mới
export async function createClass(userId, data) {
    const joinCode = "CL" + randomBytes(3).toString("hex").toUpperCase();
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.execute(
            `
            INSERT INTO classes (school_id, name, description, join_code, created_by, status)
            VALUES (?, ?, ?, ?, ?, 'active')
            `,
            [data.school_id || null, data.name, data.description || null, joinCode, userId]
        );

        const classId = result.insertId;

        // Tự động gán giáo viên tạo lớp vào bảng class_members với vai trò 'teacher'
        await connection.execute(
            `
            INSERT INTO class_members (class_id, user_id, member_role)
            VALUES (?, ?, 'teacher')
            `,
            [classId, userId]
        );

        await connection.commit();
        return { classId, join_code: joinCode };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Học sinh tham gia lớp học bằng join_code
export async function joinClass(userId, joinCode) {
    const [classes] = await pool.execute(
        `SELECT id, name FROM classes WHERE join_code = ? AND status = 'active' LIMIT 1`,
        [joinCode]
    );

    if (!classes.length) {
        throw new AppError("Mã lớp học không tồn tại hoặc đã bị khóa", 404);
    }

    const classItem = classes[0];

    // Kiểm tra xem học sinh đã ở trong lớp chưa
    const [members] = await pool.execute(
        `SELECT * FROM class_members WHERE class_id = ? AND user_id = ? LIMIT 1`,
        [classItem.id, userId]
    );

    if (members.length) {
        throw new AppError("Bạn đã tham gia lớp học này rồi", 400);
    }

    await pool.execute(
        `
        INSERT INTO class_members (class_id, user_id, member_role)
        VALUES (?, ?, 'student')
        `,
        [classItem.id, userId]
    );

    return { classId: classItem.id, className: classItem.name };
}
// Danh sách lớp của ngườii dùng (giáo viên thấy lớp mình tạo/dạy, học sinh thấy lớp đã tham gia)
export async function listClasses(userId, isAdmin = false) {
    const [rows] = await pool.execute(
        `
        SELECT c.*, 
               (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.id AND cm.member_role = 'student') AS student_count,
               (SELECT COUNT(*) FROM class_members cm WHERE cm.class_id = c.id AND cm.member_role = 'teacher') AS teacher_count
        FROM classes c
        WHERE ? OR c.id IN (
            SELECT class_id FROM class_members WHERE user_id = ?
        )
        ORDER BY c.created_at DESC
        `,
        [isAdmin ? 1 : 0, userId]
    );
    return rows;
}
