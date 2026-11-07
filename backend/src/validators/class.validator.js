import { z } from "zod";

export const createClassSchema = z.object({
    name: z.string().trim().min(1, "Tên lớp không được để trống").max(150),
    description: z.string().trim().optional(),
    school_id: z.coerce.number().int().positive().optional()
});

export const joinClassSchema = z.object({
    join_code: z.string().trim().min(1, "Mã tham gia lớp không được để trống")
});