import { z } from "zod";

export const loginSchema = z.object({
    email: z.string()
        .trim()
        .email("Invalid email address")
        .max(150),

    password: z.string()
        .min(1, "Password is required")
        .max(128)
});
export const registerSchema = z.object({
    full_name: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự").max(150),
    email: z.string().trim().email("Email không hợp lệ").max(150),
    username: z.string().trim().min(3).max(50).optional(),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(128),
    role: z.enum(["teacher", "student"]).default("student")
});
