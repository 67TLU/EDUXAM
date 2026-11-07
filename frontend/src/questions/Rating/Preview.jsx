import PreviewFrame from "../shared/PreviewFrame";
import Renderer from "./Renderer";
export default function Preview(props) {
  return <PreviewFrame {...props} Renderer={Renderer} />;
}
