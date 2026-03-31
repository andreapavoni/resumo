import { html } from "htm/preact";
import { ListInput } from "./ListInput.js";
import { update, val, move, autoResize, fieldError } from "./utils.js";
import { t } from "../i18n.js";
import type { Work, ValidationError } from "../types.js";

interface WorkSectionProps {
  work: Work[];
  errors: ValidationError[];
  onChange: (work: Work[]) => void;
}

export function WorkSection({ work, errors, onChange }: WorkSectionProps) {
  function addEntry() {
    onChange([...work, {}]);
  }

  function removeEntry(index: number) {
    onChange(work.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("work.legend")}</legend>
      ${work.map(
        (job, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("work.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(work, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === work.length - 1}
                  onClick=${() => onChange(move(work, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("work.position")}
                <input type="text" value=${job.position ?? ""} placeholder=${t("work.ph.position")}
                  onInput=${(e: Event) => onChange(update(work, i, { position: val(e) }))} />
              </label>
              <label>
                ${t("work.company")}
                <input type="text" value=${job.name ?? ""} placeholder=${t("work.ph.company")}
                  onInput=${(e: Event) => onChange(update(work, i, { name: val(e) }))} />
              </label>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("work.website")}
                <input type="url" value=${job.url ?? ""} placeholder=${t("work.ph.website")}
                  class=${fieldError(errors, `work[${i}].url`) ? "border-red-500" : ""}
                  onInput=${(e: Event) => onChange(update(work, i, { url: val(e) }))} />
                ${fieldError(errors, `work[${i}].url`) && html`<span class="text-red-500 text-xs">${fieldError(errors, `work[${i}].url`)}</span>`}
              </label>
              <label>
                ${t("work.description")}
                <input type="text" value=${job.description ?? ""} placeholder=${t("work.ph.description")}
                  onInput=${(e: Event) => onChange(update(work, i, { description: val(e) }))} />
              </label>
            </div>
            <label>
              ${t("work.location")}
              <input type="text" value=${job.location ?? ""} placeholder=${t("work.ph.location")}
                onInput=${(e: Event) => onChange(update(work, i, { location: val(e) }))} />
            </label>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("work.startDate")}
                <input type="month" value=${job.startDate ?? ""}
                  onChange=${(e: Event) => onChange(update(work, i, { startDate: val(e) }))} />
              </label>
              <div class="flex-1">
                <label>
                  ${t("work.endDate")}
                  <input type="month" value=${job.endDate ?? ""}
                    disabled=${job.endDate === undefined}
                    class=${fieldError(errors, `work[${i}].endDate`) ? "border-red-500" : ""}
                    onChange=${(e: Event) => onChange(update(work, i, { endDate: val(e) }))} />
                </label>
                ${fieldError(errors, `work[${i}].endDate`) && html`<span class="text-red-500 text-xs">${fieldError(errors, `work[${i}].endDate`)}</span>`}
                <label class="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked=${job.endDate === undefined}
                    onChange=${(e: Event) => {
                      const current = (e.target as HTMLInputElement).checked;
                      onChange(update(work, i, { endDate: current ? undefined : "" }));
                    }} />
                  ${t("work.current")}
                </label>
              </div>
            </div>
            <label>
              ${t("work.summary")}
              <textarea rows="1" class="resize-none overflow-hidden" placeholder=${t("work.ph.summary")}
                ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
                onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(update(work, i, { summary: val(e) })); }}
              >${job.summary ?? ""}</textarea>
            </label>
            <label>
              ${t("work.highlights")}
              <${ListInput}
                items=${job.highlights ?? []}
                onChange=${(items: string[]) => onChange(update(work, i, { highlights: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("work.add")}</button>
    </fieldset>
  `;
}
