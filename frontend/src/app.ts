import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { Editor } from "./components/Editor.js";
import { Preview } from "./components/Preview.js";
import type { Resume } from "./types.js";

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

  return html`
    <div class="editor-layout no-print">
      <h1 class="app-title">Resumo</h1>
      <div class="toolbar">
        <button onClick=${() => importJson(setResume)}>Import JSON</button>
        <button class="btn-primary" onClick=${() => exportJson(resume)}>Export JSON</button>
        <button onClick=${() => window.print()}>Print / Save PDF</button>
      </div>
      <${Editor} resume=${resume} onChange=${setResume} />
    </div>
    <div class="preview-pane">
      <${Preview} resume=${resume} />
    </div>
  `;
}
