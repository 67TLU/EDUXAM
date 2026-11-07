export const FORM_TYPE_LABEL = { exam: "Bài thi", quiz: "Bài kiểm tra", survey: "Khảo sát" };
export const STATUS_LABEL = { draft: "Nháp", published: "Đã xuất bản", archived: "Lưu trữ" };
export const STATUS_STYLE = {
  draft: "bg-amber-100 text-amber-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-gray-200 text-gray-700",
};

// Lấy thông báo lỗi dễ đọc từ phản hồi của backend (kể cả danh sách lỗi 422)
export function errMsg(e) {
  const d = e?.response?.data;
  if (d?.errors?.length) return d.errors.map((x) => (x.field ? `${x.field}: ${x.message}` : x.message)).join(" • ");
  return d?.message || e?.message || "Có lỗi xảy ra";
}