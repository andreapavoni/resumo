import { html } from "htm/preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { renderResume } from "../api.js";
import type { Resume, Theme } from "../types.js";
import { t } from "../i18n.js";

interface PreviewProps {
  resume: Resume;
  theme: Theme;
  locale: string;
}

export function Preview({ resume, theme, locale }: PreviewProps) {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const html = await renderResume(resume, theme, locale, controller.signal);
        setPreviewHtml(html);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Preview render failed:", err);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [resume, theme, locale]);

  if (!previewHtml) {
    return html`<p class="text-center italic text-gray-400 mt-16">${t("app.previewPlaceholder")}</p>`;
  }

  return html`<div dangerouslySetInnerHTML=${{ __html: previewHtml }}></div>`;
}
