import apiClient from "./client";

// ===== Học sinh =====
export const joinExamApi = (accessCode) =>
  apiClient.post("/exam-sessions/join", { access_code: accessCode }).then((r) => r.data);

export const getExamQuestionsApi = (sessionId) =>
  apiClient.get(`/exam-sessions/${sessionId}/questions`).then((r) => r.data);

export const saveDraftApi = (submissionId, payload) =>
  apiClient.put(`/exam-sessions/submissions/${submissionId}/draft`, payload).then((r) => r.data);

export const getDraftApi = (submissionId) =>
  apiClient.get(`/exam-sessions/submissions/${submissionId}/draft`).then((r) => r.data);

export const submitExamApi = (submissionId, answers) =>
  apiClient.post(`/exam-sessions/submissions/${submissionId}/submit`, { answers }).then((r) => r.data);

export const autoSubmitApi = (submissionId, answers) =>
  apiClient.post(`/exam-sessions/submissions/${submissionId}/auto-submit`, { answers }).then((r) => r.data);

export const logAntiCheatApi = (submissionId, eventType, detail) =>
  apiClient.post(`/exam-sessions/submissions/${submissionId}/anti-cheat`, { event_type: eventType, detail }).then((r) => r.data);

// ===== Giáo viên =====
export const listSessionsApi = (params) =>
  apiClient.get("/exam-sessions", { params }).then((r) => r.data);

export const createSessionApi = (payload) =>
  apiClient.post("/exam-sessions", payload).then((r) => r.data);

export const getSessionApi = (id) =>
  apiClient.get(`/exam-sessions/${id}`).then((r) => r.data);

export const updateSessionStatusApi = (id, status) =>
  apiClient.patch(`/exam-sessions/${id}/status`, { status }).then((r) => r.data);

export const getSessionAnalyticsApi = (id) =>
  apiClient.get(`/exam-sessions/${id}/analytics`).then((r) => r.data);

export const publishGradesApi = (id) =>
  apiClient.post(`/exam-sessions/${id}/publish`).then((r) => r.data);

export const gradeAnswerApi = (answerId, points, feedback) =>
  apiClient.put(`/exam-sessions/answers/${answerId}/grade`, { points, feedback }).then((r) => r.data);

export const getAntiCheatEventsApi = (submissionId) =>
  apiClient.get(`/exam-sessions/submissions/${submissionId}/anti-cheat`).then((r) => r.data);
