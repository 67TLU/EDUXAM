import ChoiceFields from "../shared/ChoiceFields";
export default function Editor({ graded = true }) {
  return <ChoiceFields multiple={false} fixed={true} graded={graded} />;
}