import { html } from "htm/preact";
import { update, val, move, autoResize } from "./utils.js";
import { t } from "../i18n.js";
import type { Reference } from "../types.js";

interface ReferenceSectionProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
}

export function ReferenceSection({ references, onChange }: ReferenceSectionProps) {
  function addEntry() {
    onChange([...references, {}]);
  }

  function removeEntry(index: number) {
    onChange(references.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("references.legend")}</legend>
      ${references.map(
        (ref, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("references.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(references, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === references.length - 1}
                  onClick=${() => onChange(move(references, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <label>
              ${t("references.name")}
              <input type="text" value=${ref.name ?? ""} placeholder=${t("references.ph.name")}
                onInput=${(e: Event) => onChange(update(references, i, { name: val(e) }))} />
            </label>
            <label>
              ${t("references.reference")}
              <textarea rows="2" class="resize-none overflow-hidden" placeholder=${t("references.ph.reference")}
                ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
                onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(update(references, i, { reference: val(e) })); }}
              >${ref.reference ?? ""}</textarea>
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("references.add")}</button>
    </fieldset>
  `;
}
