import { useFormContext } from "react-hook-form";
export default function Editor({ graded = true }) {
  const { register, formState: { errors } } = useFormContext();
  if (!graded) return <p className="text-xs text-gray-500">Người tham gia gõ câu trả lời ngắn (khảo sát không có đáp án đúng).</p>;
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Các đáp án được chấp nhận <span className="font-normal text-gray-500">(mỗi dòng 1 đáp án)</span>
      </label>
      <textarea {...register("accepted_text")} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      {errors.accepted_text && <p className="text-xs text-red-600">{errors.accepted_text.message}</p>}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("case_sensitive")} /> Phân biệt chữ hoa/thường
      </label>
    </div>
  );
}