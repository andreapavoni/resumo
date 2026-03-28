import { html } from "htm/preact";
import { useState, useEffect, useRef } from "preact/hooks";
import { renderResume } from "../api.js";
import type { Resume, Theme } from "../types.js";
import { t } from "../i18n.js";

interface PreviewProps {
  resume: Resume;
  theme: Theme;
  locale: string;
  onLoadDemo: () => void;
}

export function Preview({ resume, theme, locale, onLoadDemo }: PreviewProps) {
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
    return html`
      <div class="text-center mt-16">
        <p class="italic text-gray-400">${t("app.previewPlaceholder")}</p>
        <button type="button"
          class="mt-4 inline-flex items-center gap-2 px-4 py-2 border-2 border-black rounded-sm font-bold hover:bg-gray-100 transition-colors"
          onClick=${onLoadDemo}>
          <i data-lucide="play" class="w-4 h-4"></i>
          ${t("app.loadDemo")}
        </button>
      </div>
    `;
  }

  return html`<div dangerouslySetInnerHTML=${{ __html: previewHtml }}></div>`;
}
