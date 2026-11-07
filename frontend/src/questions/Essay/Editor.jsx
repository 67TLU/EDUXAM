import { useFormContext } from "react-hook-form";
export default function Editor() {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Số từ tối đa <span className="font-normal text-gray-500">(0 = không giới hạn)</span></label>
      <input type="number" min={0} {...register("max_words")} className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      {errors.max_words && <p className="text-xs text-red-600">{errors.max_words.message}</p>}
      <p className="text-xs text-gray-500">Bài tự luận do giáo viên chấm thủ công.</p>
    </div>
  );
}