import pool from "../config/database.js";
import AppError from "../utils/app-error.js";

// 1. Tạo form mới & khởi tạo bản ghi phiên bản đầu tiên (v1)
export async function createForm(userId, data) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Thêm vào bảng forms
        const [result] = await connection.execute(
            `
            INSERT INTO forms (owner_id, title, description, form_type, status, settings)
            VALUES (?, ?, ?, ?, 'draft', ?)
            `,
            [
                userId,
                data.title,
                data.description || null,
                data.form_type,
                data.settings ? JSON.stringify(data.settings) : null
            ]
        );

        const formId = result.insertId;

        // Tạo version đầu tiên (v1) cho form dạng JSON snapshot rỗng
        const initialSnapshot = JSON.stringify({
            title: data.title,
            version: 1,
            questions: []
        });

        await connection.execute(
            `
            INSERT INTO form_versions (form_id, version_number, snapshot_json, created_by)
            VALUES (?, 1, ?, ?)
            `,
            [formId, initialSnapshot, userId]
        );

        await connection.commit();
        return formId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// 2. Thêm câu hỏi vào form (và tự động thêm các tùy chọn đáp án nếu có)
export async function addQuestionToForm(formId, userId, data) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Kiểm tra xem form có tồn tại và thuộc quyền sở hữu của user không (hoặc là admin)
        const [forms] = await connection.execute(
            `SELECT id, owner_id FROM forms WHERE id = ? LIMIT 1`,
            [formId]
        );

        if (!forms.length) {
            throw new AppError("Không tìm thấy biểu mẫu", 404);
        }

        // Thêm câu hỏi vào bảng questions
        const [questionResult] = await connection.execute(
            `
            INSERT INTO questions (form_id, question_type, title, description, is_required, points, sort_order, settings)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                formId,
                data.question_type,
                data.title,
                data.description || null,
                data.is_required ? 1 : 0,
                data.points || 0,
                data.sort_order || 0,
                data.settings ? JSON.stringify(data.settings) : null
            ]
        );

        const questionId = questionResult.insertId;

        // Nếu câu hỏi có các lựa chọn đáp án (multiple_choice, v.v.)
        if (data.options && data.options.length > 0) {
            for (const opt of data.options) {
                await connection.execute(
                    `
                    INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
                    VALUES (?, ?, ?, ?)
                    `,
                    [
                        questionId,
                        opt.option_text,
                        opt.is_correct ? 1 : 0,
                        opt.sort_order || 0
                    ]
                );
            }
        }

        await connection.commit();
        return questionId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
// 3. Lấy chi tiết form kèm theo danh sách câu hỏi và các lựa chọn đáp án
export async function getFormById(formId) {
    const connection = await pool.getConnection();
    try {
        // Lấy thông tin cơ bản của form
        const [forms] = await connection.execute(
            `
            SELECT f.*, u.username as owner_username, u.full_name as owner_full_name
            FROM forms f
            JOIN users u ON u.id = f.owner_id
            WHERE f.id = ?
            LIMIT 1
            `,
            [formId]
        );

        if (!forms.length) {
            return null;
        }

        const form = forms[0];

        // Lấy danh sách câu hỏi của form
        const [questions] = await connection.execute(
            `
            SELECT *
            FROM questions
            WHERE form_id = ?
            ORDER BY sort_order ASC, id ASC
            `,
            [formId]
        );

        // Nếu có câu hỏi, lấy thêm các option (đáp án) cho từng câu hỏi trắc nghiệm
        if (questions.length > 0) {
            const questionIds = questions.map(q => q.id);
            const placeholders = questionIds.map(() => "?").join(",");

            const [options] = await connection.execute(
                `
                SELECT *
                FROM question_options
                WHERE question_id IN (${placeholders})
                ORDER BY sort_order ASC, id ASC
                `,
                questionIds
            );

            // Gắn options vào từng câu hỏi tương ứng
            for (const q of questions) {
                q.options = options.filter(opt => opt.question_id === q.id);
            }
        }

        form.questions = questions;
        return form;
    } finally {
        connection.release();
    }
}

// 4. Cập nhật thông tin form
export async function updateForm(formId, userId, data) {
    const [forms] = await pool.execute(
        `SELECT id, owner_id FROM forms WHERE id = ? LIMIT 1`,
        [formId]
    );

    if (!forms.length) {
        throw new AppError("Không tìm thấy biểu mẫu", 404);
    }

    const fields = [];
    const params = [];

    if (data.title !== undefined) {
        fields.push("title = ?");
        params.push(data.title);
    }
    if (data.description !== undefined) {
        fields.push("description = ?");
        params.push(data.description);
    }
    if (data.form_type !== undefined) {
        fields.push("form_type = ?");
        params.push(data.form_type);
    }
    if (data.status !== undefined) {
        fields.push("status = ?");
        params.push(data.status);
    }
    if (data.settings !== undefined) {
        fields.push("settings = ?");
        params.push(JSON.stringify(data.settings));
    }

    if (fields.length === 0) {
        return;
    }

    params.push(formId);

    await pool.execute(
        `
        UPDATE forms
        SET ${fields.join(", ")}
        WHERE id = ?
        `,
        params
    );
}

// 5. Xóa form (hoặc có thể đổi status thành archived tùy logic)
export async function deleteForm(formId) {
    const [result] = await pool.execute(
        `DELETE FROM forms WHERE id = ?`,
        [formId]
    );

    return result.affectedRows > 0;
}
export async function publishForm(formId, userId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lấy thông tin form và kiểm tra tồn tại
        const [forms] = await connection.execute(
            `SELECT * FROM forms WHERE id = ? LIMIT 1`,
            [formId]
        );
        if (!forms.length) throw new AppError("Không tìm thấy biểu mẫu", 404);
        const form = forms[0];

        // 2. Lấy toàn bộ câu hỏi và options của form này
        const [questions] = await connection.execute(
            `SELECT * FROM questions WHERE form_id = ? ORDER BY sort_order ASC`,
            [formId]
        );

        for (const q of questions) {
            const [options] = await connection.execute(
                `SELECT * FROM question_options WHERE question_id = ? ORDER BY sort_order ASC`,
                [q.id]
            );
            q.options = options;
        }

        // 3. Tính số version tiếp theo
        const [versions] = await connection.execute(
            `SELECT MAX(version_number) as max_v FROM form_versions WHERE form_id = ?`,
            [formId]
        );
        const nextVersion = (versions[0].max_v || 0) + 1;

        // 4. Tạo cấu trúc snapshot JSON chứa toàn bộ đề thi tại thời điểm publish
        const snapshotData = {
            formId: form.id,
            title: form.title,
            description: form.description,
            form_type: form.form_type,
            version: nextVersion,
            questions: questions
        };

        // 5. Lưu vào bảng form_versions
        await connection.execute(
            `
            INSERT INTO form_versions (form_id, version_number, snapshot_json, created_by)
            VALUES (?, ?, ?, ?)
            `,
            [formId, nextVersion, JSON.stringify(snapshotData), userId]
        );

        // 6. Cập nhật trạng thái form thành 'published'
        await connection.execute(
            `UPDATE forms SET status = 'published' WHERE id = ?`,
            [formId]
        );

        await connection.commit();
        return { message: "Xuất bản biểu mẫu thành công", version: nextVersion };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
export async function reorderQuestions(formId, questionOrders) {
    // questionOrders nhận vào dạng: [{ id: 1, sort_order: 1 }, { id: 2, sort_order: 2 }, ...]
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        for (const item of questionOrders) {
            await connection.execute(
                `UPDATE questions SET sort_order = ? WHERE id = ? AND form_id = ?`,
                [item.sort_order, item.id, formId]
            );
        }

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
export async function duplicateForm(formId, userId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lấy form gốc
        const [forms] = await connection.execute(`SELECT * FROM forms WHERE id = ? LIMIT 1`, [formId]);
        if (!forms.length) throw new AppError("Không tìm thấy biểu mẫu", 404);
        const originalForm = forms[0];

        // 2. Tạo form mới (bản sao)
        const newTitle = `${originalForm.title} (Bản sao)`;
        const [formResult] = await connection.execute(
            `
            INSERT INTO forms (owner_id, school_id, title, description, form_type, status, settings)
            VALUES (?, ?, ?, ?, ?, 'draft', ?)
            `,
            [userId, originalForm.school_id, newTitle, originalForm.description, originalForm.form_type, originalForm.settings]
        );
        const newFormId = formResult.insertId;

        // 3. Lấy và sao chép toàn bộ câu hỏi sang form mới
        const [questions] = await connection.execute(`SELECT * FROM questions WHERE form_id = ?`, [formId]);
        
        for (const q of questions) {
            const [qResult] = await connection.execute(
                `
                INSERT INTO questions (form_id, question_type, title, description, is_required, points, sort_order, settings)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [newFormId, q.question_type, q.title, q.description, q.is_required, q.points, q.sort_order, q.settings]
            );
            const newQuestionId = qResult.insertId;

            // Sao chép các options (đáp án) của câu hỏi đó
            const [options] = await connection.execute(`SELECT * FROM question_options WHERE question_id = ?`, [q.id]);
            for (const opt of options) {
                await connection.execute(
                    `
                    INSERT INTO question_options (question_id, option_text, is_correct, sort_order)
                    VALUES (?, ?, ?, ?)
                    `,
                    [newQuestionId, opt.option_text, opt.is_correct, opt.sort_order]
                );
            }
        }

        // 4. Tạo bản version v1 mặc định cho form mới
        await connection.execute(
            `
            INSERT INTO form_versions (form_id, version_number, snapshot_json, created_by)
            VALUES (?, 1, ?, ?)
            `,
            [newFormId, JSON.stringify({ title: newTitle, version: 1, questions: [] }), userId]
        );

        await connection.commit();
        return newFormId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}