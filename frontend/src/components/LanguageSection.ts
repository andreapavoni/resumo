import { html } from "htm/preact";
import { update, val, move } from "./utils.js";
import { t } from "../i18n.js";
import type { Language } from "../types.js";

interface LanguageSectionProps {
  languages: Language[];
  onChange: (languages: Language[]) => void;
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
      <legend>${t("languages.legend")}</legend>
      ${languages.map(
        (lang, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("languages.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(languages, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === languages.length - 1}
                  onClick=${() => onChange(move(languages, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("languages.language")}
                <input type="text" value=${lang.language ?? ""} placeholder=${t("languages.ph.language")}
                  onInput=${(e: Event) => onChange(update(languages, i, { language: val(e) }))} />
              </label>
              <label>
                ${t("languages.fluency")}
                <input type="text" value=${lang.fluency ?? ""} placeholder=${t("languages.ph.fluency")}
                  onInput=${(e: Event) => onChange(update(languages, i, { fluency: val(e) }))} />
              </label>
            </div>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("languages.add")}</button>
    </fieldset>
  `;
}
