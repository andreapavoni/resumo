import { html } from "htm/preact";
import { ListInput } from "./ListInput.js";
import { update, val, move, autoResize, fieldError, hasItemErrors } from "./utils.js";
import { t } from "../i18n.js";
import type { Volunteer, ValidationError } from "../types.js";

interface VolunteerSectionProps {
  volunteer: Volunteer[];
  errors: ValidationError[];
  onChange: (volunteer: Volunteer[]) => void;
}

export function VolunteerSection({ volunteer, errors, onChange }: VolunteerSectionProps) {
  function addEntry() {
    onChange([...volunteer, {}]);
  }

  function removeEntry(index: number) {
    onChange(volunteer.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("volunteer.legend")}</legend>
      ${volunteer.map(
        (v, i) => html`
          <div class=${"border-2 rounded-sm p-3 mb-3 " + (hasItemErrors(errors, `volunteer[${i}]`) ? "border-red-400 bg-red-50" : "border-black/60 bg-appbg")} key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("volunteer.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(volunteer, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === volunteer.length - 1}
                  onClick=${() => onChange(move(volunteer, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("volunteer.organization")}
                <input type="text" value=${v.organization ?? ""} placeholder=${t("volunteer.ph.organization")}
                  onInput=${(e: Event) => onChange(update(volunteer, i, { organization: val(e) }))} />
              </label>
              <label>
                ${t("volunteer.position")}
                <input type="text" value=${v.position ?? ""} placeholder=${t("volunteer.ph.position")}
                  onInput=${(e: Event) => onChange(update(volunteer, i, { position: val(e) }))} />
              </label>
            </div>
            <label>
              ${t("volunteer.website")}
              <input type="url" value=${v.url ?? ""} placeholder=${t("volunteer.ph.website")}
                class=${fieldError(errors, `volunteer[${i}].url`) ? "border-red-500" : ""}
                onInput=${(e: Event) => onChange(update(volunteer, i, { url: val(e) }))} />
              ${fieldError(errors, `volunteer[${i}].url`) && html`<span class="text-red-500 text-xs">${fieldError(errors, `volunteer[${i}].url`)}</span>`}
            </label>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("volunteer.startDate")}
                <input type="month" value=${v.startDate ?? ""}
                  class=${fieldError(errors, `volunteer[${i}].startDate`) ? "border-red-500" : ""}
                  onChange=${(e: Event) => onChange(update(volunteer, i, { startDate: val(e) }))} />
                ${fieldError(errors, `volunteer[${i}].startDate`) && html`<span class="text-red-500 text-xs">${fieldError(errors, `volunteer[${i}].startDate`)}</span>`}
              </label>
              <div class="flex-1">
                <label>
                  ${t("volunteer.endDate")}
                  <input type="month" value=${v.endDate ?? ""}
                    disabled=${v.endDate === undefined}
                    class=${fieldError(errors, `volunteer[${i}].endDate`) ? "border-red-500" : ""}
                    onChange=${(e: Event) => onChange(update(volunteer, i, { endDate: val(e) }))} />
                </label>
                ${fieldError(errors, `volunteer[${i}].endDate`) && html`<span class="text-red-500 text-xs">${fieldError(errors, `volunteer[${i}].endDate`)}</span>`}
                <label class="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked=${v.endDate === undefined}
                    onChange=${(e: Event) => {
                      const current = (e.target as HTMLInputElement).checked;
                      onChange(update(volunteer, i, { endDate: current ? undefined : "" }));
                    }} />
                  ${t("volunteer.current")}
                </label>
              </div>
            </div>
            <label>
              ${t("volunteer.summary")}
              <textarea rows="1" class="resize-none overflow-hidden" placeholder=${t("volunteer.ph.summary")}
                ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
                onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(update(volunteer, i, { summary: val(e) })); }}
              >${v.summary ?? ""}</textarea>
            </label>
            <label>
              ${t("volunteer.highlights")}
              <${ListInput}
                items=${v.highlights ?? []}
                onChange=${(items: string[]) => onChange(update(volunteer, i, { highlights: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("volunteer.add")}</button>
    </fieldset>
  `;
}
