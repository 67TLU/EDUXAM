import apiClient from "./client";

// Tất cả trả về response.data = { success, message, data }
const get = (url, params) => apiClient.get(url, { params }).then((r) => r.data);
const post = (url, body) => apiClient.post(url, body).then((r) => r.data);
const put = (url, body) => apiClient.put(url, body).then((r) => r.data);
const del = (url) => apiClient.delete(url).then((r) => r.data);

export const listFormsApi = (params) => get("/forms", params);
export const createFormApi = (body) => post("/forms", body);
export const getFormDetailApi = (id) => get(`/forms/${id}`);
export const updateFormApi = (id, body) => put(`/forms/${id}`, body);
export const deleteFormApi = (id) => del(`/forms/${id}`);
export const duplicateFormApi = (id) => post(`/forms/${id}/duplicate`);
export const publishCheckApi = (id) => get(`/forms/${id}/publish-check`);
export const publishFormApi = (id) => post(`/forms/${id}/publish`);

export const addQuestionApi = (id, body) => post(`/forms/${id}/questions`, body);
export const updateQuestionApi = (id, qid, body) => put(`/forms/${id}/questions/${qid}`, body);
export const deleteQuestionApi = (id, qid) => del(`/forms/${id}/questions/${qid}`);
export const duplicateQuestionApi = (id, qid) => post(`/forms/${id}/questions/${qid}/duplicate`);
export const reorderQuestionsApi = (id, ids) => put(`/forms/${id}/questions/reorder`, { ids });