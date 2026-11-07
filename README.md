# EduExam — Hệ thống tạo biểu mẫu, kiểm tra & khảo sát trực tuyến

Nền tảng cho giáo viên tạo đề thi/khảo sát **không cần biết lập trình**: chọn loại câu hỏi, cấu hình điểm & thời gian, xuất bản và chia sẻ mã phòng. Học sinh chỉ cần mã phòng để làm bài.

## Công nghệ

- **Frontend**: React 19 + Vite + Tailwind CSS 4 + shadcn/ui (base-ui) + Zustand + Socket.IO client + Sonner
- **Backend**: Node.js + Express 5 + Socket.IO + JWT (access + refresh token rotation) + Zod + MySQL2
- **Database**: MySQL

## Cấu trúc

```
kiemtratructuyen/
├── backend/
│   ├── database/
│   │   ├── migrations/002_extensions.sql   # Migration mở rộng schema
│   │   └── seed.js                         # Dữ liệu mẫu đầy đủ
│   └── src/                                # controllers / services / routes / socket / validators
└── frontend/
    └── src/
        ├── api/                            # Client gọi API tập trung
        ├── builder/                        # Form builder (câu hỏi, cài đặt, xuất bản)
        ├── components/ui/                  # Bộ UI đồng nhất (button, card, input, table, dialog, tabs...)
        ├── components/layout/              # AppLayout + sidebar theo vai trò
        ├── pages/                          # teacher / student / admin / auth
        └── questions/                      # 9 loại câu hỏi × (Editor/Preview/Renderer)
```

## Chạy dự án

### 1. Database

```bash
mysql -u root -p < backend/dump-online_education_platform-202611050819.sql
mysql -u root -p online_education_platform < backend/database/migrations/002_extensions.sql
```

Cấu hình kết nối trong `backend/.env` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT secrets...).

### 2. Backend (port 4000)

```bash
cd backend
npm install
node database/seed.js     # Tạo dữ liệu mẫu (tài khoản, lớp, đề thi, kết quả)
npm run dev
```

### 3. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

## Tài khoản demo (mật khẩu: `123456`)

| Vai trò | Email |
|---|---|
| Admin | admin@school.edu.vn |
| Giáo viên | nguyen@school.edu.vn, hung@school.edu.vn |
| Học sinh | an@student.edu.vn, bao@student.edu.vn, chau@..., dung@..., em@... |

Mã phòng demo: `MATH10B` (bài thi đang mở), `SVY41` (phòng khảo sát).

## Loại câu hỏi hỗ trợ (9 loại)

Trắc nghiệm 1 đáp án • Trắc nghiệm nhiều đáp án • Đúng/Sai • Trả lời ngắn • Tự luận • Điền vào chỗ trống • Sắp xếp thứ tự • Kéo thả ghép đôi • Đánh giá sao

Mỗi loại gồm 3 thành phần độc lập: `QuestionEditor` (giáo viên soạn), `QuestionPreview` (xem trước), `QuestionRenderer` (học sinh làm bài). Thêm loại mới = tạo thư mục + đăng ký trong `questions/registry.js`.

## Tính năng nổi bật

- **Form Builder**: soạn câu hỏi theo từng loại, kéo thả sắp xếp, xem trước, kiểm tra lỗi trước khi xuất bản (publish-check), quản lý phiên bản biểu mẫu.
- **Phòng thi & khảo sát trực tiếp**: mã phòng ngắn, giám sát realtime qua Socket.IO (ai đang online, câu trả lời gửi về tức thời), công bố điểm hàng loạt kèm thông báo.
- **Chống gian lận**: ghi nhận đổi tab, mất focus, copy/paste, chuột phải (bảng `anti_cheat_events`); xáo trộn câu hỏi/đáp án theo seed riêng từng học sinh (reload vẫn giữ thứ tự).
- **Autosave 2 lớp**: lưu nháp lên server mỗi 10s + localStorage mỗi 5s — lỡ tải lại/thoát trình duyệt vẫn nối lại đúng bài đang làm.
- **Tự động chấm**: trắc nghiệm 1/nhiều đáp án, đúng/sai, trả lời ngắn (so khớp), điền chỗ trống & ghép đôi (chấm theo tỉ lệ), sắp xếp. Tự luận chấm tay rồi công bố.
- **Kết quả & phân tích**: điểm TB/cao nhất/thấp nhất, tỉ lệ đúng từng câu, xuất Excel (exceljs) & PDF (pdfkit).
- **8 module**: User & Role, Form Builder, Online Examination, Realtime, Result & Analytics, Export, Notification, Admin System.
