import { createServer } from "node:http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import pool from "./config/database.js";
import app from "./app.js";
import { setupExamSocket } from "./socket/exam.socket.js";
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: env.CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});
setupExamSocket(io);
async function startServer() {
    try {
        // Kiểm tra database
        await pool.query("SELECT 1");

        console.log("MySQL connected successfully!");

        // Khởi động HTTP server
        server.listen(env.PORT, () => {
            console.log(
                `Server running at http://localhost:${env.PORT}`
            );
        });

    } catch (error) {
        console.error("Server startup failed:", error);

        await pool.end();

        process.exit(1);
    }
}

async function shutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down...`);

    server.close(async (error) => {
        if (error) {
            console.error("HTTP server shutdown error:", error);
            process.exitCode = 1;
        }

        try {
            await pool.end();
            console.log("MySQL pool closed.");

        } catch (dbError) {
            console.error("Database shutdown error:", dbError);
            process.exitCode = 1;
        }
    });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer();