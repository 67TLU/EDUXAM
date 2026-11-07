import pool from "../config/database.js";
import AppError from "../utils/app-error.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";

// 1. Lấy kết quả & thống kê của một kỳ thi
export async function getExamResults(sessionId) {
    const [sessions] = await pool.execute(
        `SELECT * FROM exam_sessions WHERE id = ? LIMIT 1`,
        [sessionId]
    );
    if (!sessions.length) {
        throw new AppError("Không tìm thấy kỳ thi", 404);
    }

    // Lấy danh sách học sinh nộp bài trong session
    const [submissions] = await pool.execute(
        `
        SELECT s.id, s.attempt_number, s.started_at, s.submitted_at, 
               s.status, s.total_score, s.max_score,
               u.id as user_id, u.username, u.full_name, u.email
        FROM submissions s
        JOIN users u ON u.id = s.user_id
        WHERE s.session_id = ?
        ORDER BY s.total_score DESC
        `,
        [sessionId]
    );

    // Tính điểm trung bình, cao nhất, thấp nhất
    const [stats] = await pool.execute(
        `
        SELECT 
            COUNT(*) as total_submissions,
            AVG(total_score) as average_score,
            MAX(total_score) as max_score,
            MIN(total_score) as min_score
        FROM submissions
        WHERE session_id = ? AND status IN ('submitted', 'graded')
        `,
        [sessionId]
    );

    return {
        session: sessions[0],
        statistics: stats[0],
        submissions
    };
}

// 2. Xuất Excel danh sách điểm
export async function exportExamExcel(sessionId, res) {
    const data = await getExamResults(sessionId);
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bảng điểm kỳ thi");

    // Định nghĩa cột
    worksheet.columns = [
        { header: "STT", key: "stt", width: 10 },
        { header: "Họ và tên", key: "full_name", width: 25 },
        { header: "Email", key: "email", width: 30 },
        { header: "Số lần thi", key: "attempt_number", width: 12 },
        { header: "Điểm số", key: "total_score", width: 12 },
        { header: "Điểm tối đa", key: "max_score", width: 12 },
        { header: "Trạng thái", key: "status", width: 15 },
        { header: "Thời gian nộp", key: "submitted_at", width: 20 }
    ];

    // Thêm dữ liệu
    data.submissions.forEach((sub, index) => {
        worksheet.addRow({
            stt: index + 1,
            full_name: sub.full_name,
            email: sub.email,
            attempt_number: sub.attempt_number,
            total_score: sub.total_score,
            max_score: sub.max_score,
            status: sub.status,
            submitted_at: sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : ""
        });
    });

    // Cấu hình header trả về file excel cho client
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        `attachment; filename=BangDiem_KyThi_${sessionId}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
}

// 3. Xuất kết quả bài làm ra PDF
export async function exportSubmissionPDF(submissionId, res) {
    const [subs] = await pool.execute(
        `
        SELECT s.*, es.title as exam_title, u.full_name, u.email
        FROM submissions s
        JOIN exam_sessions es ON es.id = s.session_id
        JOIN users u ON u.id = s.user_id
        WHERE s.id = ?
        LIMIT 1
        `,
        [submissionId]
    );

    if (!subs.length) {
        throw new AppError("Không tìm thấy bài nộp", 404);
    }

    const sub = subs[0];

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=KetQua_BaiThi_${submissionId}.pdf`);

    doc.pipe(res);

    // Nội dung PDF
    doc.fontSize(20).text("CHUYEN TRANG GIAO DUC TRUC TUYEN", { align: "center" });
    doc.fontSize(14).text("KET QUA BAI LAM CHI TIET", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Ky thi: ${sub.exam_title}`);
    doc.text(`Ho va ten hoc sinh: ${sub.full_name}`);
    doc.text(`Email: ${sub.email}`);
    doc.text(`Tong diem: ${sub.total_score} / ${sub.max_score}`);
    doc.text(`Trang thai: ${sub.status}`);
    doc.text(`Thoi gian nop: ${sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "Chua ro"}`);
    doc.moveDown();

    doc.text("-----------------------------------------------------------------------------------------");
    doc.fontSize(10).text("Cam on ban da su dung he thong thi truc tuyen cua chung toi.", { align: "center" });

    doc.end();
}