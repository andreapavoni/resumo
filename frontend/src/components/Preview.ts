import { html } from "htm/preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { renderResume } from "../api.js";
import type { Resume } from "../types.js";

interface PreviewProps {
  resume: Resume;
}

export function Preview({ resume }: PreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const html = await renderResume(resume, controller.signal);
        setPreviewHtml(html);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Preview render failed:", err);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [resume]);

  if (!previewHtml) {
    return html`<p class="placeholder">Your resume preview will appear here as you type...</p>`;
  }

  return html`<div dangerouslySetInnerHTML=${{ __html: previewHtml }}></div>`;
}
