// =============================================================
// Seed dữ liệu mẫu đầy đủ cho hệ thống thi & khảo sát trực tuyến
// Chạy: node database/seed.js   (từ thư mục backend/)
// =============================================================
import bcrypt from "bcryptjs";
import pool from "../src/config/database.js";

const NOW = new Date();
const daysAgo = (n) => new Date(NOW.getTime() - n * 86400000).toISOString().slice(0, 19).replace("T", " ");
const daysFromNow = (n) => new Date(NOW.getTime() + n * 86400000).toISOString().slice(0, 19).replace("T", " ");

async function main() {
  console.log("🌱 Bắt đầu seed dữ liệu...");

  const hash = await bcrypt.hash("123456", 10);

  // ---------- 1. Roles & Permissions ----------
  const roles = [
    [1, "admin", "Quản trị viên", "Toàn quyền hệ thống"],
    [2, "teacher", "Giáo viên", "Tạo biểu mẫu, kỳ thi, chấm điểm"],
    [3, "student", "Học sinh", "Tham gia thi, xem kết quả"],
  ];
  for (const [id, code, name, desc] of roles) {
    await pool.execute(
      "INSERT INTO roles (id, code, name, description) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)",
      [id, code, name, desc]
    );
  }

  const permissions = [
    ["user.view", "Xem ngưởi dùng"], ["user.manage", "Quản lý ngưởi dùng"],
    ["class.view", "Xem lớp học"], ["class.manage", "Quản lý lớp học"],
    ["form.view", "Xem biểu mẫu"], ["form.create", "Tạo biểu mẫu"],
    ["form.update", "Sửa biểu mẫu"], ["form.delete", "Xóa biểu mẫu"],
    ["form.publish", "Xuất bản biểu mẫu"],
    ["exam.create", "Tạo kỳ thi"], ["exam.monitor", "Giám sát phòng thi"],
    ["exam.submit", "Làm bài thi"], ["exam.grade", "Chấm điểm"],
    ["report.view", "Xem báo cáo"], ["report.export", "Xuất báo cáo"],
    ["admin.access", "Trang quản trị"],
  ];
  for (const [code, name] of permissions) {
    await pool.execute(
      "INSERT INTO permissions (code, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name)",
      [code, name]
    );
  }

  const rolePerms = {
    1: permissions.map((p) => p[0]), // admin: tất cả
    2: ["class.view", "class.manage", "form.view", "form.create", "form.update", "form.delete", "form.publish", "exam.create", "exam.monitor", "exam.grade", "report.view", "report.export"],
    3: ["exam.submit"],
  };
  for (const [roleId, codes] of Object.entries(rolePerms)) {
    const [perms] = await pool.query("SELECT id, code FROM permissions");
    for (const p of perms) {
      if (codes.includes(p.code)) {
        await pool.execute(
          "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
          [roleId, p.id]
        );
      }
    }
  }

  // ---------- 2. Users ----------
  const users = [
    // [id, username, email, full_name, roles]
    [1, "admin", "admin@school.edu.vn", "Nguyễn Văn Quản Trị", [1]],
    [2, "gv.nguyen", "nguyen@school.edu.vn", "Trần Thị Nguyện", [2]],
    [3, "gv.hung", "hung@school.edu.vn", "Lê Văn Hùng", [2]],
    [4, "hs.an", "an@student.edu.vn", "Phạm Hoàng An", [3]],
    [5, "hs.bao", "bao@student.edu.vn", "Đỗ Minh Bảo", [3]],
    [6, "hs.chau", "chau@student.edu.vn", "Vũ Hải Châu", [3]],
    [7, "hs.dung", "dung@student.edu.vn", "Ngô Thùy Dung", [3]],
    [8, "hs.em", "em@student.edu.vn", "Bùi Quốc Em", [3]],
  ];
  for (const [id, username, email, fullName, roleIds] of users) {
    await pool.execute(
      `INSERT INTO users (id, username, email, password_hash, full_name, status)
       VALUES (?,?,?,?,?, 'active')
       ON DUPLICATE KEY UPDATE full_name=VALUES(full_name)`,
      [id, username, email, hash, fullName]
    );
    for (const rid of roleIds) {
      await pool.execute("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)", [id, rid]);
    }
  }

  // ---------- 3. School & Classes ----------
  await pool.execute(
    `INSERT INTO schools (id, name, address, created_by) VALUES (1, 'THPT Kim Đồng', '123 Đường Lê Lợi, TP.HCM', 1)
     ON DUPLICATE KEY UPDATE name=VALUES(name)`
  );
  const classes = [
    [1, 1, "10A1", "Khối 10 - Ban Cơ bản", "CLS10A1", 2],
    [2, 1, "10A2", "Khối 10 - Ban Cơ bản", "CLS10A2", 2],
    [3, 1, "11A1", "Khối 11 - Ban Tự nhiên", "CLS11A1", 3],
  ];
  for (const [id, schoolId, name, desc, code, creator] of classes) {
    await pool.execute(
      `INSERT INTO classes (id, school_id, name, description, join_code, created_by, status)
       VALUES (?,?,?,?,?,?, 'active') ON DUPLICATE KEY UPDATE name=VALUES(name)`,
      [id, schoolId, name, desc, code, creator]
    );
  }
  // Phân lớp: gv.nguyen dạy 10A1, 10A2; gv.hung dạy 11A1
  await pool.execute("INSERT IGNORE INTO class_members (class_id, user_id, member_role) VALUES (1,2,'teacher'),(2,2,'teacher'),(3,3,'teacher')");
  // Học sinh vào lớp
  for (const uid of [4, 5]) await pool.execute("INSERT IGNORE INTO class_members (class_id, user_id, member_role) VALUES (1,?,'student')", [uid]);
  for (const uid of [6, 7]) await pool.execute("INSERT IGNORE INTO class_members (class_id, user_id, member_role) VALUES (2,?,'student')", [uid]);
  await pool.execute("INSERT IGNORE INTO class_members (class_id, user_id, member_role) VALUES (3,8,'student')");

  // ---------- 4. Forms & Questions ----------
  // Form 1: Đề thi Toán giữa kỳ (đã publish, đủ loại câu hỏi)
  await pool.execute(
    `INSERT INTO forms (id, owner_id, school_id, title, description, form_type, status, settings)
     VALUES (1, 2, 1, 'Đề kiểm tra giữa kỳ môn Toán 10', 'Đề thi 45 phút, gồm trắc nghiệm và tự luận', 'exam', 'published',
            JSON_OBJECT('subject','Toán','grade','10')) 
     ON DUPLICATE KEY UPDATE title=VALUES(title)`
  );

  const q = async (id, type, title, points, required = 1, settings = {}) => {
    await pool.execute(
      `INSERT INTO questions (id, form_id, question_type, title, is_required, points, sort_order, settings)
       VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)`,
      [id, 1, type, title, required, points, id, JSON.stringify(settings)]
    );
  };
  await q(1, "multiple_choice", "Tính đạo hàm của hàm số y = x² + 3x tại x = 1.", 1);
  await q(2, "multiple_select", "Chọn các hàm số nào sau đây đồng biến trên ℝ?", 2);
  await q(3, "true_false", "Phát biểu: 'Hàm số y = x³ có cực trị tại x = 0' là đúng hay sai?", 1);
  await q(4, "fill_blank", "Điền vào chỗ trống: Nếu hàm số f(x) liên tục trên [a;b] và f(a).f(b) < 0 thì phương trình f(x) = 0 có ít nhất ____ nghiệm trong khoảng (a;b).", 1, 1, { blanks: ["một"] });
  await q(5, "short_answer", "Tính giá trị của biểu thức: 2⁵ − 5²", 1);
  await q(6, "ordering", "Sắp xếp các số sau theo thứ tự tăng dần: 2; √5; 3; π", 2, 1, { items: ["2", "√5", "3", "π"] });
  await q(7, "long_answer", "Chứng minh rằng với mọi a, b > 0 ta có: (a+b)/2 ≥ √(ab).", 3);
  await q(8, "rating", "Bạn đánh giá mức độ khó của đề thi này như thế nào?", 0, 0, { max: 5 });

  const opt = async (id, qid, text, correct, order) => {
    await pool.execute(
      `INSERT INTO question_options (id, question_id, option_text, is_correct, sort_order)
       VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE option_text=VALUES(option_text)`,
      [id, qid, text, correct, order]
    );
  };
  // Q1: đạo hàm y'=2x+3 → tại x=1 là 5
  await opt(1, 1, "3", 0, 1); await opt(2, 1, "5", 1, 2); await opt(3, 1, "7", 0, 3); await opt(4, 1, "2", 0, 4);
  // Q2: đồng biến trên R: y=x³+x, y=e^x... (với chương trình 10: y = x³ + x và y = 2x + 1)
  await opt(5, 2, "y = x³ + x", 1, 1); await opt(6, 2, "y = 2x + 1", 1, 2);
  await opt(7, 2, "y = x²", 0, 3); await opt(8, 2, "y = 1/x", 0, 4);
  // Q3: hàm x³ không có cực trị tại 0 → Sai
  await opt(9, 3, "Đúng", 0, 1); await opt(10, 3, "Sai", 1, 2);
  // Q5: 2⁵−5² = 32−25 = 7 → đáp án đúng là option ảo dùng answer_text matching
  await opt(11, 5, "7", 1, 1);

  // Form 2: Khảo sát trực tiếp (survey)
  await pool.execute(
    `INSERT INTO forms (id, owner_id, school_id, title, description, form_type, status, settings)
     VALUES (2, 2, 1, 'Khảo sát chất lượng giảng dạy', 'Phiếu khảo sát cuối tuần', 'survey', 'published',
            JSON_OBJECT('anonymous', true)) ON DUPLICATE KEY UPDATE title=VALUES(title)`
  );
  const qs = [
    [9, 2, "rating", "Bạn đánh giá mức độ hài lòng về nội dung bài giảng?", 0, { max: 5 }],
    [10, 2, "multiple_choice", "Thứ 2 tuần sau bạn có tham gia buổi ôn tập không?", 0],
    [11, 2, "long_answer", "Bạn có góp ý gì để giờ học tốt hơn?", 0],
  ];
  for (const [id, formId, type, title, req, settings] of qs) {
    await pool.execute(
      `INSERT INTO questions (id, form_id, question_type, title, is_required, points, sort_order, settings)
       VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title)`,
      [id, formId, type, title, req, 0, id, JSON.stringify(settings || {})]
    );
  }
  await opt(12, 10, "Có tham gia", 0, 1); await opt(13, 10, "Không tham gia", 0, 2);

  // Form versions (snapshot tối thiểu để publish/exam dùng được)
  for (const [id, formId, vnum] of [[1, 1, 1], [2, 2, 1]]) {
    const [qsRows] = await pool.query("SELECT * FROM questions WHERE form_id = ?", [formId]);
    const snapshot = { questions: qsRows };
    await pool.execute(
      `INSERT INTO form_versions (id, form_id, version_number, snapshot_json, created_by)
       VALUES (?,?,?,?,2) ON DUPLICATE KEY UPDATE snapshot_json=VALUES(snapshot_json)`,
      [id, formId, vnum, JSON.stringify(snapshot)]
    );
  }

  // ---------- 5. Exam sessions ----------
  const sessions = [
    // [id, form_id, title, type, code, status, start, end, duration, attempts, shuffle_q, shuffle_o, anti_cheat, show_result, passing]
    [1, 1, "Kiểm tra giữa kỳ Toán 10 - Ca 1", "exam", "MATH10A", "finished", daysAgo(10), daysAgo(10), 45, 1, 1, 1, 1, 1, 5],
    [2, 1, "Kiểm tra giữa kỳ Toán 10 - Ca 2", "exam", "MATH10B", "active", daysAgo(1), daysFromNow(2), 45, 1, 1, 1, 1, 1, 5],
    [3, 2, "Khảo sát trực tiếp tuần 41", "survey", "SVY41", "active", daysAgo(1), daysFromNow(5), null, 1, 0, 0, 0, 0, null],
  ];
for (const s of sessions) {
  await pool.execute(
    `INSERT INTO exam_sessions (
      id, form_id, form_version_id, created_by, title, 
      access_code, session_type, start_time, end_time, duration_minutes, 
      attempts_allowed, status, shuffle_questions, shuffle_options, anti_cheat, 
      show_result, passing_score
    )
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE title=VALUES(title)`,
    [
      s[0],  // id
      s[1],  // form_id
      s[1],  // form_version_id (tạm thời lấy bằng form_id theo code cũ của bạn)
      2,     // created_by
      s[2],  // title
      s[4],  // access_code (MATH10A, MATH10B, SVY41) -> s[4] mới đúng
      s[3],  // session_type (exam, survey) -> s[3] mới đúng
      s[6],  // start_time
      s[7],  // end_time
      s[8],  // duration_minutes
      s[9],  // attempts_allowed
      s[5],  // status (finished, active)
      s[10], // shuffle_questions
      s[11], // shuffle_options
      s[12], // anti_cheat
      s[13], // show_result
      s[14]  // passing_score
    ]
  );
}


  // ---------- 6. Submissions & Answers (kết quả đã có để xem báo cáo) ----------
  // Học sinh 4 (An) đã thi ca 1: 5/10 câu đúng
  const subs = [
    [1, 1, 4, 1, daysAgo(10), daysAgo(10), "graded", 6, 8],
    [2, 1, 5, 1, daysAgo(10), daysAgo(10), "graded", 8, 8],
    [3, 1, 6, 1, daysAgo(10), daysAgo(10), "graded", 4, 8],
    [4, 1, 7, 1, daysAgo(10), daysAgo(10), "graded", 7, 8],
    [5, 1, 8, 1, daysAgo(10), daysAgo(10), "graded", 5, 8],
  ];
  for (const s of subs) {
    await pool.execute(
      `INSERT INTO submissions (id, session_id, user_id, attempt_number, started_at, submitted_at, status, total_score, max_score)
       VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE total_score=VALUES(total_score)`,
      s
    );
  }
  // Chi tiết answers cho submission 1 (An)
  const answers = [
    [1, 1, 1, null, JSON.stringify({ selectedOptionId: 2 }), 1, 1],   // Q1 đúng
    [2, 1, 2, null, JSON.stringify({ selectedOptionIds: [5, 6] }), 1, 2], // Q2 đúng
    [3, 1, 3, null, JSON.stringify({ selectedOptionId: 9 }), 0, 0],   // Q3 sai
    [4, 1, 4, null, JSON.stringify({ blanks: { 0: "một" } }), 1, 1],  // Q4 đúng
    [5, 1, 5, "7", null, 1, 1],                                        // Q5 đúng
    [6, 1, 6, null, JSON.stringify({ order: ["2", "√5", "3", "π"] }), 0, 0], // Q6 sai (sai thứ tự)
    [7, 1, 7, "Áp dụng bất đẳng thức Cô-si: (a+b)/2 ≥ √(ab). Dấu bằng xảy ra khi a=b.", null, null, 0], // Q7 chờ chấm
    [8, 1, 8, null, JSON.stringify({ rating: 4 }), null, 0],           // Q8 không tính điểm
  ];
  for (const [id, subId, qid, text, json, correct, pts] of answers) {
    await pool.execute(
      `INSERT INTO answers (id, submission_id, question_id, answer_text, answer_json, is_correct, points_awarded)
       VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE answer_json=VALUES(answer_json)`,
      [id, subId, qid, text, json, correct, pts]
    );
  }

  // ---------- 7. Notifications ----------
  const notifs = [
    [1, 4, "Kết quả bài thi", "Bạn đạt 6/8 điểm kiểm tra giữa kỳ Toán 10.", "result"],
    [2, 4, "Bài thi sắp diễn ra", "Ca 2 bắt đầu sau 1 ngày, mã tham gia MATH10B.", "exam"],
    [3, 5, "Kết quả bài thi", "Bạn đạt 8/8 điểm kiểm tra giữa kỳ Toán 10. Xin chúc mừng!", "result"],
  ];
  for (const [id, uid, title, msg, type] of notifs) {
    await pool.execute(
      `INSERT INTO notifications (id, user_id, title, message, notification_type)
       VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE message=VALUES(message)`,
      [id, uid, title, msg, type]
    );
  }

  console.log("✅ Seed hoàn tất!");
  console.log("   Tài khoản (mật khẩu: 123456):");
  console.log("   - Admin:    admin@school.edu.vn");
  console.log("   - Teacher:  nguyen@school.edu.vn / hung@school.edu.vn");
  console.log("   - Student:  an@student.edu.vn (và bao/chau/dung/em)");
  console.log("   - Mã phòng: MATH10B (thi), SVY41 (khảo sát)");
}

main()
  .catch((e) => { console.error("❌ Seed thất bại:", e.message); process.exitCode = 1; })
  .finally(() => pool.end());
