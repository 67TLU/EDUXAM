import ChoiceFields from "../shared/ChoiceFields";
export default function Editor({ graded = true }) {
  return <ChoiceFields multiple={true} fixed={false} graded={graded} />;
}