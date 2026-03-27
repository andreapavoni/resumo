import { html } from "htm/preact";
import { ListInput } from "./ListInput.js";
import { t } from "../i18n.js";
import type { Volunteer } from "../types.js";

interface VolunteerSectionProps {
  volunteer: Volunteer[];
  onChange: (volunteer: Volunteer[]) => void;
}

function update(volunteer: Volunteer[], index: number, patch: Partial<Volunteer>): Volunteer[] {
  return volunteer.map((v, i) => (i === index ? { ...v, ...patch } : v));
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

export function VolunteerSection({ volunteer, onChange }: VolunteerSectionProps) {
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
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
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
                onInput=${(e: Event) => onChange(update(volunteer, i, { url: val(e) }))} />
            </label>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("volunteer.startDate")}
                <input type="month" value=${v.startDate ?? ""}
                  onChange=${(e: Event) => onChange(update(volunteer, i, { startDate: val(e) }))} />
              </label>
              <div class="flex-1">
                <label>
                  ${t("volunteer.endDate")}
                  <input type="month" value=${v.endDate ?? ""}
                    disabled=${v.endDate === undefined}
                    onChange=${(e: Event) => onChange(update(volunteer, i, { endDate: val(e) }))} />
                </label>
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
