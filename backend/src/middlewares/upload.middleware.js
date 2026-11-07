import multer from "multer";
import path from "node:path";

// Cấu hình nơi lưu và tên file khi upload lên server
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Lưu vào thư mục uploads/ ở gốc dự án
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        // Đặt tên file độc nhất để tránh trùng lặp: timestamp + số ngẫu nhiên + đuôi file gốc
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Giới hạn dung lượng file (ví dụ: tối đa 5MB)
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Cho phép các định dạng ảnh và âm thanh phổ biến
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("audio/")) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ hỗ trợ file ảnh hoặc âm thanh!"), false);
        }
    }
});