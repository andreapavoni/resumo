import { html } from "htm/preact";
import { TagInput } from "./TagInput.js";
import { update, val, move } from "./utils.js";
import { t } from "../i18n.js";
import type { Interest } from "../types.js";

interface InterestSectionProps {
  interests: Interest[];
  onChange: (interests: Interest[]) => void;
}

export function InterestSection({ interests, onChange }: InterestSectionProps) {
  function addEntry() {
    onChange([...interests, {}]);
  }

  function removeEntry(index: number) {
    onChange(interests.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("interests.legend")}</legend>
      ${interests.map(
        (interest, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("interests.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(interests, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === interests.length - 1}
                  onClick=${() => onChange(move(interests, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <label>
              ${t("interests.name")}
              <input type="text" value=${interest.name ?? ""} placeholder=${t("interests.ph.name")}
                onInput=${(e: Event) => onChange(update(interests, i, { name: val(e) }))} />
            </label>
            <label>
              ${t("interests.keywords")}
              <${TagInput}
                items=${interest.keywords ?? []}
                placeholder=${t("interests.ph.keywords")}
                onChange=${(items: string[]) => onChange(update(interests, i, { keywords: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("interests.add")}</button>
    </fieldset>
  `;
}
