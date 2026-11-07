import { QUESTION_TYPES } from "./registry";
export default function QuestionPreview({ question, index }) {
  const meta = QUESTION_TYPES[question.question_type];
  if (!meta) return <p className="text-sm text-red-600">Loại câu hỏi chưa hỗ trợ: {question.question_type}</p>;
  const { Preview } = meta;
  return <Preview question={question} index={index} />;
}