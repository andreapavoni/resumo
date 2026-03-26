import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { Editor } from "./components/Editor.js";
import { Preview } from "./components/Preview.js";
import type { Resume, Theme } from "./types.js";

function importJson(setResume: (r: Resume) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const resume = JSON.parse(reader.result as string) as Resume;
        setResume(resume);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportJson(resume: Resume) {
  const blob = new Blob([JSON.stringify(resume, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "resume.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function App() {
  const [resume, setResume] = useState<Resume>({});
  const [theme, setTheme] = useState<Theme>("classic");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  return html`
    <div class="editor-ui flex flex-col min-h-screen bg-white text-gray-900">

      <!-- Header -->
      <header class="no-print border-b-2 border-black bg-white sticky top-0 z-50">
        <div class="px-4 md:px-6 py-3 md:py-0 md:h-16 flex flex-wrap items-center justify-between gap-2">
          <!-- Left: Logo -->
          <a href="/" class="flex items-center gap-2 shrink-0">
            <div class="w-7 h-7 bg-black text-white flex items-center justify-center font-bold text-lg rounded-sm">R</div>
            <span class="font-extrabold text-xl tracking-tight">Resumo</span>
          </a>
          <!-- Right: Mobile toggle (visible only on mobile) -->
          <div class="flex md:hidden gap-1 shrink-0">
            <button
              class="${activeTab === "edit" ? "bg-appaccent text-white border-appaccent font-bold" : ""}"
              onClick=${() => setActiveTab("edit")}>Edit</button>
            <button
              class="${activeTab === "preview" ? "bg-appaccent text-white border-appaccent font-bold" : ""}"
              onClick=${() => setActiveTab("preview")}>Preview</button>
          </div>
          <!-- Right: Toolbar (always visible, wraps on mobile) -->
          <nav class="flex items-center gap-2 order-last md:order-none w-full md:w-auto">
            <select value=${theme} onChange=${(e: Event) => setTheme((e.target as HTMLSelectElement).value as Theme)}>
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
            </select>
            <div class="w-px h-5 bg-black/20 hidden md:block"></div>
            <button onClick=${() => importJson(setResume)}>Import</button>
            <button class="bg-appaccent text-white border-appaccent font-bold hover:opacity-90" onClick=${() => exportJson(resume)}>Export</button>
            <button onClick=${() => window.print()}>Print</button>
          </nav>
        </div>
      </header>

      <!-- Main: split pane -->
      <div class="flex-1 relative">
        <!-- Editor pane -->
        <div class="no-print md:fixed md:left-0 md:top-16 md:w-[45%] md:h-[calc(100vh-7rem)] md:overflow-y-auto md:border-r-2 md:border-black p-4 md:p-6 bg-appbg ${activeTab === "edit" ? "" : "hidden md:block"}">
          <${Editor} resume=${resume} onChange=${setResume} />
        </div>
        <!-- Preview pane -->
        <div class="preview-pane md:ml-[45%] p-4 md:p-8 md:pb-12 ${activeTab === "preview" ? "" : "hidden md:block"}">
          <${Preview} resume=${resume} theme=${theme} />
        </div>
      </div>

      <!-- Footer -->
      <footer class="no-print border-t-2 border-black bg-white h-12 px-6 md:fixed md:bottom-0 md:left-0 md:right-0 md:z-40">
        <div class="h-full flex items-center justify-between gap-4">
          <div class="text-gray-500 text-xs font-medium hidden sm:block">
            ©2026 a <a href="https://pavonz.com" class="text-black hover:underline">pavonz</a> joint - <a href="https://github.com/andreapavoni/resume" class="text-black hover:underline">src</a> - No data about the requests you make is captured or stored.
          </div>
          <a href="/" class="text-xs text-gray-500 hover:text-black transition-colors font-medium shrink-0">← Home</a>
        </div>
      </footer>

    </div>
  `;
}
