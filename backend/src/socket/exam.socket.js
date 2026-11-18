import pool from "../config/database.js";

// roomCode is the numeric exam_sessions.id used by the existing client.
const rooms = new Map();

function broadcastParticipants(io, roomCode) {
    const participants = rooms.has(roomCode)
        ? [...rooms.get(roomCode).values()].map(({ userId, fullName, joinedAt }) => ({ userId, fullName, joinedAt }))
        : [];
    io.to(roomCode).emit("participants-update", {
        roomCode,
        count: participants.length,
        participants,
    });
}

function emitRoomError(socket, message) {
    socket.emit("room-error", { message });
}

function isJoinedRoom(socket, payload) {
    return Boolean(
        socket.data.sessionId &&
        socket.data.roomCode &&
        (!payload?.roomCode || String(payload.roomCode) === socket.data.roomCode)
    );
}

function isTeacher(socket) {
    return socket.data.roomRole === "teacher";
}

function isStudent(socket) {
    return socket.data.roomRole === "student";
}

async function authorizeRoom(socket, requestedRoomCode) {
    const user = socket.data.user;
    const sessionId = Number(requestedRoomCode);
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
        throw new Error("Mã phòng không hợp lệ");
    }

    const [sessions] = await pool.execute(
        `SELECT id, created_by, status, start_time, end_time
         FROM exam_sessions WHERE id = ? LIMIT 1`,
        [sessionId]
    );
    if (!sessions.length) throw new Error("Không tìm thấy phòng");

    const session = sessions[0];
    const roles = user.roles || [];
    const isAdmin = roles.includes("admin");
    const ownsSession = String(session.created_by) === user.userId;
    const mayMonitor = isAdmin || (roles.includes("teacher") && ownsSession);

    if (mayMonitor) return { session, roomRole: "teacher" };

    if (!roles.includes("student")) {
        throw new Error("Bạn không có quyền tham gia phòng này");
    }
    if (session.status !== "active") {
        throw new Error("Phòng thi hiện không hoạt động");
    }
    const now = Date.now();
    if (session.start_time && now < new Date(session.start_time).getTime()) {
        throw new Error("Phòng thi chưa bắt đầu");
    }
    if (session.end_time && now > new Date(session.end_time).getTime()) {
        throw new Error("Phòng thi đã kết thúc");
    }

    // A student can join the socket room only after the authenticated HTTP join
    // flow has created/resumed their in-progress submission.
    const [submissions] = await pool.execute(
        `SELECT id FROM submissions
         WHERE session_id = ? AND user_id = ? AND status = 'in_progress'
         ORDER BY id DESC LIMIT 1`,
        [session.id, user.userId]
    );
    if (!submissions.length) {
        throw new Error("Bạn cần tham gia phòng thi qua mã truy cập trước");
    }

    return { session, roomRole: "student" };
}

export function setupExamSocket(io) {
    io.on("connection", (socket) => {
        const user = socket.data.user;
        console.log(`🔌 Socket đã xác thực: ${socket.id} (user ${user.userId})`);

        socket.on("join-room", async (payload = {}, acknowledge) => {
            const reply = typeof acknowledge === "function" ? acknowledge : () => {};
            try {
                const requestedRoomCode = payload.roomCode;
                const { session, roomRole } = await authorizeRoom(socket, requestedRoomCode);
                const roomCode = String(session.id);

                // A socket belongs to one authorized exam room at a time.
                const oldRoomCode = socket.data.roomCode;
                if (oldRoomCode && oldRoomCode !== roomCode) {
                    socket.leave(oldRoomCode);
                    if (rooms.has(oldRoomCode)) {
                        rooms.get(oldRoomCode).delete(socket.id);
                        if (rooms.get(oldRoomCode).size === 0) rooms.delete(oldRoomCode);
                        else broadcastParticipants(io, oldRoomCode);
                    }
                }

                socket.join(roomCode);
                socket.data.roomCode = roomCode;
                socket.data.sessionId = session.id;
                socket.data.roomRole = roomRole;

                if (roomRole === "student") {
                    if (!rooms.has(roomCode)) rooms.set(roomCode, new Map());
                    rooms.get(roomCode).set(socket.id, {
                        socketId: socket.id,
                        userId: user.userId,
                        fullName: user.fullName,
                        joinedAt: new Date(),
                    });

                    await pool.execute(
                        `INSERT INTO room_participants (session_id, user_id) VALUES (?, ?)`,
                        [roomCode, user.userId]
                    ).catch(() => {});

                    io.to(roomCode).emit("user-joined", {
                        userId: user.userId,
                        fullName: user.fullName,
                        message: `${user.fullName} đã tham gia phòng.`,
                    });
                }

                broadcastParticipants(io, roomCode);
                reply({ ok: true, roomCode, role: roomRole });
            } catch (error) {
                reply({ ok: false, message: error.message || "Không thể tham gia phòng" });
            }
        });

        socket.on("live-answer", (payload = {}) => {
            if (!isStudent(socket) || !isJoinedRoom(socket, payload)) {
                emitRoomError(socket, "Bạn không có quyền gửi câu trả lời vào phòng này");
                return;
            }

            let serialized;
            try {
                serialized = JSON.stringify(payload.answerData ?? null);
            } catch {
                emitRoomError(socket, "Dữ liệu câu trả lời không hợp lệ");
                return;
            }
            if (serialized.length > 10_000) {
                emitRoomError(socket, "Dữ liệu câu trả lời quá lớn");
                return;
            }

            // Identity is always derived from the verified JWT, never the event payload.
            io.to(socket.data.roomCode).emit("receive-live-answer", {
                userId: user.userId,
                fullName: user.fullName,
                answerData: payload.answerData,
                at: new Date().toISOString(),
            });
        });

        socket.on("teacher:show-question", (payload = {}) => {
            if (!isTeacher(socket) || !isJoinedRoom(socket, payload)) {
                emitRoomError(socket, "Chỉ giáo viên phụ trách phòng mới được điều khiển câu hỏi");
                return;
            }
            io.to(socket.data.roomCode).emit("student:show-question", { question: payload.question });
        });

        socket.on("teacher:close-room", (payload = {}) => {
            if (!isTeacher(socket) || !isJoinedRoom(socket, payload)) {
                emitRoomError(socket, "Chỉ giáo viên phụ trách phòng mới được kết thúc phòng");
                return;
            }
            io.to(socket.data.roomCode).emit("room-closed", {
                message: "Giáo viên đã kết thúc phiên này.",
            });
        });

        socket.on("teacher:sync-timer", (payload = {}) => {
            if (!isTeacher(socket) || !isJoinedRoom(socket, payload)) {
                emitRoomError(socket, "Chỉ giáo viên phụ trách phòng mới được đồng bộ đồng hồ");
                return;
            }
            const secondsLeft = Number(payload.secondsLeft);
            if (!Number.isInteger(secondsLeft) || secondsLeft < 0 || secondsLeft > 86400) {
                emitRoomError(socket, "Thời gian đếm ngược không hợp lệ");
                return;
            }
            io.to(socket.data.roomCode).emit("timer-sync", { secondsLeft });
        });

        socket.on("disconnect", async () => {
            const { roomCode, roomRole, sessionId } = socket.data || {};
            if (roomCode && roomRole === "student" && rooms.has(roomCode)) {
                const participants = rooms.get(roomCode);
                const participant = participants.get(socket.id);
                participants.delete(socket.id);
                if (participants.size === 0) rooms.delete(roomCode);
                else broadcastParticipants(io, roomCode);

                if (participant) {
                    await pool.execute(
                        `UPDATE room_participants
                         SET left_at = NOW()
                         WHERE session_id = ? AND user_id = ? AND left_at IS NULL`,
                        [sessionId, user.userId]
                    ).catch(() => {});
                }
            }
            console.log(`❌ Socket ngắt kết nối: ${socket.id}`);
        });
    });
}
