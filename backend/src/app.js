import express from "express";
import cors from "cors";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import formRoutes from "./routes/form.routes.js";
import pool from "./config/database.js";
import { env } from "./config/env.js";
import examRoutes from "./routes/exam.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import AppError from "./utils/app-error.js";
import errorHandler from "./middlewares/error.middleware.js";
import reportRoutes from "./routes/report.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import classRoutes from "./routes/class.routes.js";
const app = express();
app.use(cookieParser());
// CORS
app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true
}));

// Body parser
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "2mb"
}));
app.use("/uploads", express.static("uploads"))
// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Online Education API is running!"
    });
});

// Database health check
app.get("/api/health/db", async (req, res) => {
    const [rows] = await pool.query(`
        SELECT DATABASE() AS database_name,
               NOW() AS now_time
    `);

    res.json({
        success: true,
        data: rows[0]
    });
});

// Authentication
app.use("/api/auth", authRoutes);

// User Management
app.use("/api/users", userRoutes);

// Report Management
app.use("/api", reportRoutes);
//form management
app.use("/api/forms", formRoutes);
app.use("/api/exam-sessions", examRoutes);
// Not Found
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/classes", classRoutes);
app.use((req, res, next) => {
    next(new AppError(
        `Route ${req.method} ${req.originalUrl} not found`,
        404
    ));
});

// Error handler - luôn đặt cuối
app.use(errorHandler);

export default app;