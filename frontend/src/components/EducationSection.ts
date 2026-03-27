import { html } from "htm/preact";
import { ListInput } from "./ListInput.js";
import { t } from "../i18n.js";
import type { Education } from "../types.js";

interface EducationSectionProps {
  education: Education[];
  onChange: (education: Education[]) => void;
}

function update(edu: Education[], index: number, patch: Partial<Education>): Education[] {
  return edu.map((e, i) => (i === index ? { ...e, ...patch } : e));
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

export function EducationSection({ education, onChange }: EducationSectionProps) {
  function addEntry() {
    onChange([...education, {}]);
  }

  function removeEntry(index: number) {
    onChange(education.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("education.legend")}</legend>
      ${education.map(
        (edu, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("education.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(education, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === education.length - 1}
                  onClick=${() => onChange(move(education, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("education.institution")}
                <input type="text" value=${edu.institution ?? ""} placeholder=${t("education.ph.institution")}
                  onInput=${(e: Event) => onChange(update(education, i, { institution: val(e) }))} />
              </label>
              <label>
                ${t("education.website")}
                <input type="url" value=${edu.url ?? ""} placeholder=${t("education.ph.website")}
                  onInput=${(e: Event) => onChange(update(education, i, { url: val(e) }))} />
              </label>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("education.degree")}
                <input type="text" value=${edu.studyType ?? ""} placeholder=${t("education.ph.degree")}
                  onInput=${(e: Event) => onChange(update(education, i, { studyType: val(e) }))} />
              </label>
              <label>
                ${t("education.fieldOfStudy")}
                <input type="text" value=${edu.area ?? ""} placeholder=${t("education.ph.fieldOfStudy")}
                  onInput=${(e: Event) => onChange(update(education, i, { area: val(e) }))} />
              </label>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("education.startDate")}
                <input type="month" value=${edu.startDate ?? ""}
                  onChange=${(e: Event) => onChange(update(education, i, { startDate: val(e) }))} />
              </label>
              <div class="flex-1">
                <label>
                  ${t("education.endDate")}
                  <input type="month" value=${edu.endDate ?? ""}
                    disabled=${edu.endDate === undefined}
                    onChange=${(e: Event) => onChange(update(education, i, { endDate: val(e) }))} />
                </label>
                <label class="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked=${edu.endDate === undefined}
                    onChange=${(e: Event) => {
                      const current = (e.target as HTMLInputElement).checked;
                      onChange(update(education, i, { endDate: current ? undefined : "" }));
                    }} />
                  ${t("education.current")}
                </label>
              </div>
            </div>
            <label>
              ${t("education.score")}
              <input type="text" value=${edu.score ?? ""} placeholder="3.8"
                onInput=${(e: Event) => onChange(update(education, i, { score: val(e) }))} />
            </label>
            <label>
              ${t("education.courses")}
              <${ListInput}
                items=${edu.courses ?? []}
                placeholder=${t("education.ph.courses")}
                onChange=${(items: string[]) => onChange(update(education, i, { courses: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("education.add")}</button>
    </fieldset>
  `;
}
