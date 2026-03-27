import { html } from "htm/preact";
import { t } from "../i18n.js";
import type { Award } from "../types.js";

interface AwardSectionProps {
  awards: Award[];
  onChange: (awards: Award[]) => void;
}

function update(awards: Award[], index: number, patch: Partial<Award>): Award[] {
  return awards.map((a, i) => (i === index ? { ...a, ...patch } : a));
}

function val(e: Event): string {
  return (e.target as HTMLInputElement).value;
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

function move<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export function AwardSection({ awards, onChange }: AwardSectionProps) {
  function addEntry() {
    onChange([...awards, {}]);
  }

  function removeEntry(index: number) {
    onChange(awards.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("awards.legend")}</legend>
      ${awards.map(
        (award, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("awards.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(awards, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === awards.length - 1}
                  onClick=${() => onChange(move(awards, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("awards.title")}
                <input type="text" value=${award.title ?? ""} placeholder=${t("awards.ph.title")}
                  onInput=${(e: Event) => onChange(update(awards, i, { title: val(e) }))} />
              </label>
              <label>
                ${t("awards.awarder")}
                <input type="text" value=${award.awarder ?? ""} placeholder=${t("awards.ph.awarder")}
                  onInput=${(e: Event) => onChange(update(awards, i, { awarder: val(e) }))} />
              </label>
              <label>
                ${t("awards.date")}
                <input type="month" value=${award.date ?? ""}
                  onChange=${(e: Event) => onChange(update(awards, i, { date: val(e) }))} />
              </label>
            </div>
            <label>
              ${t("awards.summary")}
              <textarea rows="1" class="resize-none overflow-hidden" placeholder=${t("awards.ph.summary")}
                ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
                onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(update(awards, i, { summary: val(e) })); }}
              >${award.summary ?? ""}</textarea>
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("awards.add")}</button>
    </fieldset>
  `;
}
