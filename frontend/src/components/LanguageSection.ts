import { html } from "htm/preact";
import type { Language } from "../types.js";

interface LanguageSectionProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
}

function update(languages: Language[], index: number, patch: Partial<Language>): Language[] {
  return languages.map((l, i) => (i === index ? { ...l, ...patch } : l));
}

function val(e: Event): string {
  return (e.target as HTMLInputElement).value;
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export function LanguageSection({ languages, onChange }: LanguageSectionProps) {
  function addEntry() {
    onChange([...languages, {}]);
  }

  function removeEntry(index: number) {
    onChange(languages.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>Languages</legend>
      ${languages.map(
        (lang, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">Language #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label="Move up" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(languages, i, i - 1))}>↑</button>
                <button type="button" aria-label="Move down" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === languages.length - 1}
                  onClick=${() => onChange(move(languages, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>Remove</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                Language
                <input type="text" value=${lang.language ?? ""} placeholder="English"
                  onInput=${(e: Event) => onChange(update(languages, i, { language: val(e) }))} />
              </label>
              <label>
                Fluency
                <input type="text" value=${lang.fluency ?? ""} placeholder="Native, Fluent, Beginner"
                  onInput=${(e: Event) => onChange(update(languages, i, { fluency: val(e) }))} />
              </label>
            </div>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>+ Add Language</button>
    </fieldset>
  `;
}
