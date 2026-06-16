import { useState } from "react";

/**
 * DownloadButton — reusable download trigger with loading + success feedback
 *
 * Props:
 *   onDownload  async () => void   — called on click; throw to show error
 *   label       string             — button text (default "Download")
 *   icon        string             — emoji/text icon prepended to label
 *   variant     "primary" | "ghost"
 *   disabled    bool
 *   className   string
 */
export default function DownloadButton({
  onDownload,
  label = "Download",
  icon = "⬇",
  variant = "primary",
  disabled = false,
  className = "",
}) {
  const [state, setState] = useState("idle"); // idle | loading | success | error

  async function handleClick() {
    if (state === "loading" || disabled) return;
    setState("loading");
    try {
      await onDownload();
      setState("success");
      setTimeout(() => setState("idle"), 2200);
    } catch (err) {
      console.error("Download failed:", err);
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  const labels = {
    idle:    `${icon} ${label}`,
    loading: "Preparing…",
    success: "✓ Downloaded!",
    error:   "✗ Failed — try again",
  };

  const base = `
    download-btn
    download-btn--${variant}
    download-btn--${state}
    ${disabled ? "download-btn--disabled" : ""}
    ${className}
  `.replace(/\s+/g, " ").trim();

  return (
    <>
      <style>{STYLES}</style>
      <button
        className={base}
        onClick={handleClick}
        disabled={disabled || state === "loading"}
        title={label}
      >
        {state === "loading" && <span className="download-btn__spinner" aria-hidden="true" />}
        {labels[state]}
      </button>
    </>
  );
}

const STYLES = `
.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Calibri', 'Segoe UI', sans-serif;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  white-space: nowrap;
  user-select: none;
}

/* Primary variant */
.download-btn--primary {
  background: #6366F1;
  color: #ffffff;
}
.download-btn--primary:hover:not(.download-btn--disabled):not(.download-btn--loading) {
  background: #4F46E5;
  transform: translateY(-1px);
}

/* Ghost variant */
.download-btn--ghost {
  background: transparent;
  color: #818CF8;
  border: 1.5px solid #3730A3;
}
.download-btn--ghost:hover:not(.download-btn--disabled):not(.download-btn--loading) {
  background: #1e1b4b;
  transform: translateY(-1px);
}

/* States */
.download-btn--loading {
  opacity: 0.75;
  cursor: wait;
}
.download-btn--success {
  background: #059669 !important;
  color: #ffffff;
  border-color: #059669;
}
.download-btn--error {
  background: #DC2626 !important;
  color: #ffffff;
  border-color: #DC2626;
}
.download-btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Spinner */
.download-btn__spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;
