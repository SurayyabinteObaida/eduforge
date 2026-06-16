import DownloadButton from "./DownloadButton";
import { downloadResourcesAsHtml } from "../utils/download";

/**
 * Props:
 *   resources   array    — list of resource objects
 *   lessonTitle string
 *   variant     "primary"|"ghost"
 */
export default function ResourcesDownloadButton({ resources, lessonTitle, variant = "ghost" }) {
  const hasResources = Array.isArray(resources) && resources.length > 0;

  return (
    <DownloadButton
      label="Download Resources"
      icon="📄"
      variant={variant}
      disabled={!hasResources}
      onDownload={() => downloadResourcesAsHtml(resources, lessonTitle)}
    />
  );
}
