import pool from "../config/database.js";
import AppError from "../utils/app-error.js";
import { randomBytes } from "node:crypto";
import { createNotification } from "./notification.service.js";

// ============ TIỆN ÍCH XÁO TRỘN ============
function shuffleArray(arr, seed) {
    // Xáo trộn Fisher-Yates với seed để 1 học sinh luôn thấy 1 thứ tự cố định khi reload
    const a = [...arr];
    let s = seed || Math.floor(Math.random() * 1e9);
    const rand = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ============ 1. TẠO PHIÊN THI / KHẢO SÁT ============
export async function createExamSession(userId, data) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [forms] = await connection.execute(
            `SELECT id, status FROM forms WHERE id = ? LIMIT 1`,
            [data.form_id]
        );
        if (!forms.length) throw new AppError("Không tìm thấy biểu mẫu", 404);
        if (forms[0].status !== "published") throw new AppError("Biểu mẫu chưa được xuất bản", 400);

        const [versions] = await connection.execute(
            `SELECT id FROM form_versions WHERE form_id = ? ORDER BY version_number DESC LIMIT 1`,
            [data.form_id]
        );
        if (!versions.length) throw new AppError("Biểu mẫu chưa có phiên bản nào được tạo", 400);
        const formVersionId = versions[0].id;

        const accessCode = (data.access_code || randomBytes(3).toString("hex")).toUpperCase();

        const [result] = await connection.execute(
            `
            INSERT INTO exam_sessions (
                form_id, form_version_id, created_by, title, access_code,
                session_type, start_time, end_time, duration_minutes, attempts_allowed, status,
                shuffle_questions, shuffle_options, anti_cheat, show_result, passing_score
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?)
            `,
            [
                data.form_id, formVersionId, userId, data.title, accessCode,
                data.session_type, data.start_time || null, data.end_time || null,
                data.duration_minutes || null, data.attempts_allowed || 1,
                data.shuffle_questions ? 1 : 0, data.shuffle_options ? 1 : 0,
                data.anti_cheat ? 1 : 0, data.show_result === false ? 0 : 1,
                data.passing_score || null
            ]
        );

        await connection.commit();
        return { sessionId: result.insertId, access_code: accessCode };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// ============ 2. DANH SÁCH PHIÊN THI CỦA GIÁO VIÊN ============
export async function listExamSessions(userId, { status, session_type, page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const conds = ["es.created_by = ?"];
    const params = [userId];
    if (status) { conds.push("es.status = ?"); params.push(status); }
    if (session_type) { conds.push("es.session_type = ?"); params.push(session_type); }

    const [rows] = await pool.execute(
        `
        SELECT es.*, f.title AS form_title, f.form_type,
               (SELECT COUNT(*) FROM submissions s WHERE s.session_id = es.id) AS submission_count,
               (SELECT COUNT(DISTINCT s.user_id) FROM submissions s WHERE s.session_id = es.id) AS participant_count,
               (SELECT ROUND(AVG(s.total_score), 2) FROM submissions s WHERE s.session_id = es.id AND s.total_score IS NOT NULL) AS avg_score
        FROM exam_sessions es
        JOIN forms f ON f.id = es.form_id
        WHERE ${conds.join(" AND ")}
        ORDER BY es.created_at DESC
        LIMIT ? OFFSET ?
        `,
        [...params, Number(limit), Number(offset)]
    );
    const [countRows] = await pool.execute(
        `SELECT COUNT(*) AS total FROM exam_sessions es WHERE ${conds.join(" AND ")}`,
        params
    );
    return { sessions: rows, total: countRows[0].total, page: Number(page), totalPages: Math.ceil(countRows[0].total / limit) };
}

// ============ 3. CHI TIẾT PHIÊN THI ============
export async function getExamSession(sessionId, userId) {
    const [rows] = await pool.execute(
        `
        SELECT es.*, f.title AS form_title,
               (SELECT COUNT(*) FROM submissions s WHERE s.session_id = es.id) AS submission_count
        FROM exam_sessions es
        JOIN forms f ON f.id = es.form_id
        WHERE es.id = ? LIMIT 1
        `,
        [sessionId]
    );
    if (!rows.length) throw new AppError("Không tìm thấy phiên thi", 404);
    const session = rows[0];
    if (session.created_by !== userId) throw new AppError("Bạn không có quyền xem phiên thi này", 403);
    return session;
}

// ============ 4. CẬP NHẬT TRẠNG THÁI PHIÊN THI ============
export async function updateSessionStatus(sessionId, userId, status) {
    const valid = ["scheduled", "active", "finished", "cancelled"];
    if (!valid.includes(status)) throw new AppError("Trạng thái không hợp lệ", 400);

    const [result] = await pool.execute(
        `UPDATE exam_sessions SET status = ? WHERE id = ? AND created_by = ?`,
        [status, sessionId, userId]
    );
    if (!result.affectedRows) throw new AppError("Không tìm thấy phiên thi hoặc bạn không có quyền", 404);
    return { status };
}

// ============ 5. THAM GIA PHÒNG THI ============
export async function joinExamSession(userId, accessCode) {
    const [sessions] = await pool.execute(
        `
        SELECT es.*, f.title AS form_title
        FROM exam_sessions es
        JOIN forms f ON f.id = es.form_id
        WHERE es.access_code = ? AND es.status != 'cancelled'
        LIMIT 1
        `,
        [accessCode.trim().toUpperCase()]
    );
    if (!sessions.length) throw new AppError("Mã tham gia không hợp lệ hoặc kỳ thi không tồn tại", 404);

    const session = sessions[0];
    const now = new Date();

    if (session.status === "scheduled") {
        if (session.start_time && now < new Date(session.start_time))
            throw new AppError(`Kỳ thi chưa bắt đầu. Bắt đầu lúc ${new Date(session.start_time).toLocaleString("vi-VN")}`, 403);
        await pool.execute(`UPDATE exam_sessions SET status = 'active' WHERE id = ? AND status = 'scheduled'`, [session.id]);
        session.status = "active";
    }
    if (session.status === "finished") throw new AppError("Kỳ thi đã kết thúc", 403);
    if (session.end_time && now > new Date(session.end_time)) throw new AppError("Đã quá thờii gian làm bài", 403);

    // Kiểm tra số lần làm bài
    const [existingSubmissions] = await pool.execute(
        `SELECT COUNT(*) AS total FROM submissions WHERE session_id = ? AND user_id = ?`,
        [session.id, userId]
    );
    const attemptNumber = existingSubmissions[0].total + 1;
    if (attemptNumber > session.attempts_allowed)
        throw new AppError("Bạn đã hết số lần làm bài cho phép của kỳ thi này", 403);

    // Cho phép tiếp tục bài đang làm dở (khi lỡ reload/thoát)
    const [inProgress] = await pool.execute(
        `SELECT id FROM submissions WHERE session_id = ? AND user_id = ? AND status = 'in_progress' ORDER BY id DESC LIMIT 1`,
        [session.id, userId]
    );

    let submissionId;
    if (inProgress.length) {
        submissionId = inProgress[0].id; // nối lại bài cũ
    } else {
        const [subResult] = await pool.execute(
            `INSERT INTO submissions (session_id, user_id, attempt_number, started_at, status) VALUES (?, ?, ?, NOW(), 'in_progress')`,
            [session.id, userId, attemptNumber]
        );
        submissionId = subResult.insertId;
    }

    return {
        submissionId,
        resumed: !!inProgress.length,
        session: {
            id: session.id,
            title: session.title,
            form_title: session.form_title,
            session_type: session.session_type,
            duration_minutes: session.duration_minutes,
            start_time: session.start_time,
            end_time: session.end_time,
            anti_cheat: !!session.anti_cheat,
            show_result: !!session.show_result,
            status: session.status,
        }
    };
}

// ============ 6. LẤY ĐỀ THI (xáo trộn theo cấu hình, KHÔNG trả đáp án đúng) ============
export async function getSessionQuestions(sessionId, userId) {
    const [sessions] = await pool.execute(
        `SELECT es.*, f.title AS form_title FROM exam_sessions es JOIN forms f ON f.id = es.form_id WHERE es.id = ? LIMIT 1`,
        [sessionId]
    );
    if (!sessions.length) throw new AppError("Không tìm thấy phiên thi", 404);
    const session = sessions[0];

    // Kiểm tra học sinh đã join phiên này chưa
    const [subs] = await pool.execute(
        `SELECT id FROM submissions WHERE session_id = ? AND user_id = ? AND status = 'in_progress' ORDER BY id DESC LIMIT 1`,
        [sessionId, userId]
    );
    if (!subs.length) throw new AppError("Bạn chưa tham gia phiên thi này. Hãy nhập mã tham gia trước.", 403);

    const seed = Number(userId) * 1000 + Number(sessionId); // seed cố định theo user+session

    const [questions] = await pool.execute(
        `SELECT id, question_type, title, description, is_required, points, settings FROM questions WHERE form_id = ? ORDER BY sort_order`,
        [session.form_id]
    );
    const [options] = await pool.execute(
        `SELECT qo.id, qo.question_id, qo.option_text, qo.sort_order
         FROM question_options qo JOIN questions q ON q.id = qo.question_id
         WHERE q.form_id = ? ORDER BY qo.sort_order`,
        [session.form_id]
    );

    const optsByQ = {};
    for (const o of options) {
        (optsByQ[o.question_id] ||= []).push({ id: o.id, option_text: o.option_text, sort_order: o.sort_order });
    }

    let result = questions.map((q) => ({
        id: q.id,
        question_type: q.question_type,
        title: q.title,
        description: q.description,
        is_required: !!q.is_required,
        points: Number(q.points),
        settings: typeof q.settings === "string" ? JSON.parse(q.settings || "{}") : (q.settings || {}),
        options: optsByQ[q.id] || [],
    }));

    if (session.shuffle_options) {
        for (const q of result) q.options = shuffleArray(q.options, seed + q.id);
    }
    if (session.shuffle_questions) {
        result = shuffleArray(result, seed);
        // sort_order mới theo thứ tự đã xáo
        result.forEach((q, i) => (q.sort_order = i));
    }

    return {
        submissionId: subs[0].id,
        session: {
            id: session.id,
            title: session.title,
            form_title: session.form_title,
            session_type: session.session_type,
            duration_minutes: session.duration_minutes,
            end_time: session.end_time,
            anti_cheat: !!session.anti_cheat,
            show_result: !!session.show_result,
        },
        questions: result,
    };
}

// ============ 7. LƯU NHÁP CÂU TRẢ LỜI (autosave) ============
export async function saveDraftAnswer(submissionId, userId, questionId, answerText, answerJson) {
    const [subs] = await pool.execute(
        `SELECT id, status FROM submissions WHERE id = ? AND user_id = ? LIMIT 1`,
        [submissionId, userId]
    );
    if (!subs.length) throw new AppError("Không tìm thấy bài làm", 404);
    if (subs[0].status !== "in_progress") throw new AppError("Bài thi đã được nộp, không thể lưu nháp", 400);

    // answers không có UNIQUE(submission_id, question_id) — kiểm tra rồi insert/update
    const [existing] = await pool.execute(
        `SELECT id FROM answers WHERE submission_id = ? AND question_id = ? LIMIT 1`,
        [submissionId, questionId]
    );
    if (existing.length) {
        await pool.execute(
            `UPDATE answers SET answer_text = ?, answer_json = ?, updated_at = NOW() WHERE id = ?`,
            [answerText || null, answerJson ? JSON.stringify(answerJson) : null, existing[0].id]
        );
    } else {
        await pool.execute(
            `INSERT INTO answers (submission_id, question_id, answer_text, answer_json) VALUES (?, ?, ?, ?)`,
            [submissionId, questionId, answerText || null, answerJson ? JSON.stringify(answerJson) : null]
        );
    }
    return { saved: true };
}

// Lấy các câu trả lồi nháp đã autosave (học sinh khôi phục sau khi reload/thoát trình duyệt)
export async function getDraftAnswers(submissionId, userId) {
    const [subs] = await pool.execute(
        `SELECT id FROM submissions WHERE id = ? AND user_id = ? LIMIT 1`,
        [submissionId, userId]
    );
    if (!subs.length) throw new AppError("Không tìm thấy bài làm", 404);
    const [rows] = await pool.execute(
        `SELECT question_id, answer_text, answer_json FROM answers WHERE submission_id = ?`,
        [submissionId]
    );
    return rows;
}

// ============ 8. CHẤM ĐIỂM MỘT CÂU HỎI (dùng chung cho nộp bài + chấm tay) ============
export function gradeQuestion(question, options, ans) {
    let isCorrect = null;
    let pointsAwarded = 0;
    const pts = Number(question.points || 0);

    switch (question.question_type) {
        case "multiple_choice":
        case "true_false": {
            const selectedId = ans.answer_json?.selectedOptionId;
            const correctOpt = options.find((o) => o.is_correct === 1);
            if (selectedId && correctOpt && Number(selectedId) === correctOpt.id) {
                isCorrect = 1; pointsAwarded = pts;
            } else if (selectedId) isCorrect = 0;
            break;
        }
        case "multiple_select": {
            const selectedIds = (ans.answer_json?.selectedOptionIds || []).map(Number).sort();
            const correctIds = options.filter((o) => o.is_correct === 1).map((o) => o.id).sort();
            if (selectedIds.length) {
                const ok = selectedIds.length === correctIds.length && selectedIds.every((v, i) => v === correctIds[i]);
                isCorrect = ok ? 1 : 0;
                pointsAwarded = ok ? pts : 0;
            }
            break;
        }
        case "short_answer": {
            const text = (ans.answer_text || "").trim().toLowerCase();
            const accepted = options.filter((o) => o.is_correct === 1).map((o) => o.option_text.trim().toLowerCase());
            if (text) {
                const ok = accepted.some((a) => a === text);
                isCorrect = ok ? 1 : 0;
                pointsAwarded = ok ? pts : 0;
            }
            break;
        }
        case "fill_blank": {
            // settings.blanks: mảng đáp án đúng cho từng chỗ trống; answer_json.blanks: { index: text }
            const settings = typeof question.settings === "string" ? JSON.parse(question.settings || "{}") : (question.settings || {});
            const correctBlanks = settings.blanks || [];
            const given = ans.answer_json?.blanks || {};
            const filled = Object.keys(given).length;
            if (filled > 0 && correctBlanks.length) {
                let correctCount = 0;
                correctBlanks.forEach((c, i) => {
                    const g = (given[i] || "").trim().toLowerCase();
                    const accepted = Array.isArray(c) ? c : [c];
                    if (accepted.some((a) => String(a).trim().toLowerCase() === g)) correctCount++;
                });
                // Chấm theo tỉ lệ: đúng hết = đủ điểm
                const ratio = correctCount / correctBlanks.length;
                isCorrect = ratio === 1 ? 1 : 0;
                pointsAwarded = Math.round(pts * ratio * 100) / 100;
            }
            break;
        }
        case "ordering": {
            // settings.items: mảng đáp án đúng theo thứ tự; answer_json.order: mảng user sắp xếp
            const settings = typeof question.settings === "string" ? JSON.parse(question.settings || "{}") : (question.settings || {});
            const correctOrder = settings.items || [];
            const givenOrder = ans.answer_json?.order || [];
            if (givenOrder.length && correctOrder.length) {
                const ok = givenOrder.length === correctOrder.length && givenOrder.every((v, i) => v === correctOrder[i]);
                isCorrect = ok ? 1 : 0;
                pointsAwarded = ok ? pts : 0;
            }
            break;
        }
        case "matching": {
            // settings.pairs: [{left, right}]; answer_json.matches: { left: right }
            const settings = typeof question.settings === "string" ? JSON.parse(question.settings || "{}") : (question.settings || {});
            const pairs = settings.pairs || [];
            const matches = ans.answer_json?.matches || {};
            const done = Object.keys(matches).length;
            if (done > 0 && pairs.length) {
                let correctCount = 0;
                for (const p of pairs) {
                    if ((matches[p.left] || "") === p.right) correctCount++;
                }
                const ratio = correctCount / pairs.length;
                isCorrect = ratio === 1 ? 1 : 0;
                pointsAwarded = Math.round(pts * ratio * 100) / 100;
            }
            break;
        }
        case "rating":
        case "date": {
            // Không chấm đúng/sai — khảo sát
            isCorrect = null;
            break;
        }
        default:
            // long_answer, file_upload: chờ giáo viên chấm tay
            isCorrect = null;
    }
    return { isCorrect, pointsAwarded };
}

// ============ 9. NỘP BÀI (tự động chấm điểm đầy đủ loại câu hỏi) ============
export async function submitExam(submissionId, userId, answersData, { auto = false } = {}) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [subs] = await connection.execute(
            `SELECT * FROM submissions WHERE id = ? AND user_id = ? LIMIT 1`,
            [submissionId, userId]
        );
        if (!subs.length) throw new AppError("Không tìm thấy bài làm", 404);
        const submission = subs[0];
        if (["submitted", "auto_submitted", "graded"].includes(submission.status))
            throw new AppError("Bài thi này đã được nộp trước đó", 400);

        const [sessionRows] = await connection.execute(
            `SELECT * FROM exam_sessions WHERE id = ? LIMIT 1`, [submission.session_id]
        );
        const session = sessionRows[0];

        const [questions] = await connection.execute(
            `SELECT id, question_type, points, settings FROM questions WHERE form_id = ?`,
            [session.form_id]
        );
        const questionMap = new Map(questions.map((q) => [q.id, q]));

        const [allOptions] = await connection.execute(
            `SELECT qo.id, qo.question_id, qo.option_text, qo.is_correct
             FROM question_options qo JOIN questions q ON q.id = qo.question_id WHERE q.form_id = ?`,
            [session.form_id]
        );
        const optionsByQ = {};
        for (const o of allOptions) (optionsByQ[o.question_id] ||= []).push(o);

        let totalScore = 0;
        let maxScore = questions.reduce((s, q) => s + Number(q.points || 0), 0);
        const gradedAt = new Date();

        for (const ans of answersData) {
            const question = questionMap.get(Number(ans.question_id));
            if (!question) continue;

            const { isCorrect, pointsAwarded } = gradeQuestion(question, optionsByQ[question.id] || [], ans);
            if (pointsAwarded) totalScore += pointsAwarded;

            // Xóa draft cũ rồi chèn bản đã chấm (đảm bảo không bị trùng khi đã autosave)
            await connection.execute(
                `DELETE FROM answers WHERE submission_id = ? AND question_id = ?`,
                [submissionId, question.id]
            );
            await connection.execute(
                `INSERT INTO answers (submission_id, question_id, answer_text, answer_json, is_correct, points_awarded)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [submissionId, question.id, ans.answer_text || null, ans.answer_json ? JSON.stringify(ans.answer_json) : null, isCorrect, pointsAwarded]
            );
        }

        // Xác định trạng thái: còn câu tự luận chưa chấm → chờ chấm, ngược lại đã chấm xong
        const [needsGrading] = await connection.execute(
            `SELECT COUNT(*) AS total FROM answers a
             JOIN questions q ON q.id = a.question_id
             WHERE a.submission_id = ? AND q.question_type IN ('long_answer','file_upload')
               AND a.points_awarded = 0 AND a.is_correct IS NULL AND a.answer_text IS NOT NULL`,
            [submissionId]
        );

        const newStatus = needsGrading[0].total > 0 ? "submitted" : "graded";
        await connection.execute(
            `UPDATE submissions SET status = ?, submitted_at = NOW(), total_score = ?, max_score = ? WHERE id = ?`,
            [auto ? "auto_submitted" : newStatus, totalScore, maxScore, submissionId]
        );

        // Thông báo kết quả cho học sinh
        if (session.show_result) {
            await createNotification(
                connection, userId,
                auto ? "Hệ thống đã tự động nộp bài" : "Nộp bài thành công",
                `Bài "${session.title}" đã được nộp. Tổng điểm tạm tính: ${totalScore}/${maxScore}.`,
                "result"
            );
        }

        await connection.commit();
        return { totalScore, maxScore, status: auto ? "auto_submitted" : newStatus };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// ============ 10. CHỐNG GIAN LẬN ============
export async function logAntiCheatEvent(submissionId, userId, eventType, detail) {
    const valid = ["tab_switch", "window_blur", "copy_paste", "right_click", "devtools", "fullscreen_exit"];
    if (!valid.includes(eventType)) throw new AppError("Loại sự kiện không hợp lệ", 400);

    const [subs] = await pool.execute(
        `SELECT id FROM submissions WHERE id = ? AND user_id = ? LIMIT 1`,
        [submissionId, userId]
    );
    if (!subs.length) throw new AppError("Không tìm thấy bài làm", 404);

    await pool.execute(
        `INSERT INTO anti_cheat_events (submission_id, event_type, detail) VALUES (?, ?, ?)`,
        [submissionId, eventType, (detail || "").slice(0, 500)]
    );
    return { logged: true };
}

export async function getAntiCheatEvents(submissionId, userId) {
    // Giáo viên sở hữu session hoặc chính học sinh đó xem được
    const [rows] = await pool.execute(
        `
        SELECT ace.*, s.user_id AS student_id
        FROM anti_cheat_events ace
        JOIN submissions s ON s.id = ace.submission_id
        JOIN exam_sessions es ON es.id = s.session_id
        WHERE ace.submission_id = ? AND (es.created_by = ? OR s.user_id = ?)
        ORDER BY ace.created_at
        `,
        [submissionId, userId, userId]
    );
    return rows;
}

// ============ 11. CHẤM ĐIỂM THỦ CÔNG (tự luận) ============
export async function gradeAnswer(answerId, graderId, points, feedback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `
            SELECT a.*, q.points AS max_points, q.question_type, s.id AS submission_id, s.status AS sub_status
            FROM answers a
            JOIN questions q ON q.id = a.question_id
            JOIN submissions s ON s.id = a.submission_id
            JOIN exam_sessions es ON es.id = s.session_id
            WHERE a.id = ? AND es.created_by = ?
            LIMIT 1
            `,
            [answerId, graderId]
        );
        if (!rows.length) throw new AppError("Không tìm thấy câu trả lồi hoặc bạn không có quyền chấm", 404);

        const answer = rows[0];
        if (answer.points > Number(points)) throw new AppError(`Điểm chấm không được vượt quá ${answer.max_points}`, 400);

        await connection.execute(
            `UPDATE answers SET points_awarded = ?, is_correct = ?, graded_by = ?, graded_at = NOW() WHERE id = ?`,
            [points, Number(points) > 0 ? 1 : 0, graderId, answerId]
        );

        // Tính lại tổng điểm submission
        const [sumRows] = await connection.execute(
            `SELECT SUM(points_awarded) AS total FROM answers WHERE submission_id = ?`,
            [answer.submission_id]
        );
        const newTotal = sumRows[0].total || 0;

        const [pendingRows] = await connection.execute(
            `
            SELECT COUNT(*) AS total FROM answers a
            JOIN questions q ON q.id = a.question_id
            WHERE a.submission_id = ? AND q.question_type IN ('long_answer','file_upload')
              AND a.graded_at IS NULL AND (a.answer_text IS NOT NULL OR a.answer_json IS NOT NULL)
            `,
            [answer.submission_id]
        );
        const newStatus = pendingRows[0].total === 0 ? "graded" : answer.sub_status;

        await connection.execute(
            `UPDATE submissions SET total_score = ?, status = ? WHERE id = ?`,
            [newTotal, newStatus, answer.submission_id]
        );

        await connection.commit();
        return { submissionId: answer.submission_id, newTotal, status: newStatus };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// ============ 12. CÔNG BỐ ĐIỂM (publish grades -> gửi thông báo cho tất cả học sinh) ============
export async function publishGrades(sessionId, teacherId) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [sessions] = await connection.execute(
            `SELECT * FROM exam_sessions WHERE id = ? AND created_by = ? LIMIT 1`,
            [sessionId, teacherId]
        );
        if (!sessions.length) throw new AppError("Không tìm thấy phiên thi hoặc bạn không có quyền", 404);
        const session = sessions[0];

        const [subs] = await connection.execute(
            `SELECT id, user_id, total_score, max_score FROM submissions WHERE session_id = ? AND status = 'graded'`,
            [sessionId]
        );

        for (const s of subs) {
            await connection.execute(
                `UPDATE grades SET status = 'published', graded_at = NOW() WHERE submission_id = ?`,
                [s.id]
            ).catch(() => {}); // bảng grades có thể chưa có dòng tương ứng
            await createNotification(
                connection, s.user_id,
                "Điểm đã được công bố",
                `Điểm kỳ thi "${session.title}" của bạn: ${s.total_score}/${s.max_score}.`,
                "grade_published"
            );
        }

        await connection.commit();
        return { published: subs.length };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// ============ 13. PHÂN TÍCH KẾT QUẢ THEO TỪNG CÂU HỎI ============
export async function getQuestionAnalytics(sessionId, teacherId) {
    const [sessions] = await pool.execute(
        `SELECT id, created_by FROM exam_sessions WHERE id = ? LIMIT 1`, [sessionId]
    );
    if (!sessions.length) throw new AppError("Không tìm thấy phiên thi", 404);
    if (sessions[0].created_by !== teacherId) throw new AppError("Bạn không có quyền xem phân tích", 403);

    const [rows] = await pool.execute(
        `
        SELECT q.id, q.title, q.question_type, q.points, q.sort_order,
               COUNT(a.id) AS answered_count,
               SUM(CASE WHEN a.is_correct = 1 THEN 1 ELSE 0 END) AS correct_count,
               SUM(CASE WHEN a.is_correct = 0 THEN 1 ELSE 0 END) AS wrong_count,
               ROUND(AVG(a.points_awarded), 2) AS avg_points
        FROM questions q
        LEFT JOIN answers a ON a.question_id = q.id
        LEFT JOIN submissions s ON s.id = a.submission_id AND s.session_id = ?
        WHERE q.form_id = (SELECT form_id FROM exam_sessions WHERE id = ?)
        GROUP BY q.id
        ORDER BY q.sort_order
        `,
        [sessionId, sessionId]
    );
    return rows;
}

// ============ 14. CHI TIẾT BÀI LÀM (giáo viên chấm điểm) ============
export async function getSubmissionDetail(sessionId, submissionId, teacherId) {
    const [sessions] = await pool.execute(
        "SELECT created_by FROM exam_sessions WHERE id = ? LIMIT 1", [sessionId]
    );
    if (!sessions.length) throw new AppError("Không tìm thấy phiên thi", 404);
    if (sessions[0].created_by !== teacherId) throw new AppError("Bạn không có quyền xem bài này", 403);

    const [rows] = await pool.execute(
        `
        SELECT a.id, a.answer_text, a.answer_json, a.is_correct, a.points_awarded,
               q.id AS question_id, q.title, q.question_type, q.points AS max_points, q.sort_order
        FROM answers a
        JOIN questions q ON q.id = a.question_id
        WHERE a.submission_id = ?
        ORDER BY q.sort_order
        `,
        [submissionId]
    );
    const [subs] = await pool.execute(
        `SELECT id, user_id, status, total_score, max_score FROM submissions WHERE id = ? AND session_id = ? LIMIT 1`,
        [submissionId, sessionId]
    );
    if (!subs.length) throw new AppError("Không tìm thấy bài làm", 404);
    return { submission: subs[0], answers: rows };
}
