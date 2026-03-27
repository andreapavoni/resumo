import { html } from "htm/preact";
import { TagInput } from "./TagInput.js";
import { t } from "../i18n.js";
import type { Skill } from "../types.js";

interface SkillSectionProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

function update(skills: Skill[], index: number, patch: Partial<Skill>): Skill[] {
  return skills.map((s, i) => (i === index ? { ...s, ...patch } : s));
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

export function SkillSection({ skills, onChange }: SkillSectionProps) {
  function addEntry() {
    onChange([...skills, {}]);
  }

  function removeEntry(index: number) {
    onChange(skills.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("skills.legend")}</legend>
      ${skills.map(
        (skill, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("skills.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(skills, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === skills.length - 1}
                  onClick=${() => onChange(move(skills, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("skills.category")}
                <input type="text" value=${skill.name ?? ""} placeholder=${t("skills.ph.category")}
                  onInput=${(e: Event) => onChange(update(skills, i, { name: val(e) }))} />
              </label>
              <label>
                ${t("skills.level")}
                <input type="text" value=${skill.level ?? ""} placeholder=${t("skills.ph.level")}
                  onInput=${(e: Event) => onChange(update(skills, i, { level: val(e) }))} />
              </label>
            </div>
            <label>
              ${t("skills.keywords")}
              <${TagInput}
                items=${skill.keywords ?? []}
                placeholder=${t("skills.ph.keywords")}
                onChange=${(items: string[]) => onChange(update(skills, i, { keywords: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("skills.add")}</button>
    </fieldset>
  `;
}
