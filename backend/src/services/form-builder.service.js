import pool from "../config/database.js";
import AppError from "../utils/app-error.js";
import * as formService from "./form.service.js";

const CHOICE = ["multiple_choice", "multiple_select", "true_false"];
const isAdmin = (user) => (user.roles ?? []).some((r) => (r?.code ?? r) === "admin");

// Chỉ chủ form hoặc admin được thao tác
export async function assertFormAccess(formId, user, conn = pool) {
    const [rows] = await conn.execute(
        `SELECT id, owner_id, status, form_type FROM forms WHERE id = ? LIMIT 1`, [formId]);
    if (!rows.length) throw new AppError("Không tìm thấy biểu mẫu", 404);
    if (String(rows[0].owner_id) !== String(user.userId) && !isAdmin(user)) {
        throw new AppError("Bạn không có quyền với biểu mẫu này", 403);
    }
    return rows[0];
}

// Sửa nội dung form đã xuất bản => quay về bản nháp, phải xuất bản lại
const touchForm = (conn, formId) =>
    conn.execute(`UPDATE forms SET updated_at = NOW(), status = IF(status = 'published', 'draft', status) WHERE id = ?`, [formId]);

async function insertOptions(conn, questionId, options = []) {
    for (const [i, o] of options.entries()) {
        await conn.execute(
            `INSERT INTO question_options (question_id, option_text, is_correct, sort_order) VALUES (?, ?, ?, ?)`,
            [questionId, o.option_text, o.is_correct ? 1 : 0, i]);
    }
}

async function withTx(fn) {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const result = await fn(conn);
        await conn.commit();
        return result;
    } catch (e) {
        await conn.rollback();
        throw e;
    } finally {
        conn.release();
    }
}

// ---------- Form ----------
export async function listForms(user, { page, limit, q, status, form_type }) {
    const where = [];
    const params = [];
    if (!isAdmin(user)) { where.push("f.owner_id = ?"); params.push(user.userId); }
    if (q) { where.push("f.title LIKE ?"); params.push(`%${q}%`); }
    if (form_type) { where.push("f.form_type = ?"); params.push(form_type); }
    if (status) { where.push("f.status = ?"); params.push(status); }
    else where.push("f.status <> 'archived'");
    const w = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
        `SELECT f.id, f.title, f.description, f.form_type, f.status, f.created_at, f.updated_at,
            (SELECT COUNT(*) FROM questions x WHERE x.form_id = f.id) AS question_count,
            (SELECT COALESCE(SUM(x.points), 0) FROM questions x WHERE x.form_id = f.id) AS total_points,
            (SELECT COALESCE(MAX(v.version_number), 0) FROM form_versions v WHERE v.form_id = f.id) AS latest_version
         FROM forms f ${w} ORDER BY f.updated_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, (page - 1) * limit]);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM forms f ${w}`, params);
    return { items: rows, total, page, limit };
}

export async function getForm(formId, user) {
    await assertFormAccess(formId, user);
    return formService.getFormById(formId);
}

export async function updateForm(formId, user, data) {
    await assertFormAccess(formId, user);
    await formService.updateForm(formId, user.userId, data);
}

export async function deleteForm(formId, user) {
    await assertFormAccess(formId, user);
    try {
        await pool.execute(`DELETE FROM forms WHERE id = ?`, [formId]);
    } catch (e) {
        if (e.code === "ER_ROW_IS_REFERENCED_2") {
            throw new AppError("Biểu mẫu đã được dùng cho kỳ thi/khảo sát nên không thể xóa. Hãy lưu trữ (archive) thay vì xóa.", 409);
        }
        throw e;
    }
}

export async function duplicateForm(formId, user) {
    await assertFormAccess(formId, user);
    return withTx(async (conn) => {
        const [[f]] = await conn.execute(`SELECT * FROM forms WHERE id = ?`, [formId]);
        const [r] = await conn.execute(
            `INSERT INTO forms (owner_id, school_id, title, description, form_type, status, settings)
             VALUES (?, ?, ?, ?, ?, 'draft', ?)`,
            [user.userId, f.school_id, `${f.title} (Bản sao)`, f.description, f.form_type,
             f.settings ? JSON.stringify(f.settings) : null]);
        const newId = r.insertId;
        const [qs] = await conn.execute(`SELECT * FROM questions WHERE form_id = ? ORDER BY sort_order, id`, [formId]);
        for (const q of qs) {
            const [qr] = await conn.execute(
                `INSERT INTO questions (form_id, question_type, title, description, is_required, points, sort_order, settings)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [newId, q.question_type, q.title, q.description, q.is_required, q.points, q.sort_order,
                 q.settings ? JSON.stringify(q.settings) : null]);
            const [opts] = await conn.execute(`SELECT * FROM question_options WHERE question_id = ? ORDER BY sort_order, id`, [q.id]);
            await insertOptions(conn, qr.insertId, opts);
        }
        return newId;
    });
}

// ---------- Câu hỏi ----------
export async function addQuestion(formId, user, data) {
    return withTx(async (conn) => {
        await assertFormAccess(formId, user, conn);
        const [[{ next }]] = await conn.execute(
            `SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM questions WHERE form_id = ?`, [formId]);
        const [r] = await conn.execute(
            `INSERT INTO questions (form_id, question_type, title, description, is_required, points, sort_order, settings)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [formId, data.question_type, data.title, data.description || null, data.is_required ? 1 : 0,
             data.points || 0, next, data.settings ? JSON.stringify(data.settings) : null]);
        if (CHOICE.includes(data.question_type)) await insertOptions(conn, r.insertId, data.options);
        await touchForm(conn, formId);
        return r.insertId;
    });
}

export async function updateQuestion(formId, questionId, user, data) {
    return withTx(async (conn) => {
        await assertFormAccess(formId, user, conn);
        const [rows] = await conn.execute(`SELECT id, question_type FROM questions WHERE id = ? AND form_id = ?`, [questionId, formId]);
        if (!rows.length) throw new AppError("Không tìm thấy câu hỏi", 404);
        if (data.question_type !== rows[0].question_type) {
            throw new AppError("Không thể đổi loại câu hỏi, hãy tạo câu hỏi mới", 400);
        }
        await conn.execute(
            `UPDATE questions SET title = ?, description = ?, is_required = ?, points = ?, settings = ? WHERE id = ?`,
            [data.title, data.description || null, data.is_required ? 1 : 0, data.points || 0,
             data.settings ? JSON.stringify(data.settings) : null, questionId]);
        if (CHOICE.includes(data.question_type)) {
            await conn.execute(`DELETE FROM question_options WHERE question_id = ?`, [questionId]);
            await insertOptions(conn, questionId, data.options);
        }
        await touchForm(conn, formId);
    });
}

export async function deleteQuestion(formId, questionId, user) {
    try {
        await withTx(async (conn) => {
            await assertFormAccess(formId, user, conn);
            const [r] = await conn.execute(`DELETE FROM questions WHERE id = ? AND form_id = ?`, [questionId, formId]);
            if (!r.affectedRows) throw new AppError("Không tìm thấy câu hỏi", 404);
            await touchForm(conn, formId);
        });
    } catch (e) {
        if (e.code === "ER_ROW_IS_REFERENCED_2") {
            throw new AppError("Câu hỏi đã có bài làm nên không thể xóa", 409);
        }
        throw e;
    }
}

export async function duplicateQuestion(formId, questionId, user) {
    return withTx(async (conn) => {
        await assertFormAccess(formId, user, conn);
        const [rows] = await conn.execute(`SELECT * FROM questions WHERE id = ? AND form_id = ?`, [questionId, formId]);
        if (!rows.length) throw new AppError("Không tìm thấy câu hỏi", 404);
        const q = rows[0];
        await conn.execute(`UPDATE questions SET sort_order = sort_order + 1 WHERE form_id = ? AND sort_order > ?`, [formId, q.sort_order]);
        const [r] = await conn.execute(
            `INSERT INTO questions (form_id, question_type, title, description, is_required, points, sort_order, settings)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [formId, q.question_type, q.title, q.description, q.is_required, q.points, q.sort_order + 1,
             q.settings ? JSON.stringify(q.settings) : null]);
        const [opts] = await conn.execute(`SELECT * FROM question_options WHERE question_id = ? ORDER BY sort_order, id`, [questionId]);
        await insertOptions(conn, r.insertId, opts);
        await touchForm(conn, formId);
        return r.insertId;
    });
}

// ids: danh sách id câu hỏi theo thứ tự mới
export async function reorderQuestions(formId, user, ids) {
    await withTx(async (conn) => {
        await assertFormAccess(formId, user, conn);
        const [rows] = await conn.execute(`SELECT id FROM questions WHERE form_id = ?`, [formId]);
        const have = new Set(rows.map((r) => Number(r.id)));
        if (ids.length !== have.size || !ids.every((id) => have.has(id))) {
            throw new AppError("Danh sách câu hỏi không khớp với biểu mẫu", 400);
        }
        for (const [i, id] of ids.entries()) {
            await conn.execute(`UPDATE questions SET sort_order = ? WHERE id = ? AND form_id = ?`, [i + 1, id, formId]);
        }
        await touchForm(conn, formId);
    });
}

// ---------- Kiểm tra & xuất bản ----------
export async function checkPublishable(formId, user) {
    await assertFormAccess(formId, user);
    const form = await formService.getFormById(formId);
    const graded = form.form_type !== "survey";
    const problems = [];
    if (!form.questions.length) problems.push({ question: null, message: "Biểu mẫu chưa có câu hỏi nào" });

    form.questions.forEach((q, i) => {
        const n = i + 1;
        const add = (message) => problems.push({ question: n, message });
        if (CHOICE.includes(q.question_type)) {
            const correct = q.options.filter((o) => o.is_correct).length;
            if (q.options.length < 2) add("Cần ít nhất 2 đáp án");
            if (graded && (q.question_type === "multiple_select" ? correct < 1 : correct !== 1)) {
                add("Chưa chọn đúng số đáp án đúng");
            }
        }
        if (graded && q.question_type === "short_answer" && !(q.settings?.accepted_answers?.length)) {
            add("Chưa nhập đáp án được chấp nhận");
        }
        if (graded && Number(q.points) <= 0) add("Chưa có điểm");
    });
    return { form, problems };
}

export async function publishForm(formId, user) {
    const { form, problems } = await checkPublishable(formId, user);
    if (problems.length) {
        throw new AppError("Biểu mẫu chưa hợp lệ để xuất bản", 422,
            problems.map((p) => ({ field: p.question ? `Câu ${p.question}` : "Biểu mẫu", message: p.message })));
    }
    return withTx(async (conn) => {
        const [[{ max_v }]] = await conn.execute(`SELECT MAX(version_number) AS max_v FROM form_versions WHERE form_id = ?`, [formId]);
        const version = (max_v || 0) + 1;
        const snapshot = {
            formId: form.id, title: form.title, description: form.description, form_type: form.form_type,
            settings: form.settings ?? {}, version, questions: form.questions
        };
        await conn.execute(
            `INSERT INTO form_versions (form_id, version_number, snapshot_json, created_by) VALUES (?, ?, ?, ?)`,
            [formId, version, JSON.stringify(snapshot), user.userId]);
        await conn.execute(`UPDATE forms SET status = 'published' WHERE id = ?`, [formId]);
        return { message: "Xuất bản biểu mẫu thành công", version };
    });
}