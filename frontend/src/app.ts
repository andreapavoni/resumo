import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";
import { Editor } from "./components/Editor.js";
import { Preview } from "./components/Preview.js";
import type { Resume, Theme } from "./types.js";

const STORAGE_KEY = "resumo:resume";
const THEME_KEY = "resumo:theme";

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

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

declare const lucide: any;

export function App() {
  const [resume, setResume] = useState<Resume>(() => loadState(STORAGE_KEY, {}));
  const [theme, setTheme] = useState<Theme>(() => loadState(THEME_KEY, "classic"));
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
      localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    }, 400);
    return () => clearTimeout(timer);
  }, [resume, theme]);

  return html`
    <div class="editor-ui flex flex-col min-h-screen bg-white text-gray-900">

      <!-- Header -->
      <header class="no-print border-b-2 border-black bg-white sticky top-0 z-50">
        <div class="px-4 md:px-6 h-16 flex items-center justify-between gap-2">
          <!-- Left: Logo -->
          <a href="/" class="flex items-center gap-2 shrink-0">
            <div class="w-7 h-7 bg-black text-white flex items-center justify-center font-bold text-lg rounded-sm">R</div>
            <span class="font-extrabold text-xl tracking-tight hidden sm:inline">Resumo</span>
          </a>

          <!-- Center: Mobile toggle (visible only on mobile) -->
          <div class="flex md:hidden bg-gray-100 p-1 rounded-sm border border-black/10 shrink-0">
            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-sm transition-colors ${activeTab === "edit" ? "bg-white shadow-sm font-bold text-appaccent" : "text-gray-500 border-none bg-transparent hover:bg-black/5"}"
              onClick=${() => setActiveTab("edit")}
              aria-label="Edit Mode"
            >
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button
              class="flex items-center gap-1.5 px-3 py-1 rounded-sm transition-colors ${activeTab === "preview" ? "bg-white shadow-sm font-bold text-appaccent" : "text-gray-500 border-none bg-transparent hover:bg-black/5"}"
              onClick=${() => setActiveTab("preview")}
              aria-label="Preview Mode"
            >
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Right: Toolbar -->
          <nav class="flex items-center gap-1.5 md:gap-3">
            <div class="relative flex items-center group">
               <i data-lucide="palette" class="w-4 h-4 absolute left-2 text-gray-400 pointer-events-none"></i>
               <select
                 aria-label="Resume theme"
                 value=${theme}
                 onChange=${(e: Event) => setTheme((e.target as HTMLSelectElement).value as Theme)}
                 class="pl-7 pr-2 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-black rounded-sm bg-white cursor-pointer hover:bg-gray-50"
               >
                 <option value="classic">Classic</option>
                 <option value="modern">Modern</option>
               </select>
            </div>

            <div class="w-px h-6 bg-black/10 hidden md:block mx-1"></div>

            <button
              class="flex items-center gap-2 hover:text-appaccent transition-colors"
              onClick=${() => importJson(setResume)}
              title="Import JSON"
              aria-label="Import JSON"
            >
              <i data-lucide="file-up" class="w-4 h-4"></i>
              <span class="hidden lg:inline">Import</span>
            </button>

            <button
              class="flex items-center gap-2 bg-appaccent text-white border-appaccent font-bold hover:opacity-90 transition-opacity"
              onClick=${() => exportJson(resume)}
              title="Export JSON"
              aria-label="Export JSON"
            >
              <i data-lucide="file-down" class="w-4 h-4"></i>
              <span class="hidden lg:inline">Export</span>
            </button>

            <button
              class="flex items-center gap-2 hover:text-appaccent transition-colors"
              onClick=${() => window.print()}
              title="Print to PDF"
              aria-label="Print to PDF"
            >
              <i data-lucide="printer" class="w-4 h-4"></i>
              <span class="hidden lg:inline">Print</span>
            </button>

            <div class="w-px h-6 bg-black/10 hidden md:block mx-1"></div>

            <button
              class="flex items-center gap-2 hover:text-appaccent transition-colors"
              onClick=${() => {
                if (!confirm("Reset all resume data? This cannot be undone.")) return;
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(THEME_KEY);
                setResume({});
                setTheme("classic");
              }}
              title="Reset resume data"
              aria-label="Reset resume data"
            >
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span class="hidden lg:inline">Reset</span>
            </button>
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
        <div class="h-full grid grid-cols-3 items-center">
          <div></div>
          <div class="text-gray-500 text-xs font-medium text-center  sm:block">
            ©2026 a <a href="https://pavonz.com" class="text-black hover:underline">pavonz</a> joint - <a href="https://github.com/andreapavoni/resumo" class="text-black hover:underline">src</a> - No data about the requests is captured or stored.
          </div>
          <div class="flex justify-end">
            <a href="/" class="text-xs text-gray-500 hover:text-black transition-colors font-medium shrink-0">← Home</a>
          </div>
        </div>
      </footer>

    </div>
  `;
}
