import { useFieldArray, useFormContext } from "react-hook-form";

// multiple: nhiều đáp án đúng | fixed: không thêm/xóa/sửa chữ (Đúng/Sai) | graded=false: khảo sát, không có đáp án đúng
export default function ChoiceFields({ multiple = false, fixed = false, graded = true }) {
  const { register, control, setValue, watch, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const options = watch("options") ?? [];

  const toggle = (i) => {
    if (multiple) setValue(`options.${i}.is_correct`, !options[i]?.is_correct, { shouldValidate: true });
    else options.forEach((_, j) => setValue(`options.${j}.is_correct`, j === i, { shouldValidate: true }));
  };
  const err = errors.options?.message ?? errors.options?.root?.message;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        Các đáp án {graded && <span className="font-normal text-gray-500">(tick vào ô để đánh dấu đáp án đúng)</span>}
      </p>
      {fields.map((f, i) => (
        <div key={f.id} className="flex items-center gap-2">
          {graded && (
            <input type={multiple ? "checkbox" : "radio"} checked={!!options[i]?.is_correct}
              onChange={() => toggle(i)} className="h-4 w-4" aria-label={`Đáp án đúng ${i + 1}`} />
          )}
          <input {...register(`options.${i}.option_text`)} readOnly={fixed}
            placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm read-only:bg-gray-50" />
          {!fixed && fields.length > 2 && (
            <button type="button" onClick={() => remove(i)} className="px-2 text-sm text-red-600">Xóa</button>
          )}
          {errors.options?.[i]?.option_text && (
            <span className="text-xs text-red-600">{errors.options[i].option_text.message}</span>
          )}
        </div>
      ))}
      {!fixed && (
        <button type="button" onClick={() => append({ option_text: "", is_correct: false })}
          className="text-sm font-medium text-indigo-600">+ Thêm đáp án</button>
      )}
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}