import pool from "../config/database.js";

// Lưu trạng thái online trong memory: roomCode -> Map<userId, {socketId, fullName, joinedAt}>
const rooms = new Map();

function broadcastParticipants(io, roomCode) {
    const participants = rooms.has(roomCode)
        ? [...rooms.get(roomCode).values()].map((p) => ({ userId: p.userId, fullName: p.fullName, joinedAt: p.joinedAt }))
        : [];
    io.to(roomCode).emit("participants-update", { roomCode, count: participants.length, participants });
}

export function setupExamSocket(io) {
    io.on("connection", (socket) => {
        console.log(`🔌 Kết nối mới: ${socket.id}`);

        // 1. Tham gia phòng thi/khảo sát realtime
        socket.on("join-room", async ({ roomCode, userId, fullName }) => {
            try {
                socket.join(roomCode);
                socket.data.roomCode = roomCode;
                socket.data.userId = userId;

                if (!rooms.has(roomCode)) rooms.set(roomCode, new Map());
                rooms.get(roomCode).set(userId, { socketId: socket.id, userId, fullName, joinedAt: new Date() });

                // Ghi DB room_participants
                await pool.execute(
                    `INSERT INTO room_participants (session_id, user_id) VALUES (?, ?)`,
                    [roomCode, userId]
                ).catch(() => {});

                io.to(roomCode).emit("user-joined", { userId, fullName, message: `${fullName} đã tham gia phòng.` });
                broadcastParticipants(io, roomCode);
            } catch (e) {
                console.error("join-room error:", e.message);
            }
        });

        // 2. Học sinh gửi câu trả lờii realtime (khảo sát trực tiếp)
        socket.on("live-answer", ({ roomCode, userId, fullName, answerData }) => {
            io.to(roomCode).emit("receive-live-answer", { userId, fullName, answerData, at: new Date().toISOString() });
        });

        // 3. Giáo viên phát câu hỏi hiện tại của phòng (điều khiển tiến trình)
        socket.on("teacher:show-question", ({ roomCode, question }) => {
            io.to(roomCode).emit("student:show-question", { question });
        });

        // 4. Giáo viên kết thúc phòng
        socket.on("teacher:close-room", ({ roomCode }) => {
            io.to(roomCode).emit("room-closed", { message: "Giáo viên đã kết thúc phiên này." });
        });

        // 5. Đồng bộ đồng hồ đếm ngược
        socket.on("teacher:sync-timer", ({ roomCode, secondsLeft }) => {
            io.to(roomCode).emit("timer-sync", { secondsLeft });
        });

        // 6. Ngắt kết nối
        socket.on("disconnect", async () => {
            const { roomCode, userId } = socket.data || {};
            if (roomCode && userId && rooms.has(roomCode)) {
                rooms.get(roomCode).delete(userId);
                if (rooms.get(roomCode).size === 0) rooms.delete(roomCode);
                else broadcastParticipants(io, roomCode);

                await pool.execute(
                    `UPDATE room_participants SET left_at = NOW() WHERE session_id = ? AND user_id = ? AND left_at IS NULL`,
                    [roomCode, userId]
                ).catch(() => {});
            }
            console.log(`❌ Ngắt kết nối: ${socket.id}`);
        });
    });
}
