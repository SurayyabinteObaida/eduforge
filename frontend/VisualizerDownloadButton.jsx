import DownloadButton from "./DownloadButton";
import { downloadVisualizerAsHtml } from "../utils/download";

/**
 * Props:
 *   htmlContent string   — the visualizer HTML returned by AI
 *   lessonTitle string
 *   variant     "primary"|"ghost"
 */
export default function VisualizerDownloadButton({ htmlContent, lessonTitle, variant = "ghost" }) {
  return (
    <DownloadButton
      label="Download Visualizer"
      icon="🎬"
      variant={variant}
      disabled={!htmlContent}
      onDownload={() => downloadVisualizerAsHtml(htmlContent, lessonTitle)}
    />
  );
}
