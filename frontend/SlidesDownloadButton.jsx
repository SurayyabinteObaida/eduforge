import DownloadButton from "./DownloadButton";
import { downloadSlidesAsPptx } from "../utils/download";

/**
 * Drop this button anywhere you have the slides JSON and lesson title.
 *
 * Props:
 *   slides      array | object   — AI-generated slides data
 *   lessonTitle string           — used as file name + pptx title
 *   variant     "primary"|"ghost"
 */
export default function SlidesDownloadButton({ slides, lessonTitle, variant = "primary" }) {
  const hasSlides = Array.isArray(slides)
    ? slides.length > 0
    : !!(slides?.slides?.length);

  return (
    <DownloadButton
      label="Download PPTX"
      icon="📥"
      variant={variant}
      disabled={!hasSlides}
      onDownload={() => downloadSlidesAsPptx(slides, lessonTitle)}
    />
  );
}
