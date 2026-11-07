import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum([
        "development",
        "production",
        "test"
    ]).default("development"),

    PORT: z.coerce.number()
        .int()
        .min(1)
        .max(65535)
        .default(5000),

    CLIENT_URL: z.string().url(),

    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().default(3306),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().default(""),
    DB_NAME: z.string().min(1),

    JWT_ACCESS_SECRET: z.string().min(64),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

    REFRESH_TOKEN_EXPIRES_DAYS: z.coerce
        .number()
        .int()
        .min(1)
        .max(90)
        .default(7)
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error(" LỖI CẤU HÌNH BIẾN MÔI TRƯỜNG VUI LÒNG KIỂM TRA FILE .ENV:");
    // Đoạn code này sẽ in chi tiết tên biến nào đang bị thiếu hoặc sai định dạng
    result.error.issues.forEach((issue) => {
        console.error(`- Biến [${issue.path.join(".")}]: ${issue.message}`);
    });
    process.exit(1); 
}
export const env = result.data;