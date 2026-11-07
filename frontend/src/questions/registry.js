import SingleEditor from "./SingleChoice/Editor";     import SinglePreview from "./SingleChoice/Preview";     import SingleRenderer from "./SingleChoice/Renderer";
import MultiEditor from "./MultipleChoice/Editor";    import MultiPreview from "./MultipleChoice/Preview";    import MultiRenderer from "./MultipleChoice/Renderer";
import TFEditor from "./TrueFalse/Editor";            import TFPreview from "./TrueFalse/Preview";            import TFRenderer from "./TrueFalse/Renderer";
import ShortEditor from "./ShortAnswer/Editor";       import ShortPreview from "./ShortAnswer/Preview";       import ShortRenderer from "./ShortAnswer/Renderer";
import EssayEditor from "./Essay/Editor";             import EssayPreview from "./Essay/Preview";             import EssayRenderer from "./Essay/Renderer";
import FillBlankEditor from "./FillBlank/Editor";     import FillBlankPreview from "./FillBlank/Preview";     import FillBlankRenderer from "./FillBlank/Renderer";
import OrderingEditor from "./Ordering/Editor";       import OrderingPreview from "./Ordering/Preview";       import OrderingRenderer from "./Ordering/Renderer";
import MatchingEditor from "./Matching/Editor";       import MatchingPreview from "./Matching/Preview";       import MatchingRenderer from "./Matching/Renderer";
import RatingEditor from "./Rating/Editor";           import RatingPreview from "./Rating/Preview";           import RatingRenderer from "./Rating/Renderer";

// Thêm loại câu hỏi mới = tạo thư mục (Editor/Preview/Renderer) + thêm 1 mục ở đây
// Key trùng với enum question_type trong DB.
export const QUESTION_TYPES = {
  multiple_choice: { label: "Trắc nghiệm 1 đáp án", hint: "Chọn đúng 1 đáp án", Editor: SingleEditor, Preview: SinglePreview, Renderer: SingleRenderer },
  multiple_select: { label: "Trắc nghiệm nhiều đáp án", hint: "Chọn nhiều đáp án đúng", Editor: MultiEditor, Preview: MultiPreview, Renderer: MultiRenderer },
  true_false:      { label: "Đúng / Sai", hint: "Câu khẳng định đúng hoặc sai", Editor: TFEditor, Preview: TFPreview, Renderer: TFRenderer },
  short_answer:    { label: "Trả lời ngắn", hint: "Học sinh gõ 1 từ/cụm từ", Editor: ShortEditor, Preview: ShortPreview, Renderer: ShortRenderer },
  long_answer:     { label: "Tự luận", hint: "Bài viết dài, giáo viên chấm tay", Editor: EssayEditor, Preview: EssayPreview, Renderer: EssayRenderer },
  fill_blank:      { label: "Điền vào chỗ trống", hint: "Nhập đáp án cho từng chỗ ____", Editor: FillBlankEditor, Preview: FillBlankPreview, Renderer: FillBlankRenderer },
  ordering:        { label: "Sắp xếp thứ tự", hint: "Sắp xếp lại các phần tử đúng logic", Editor: OrderingEditor, Preview: OrderingPreview, Renderer: OrderingRenderer },
  matching:        { label: "Kéo thả ghép đôi", hint: "Nối mỗi mục trái với đúng mục phải", Editor: MatchingEditor, Preview: MatchingPreview, Renderer: MatchingRenderer },
  rating:          { label: "Đánh giá (sao)", hint: "Chọn mức trên thang sao — dùng cho khảo sát", Editor: RatingEditor, Preview: RatingPreview, Renderer: RatingRenderer },
};

export const QUESTION_TYPE_LIST = Object.entries(QUESTION_TYPES).map(([type, m]) => ({ type, ...m }));

// Câu trả lời của học sinh -> định dạng backend nhận (POST /exam-sessions/submissions/:id/submit)
export function toSubmitAnswer(question, value) {
  if (!value) return null;
  if (["short_answer", "long_answer"].includes(question.question_type))
    return { question_id: question.id, answer_text: value.text ?? "" };
  return { question_id: question.id, answer_json: value };
}
