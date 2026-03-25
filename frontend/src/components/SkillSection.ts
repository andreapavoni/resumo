import { html } from "htm/preact";
import { TagInput } from "./TagInput.js";
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
      <legend>Skills</legend>
      ${skills.map(
        (skill, i) => html`
          <div class="entry-group" key=${i}>
            <div class="entry-header">
              <span class="entry-title">Skill Group #${i + 1}</span>
              <div class="entry-controls">
                <button type="button" class="btn-icon" disabled=${i === 0}
                  onClick=${() => onChange(move(skills, i, i - 1))}>↑</button>
                <button type="button" class="btn-icon" disabled=${i === skills.length - 1}
                  onClick=${() => onChange(move(skills, i, i + 1))}>↓</button>
                <button type="button" onClick=${() => removeEntry(i)}>Remove</button>
              </div>
            </div>
            <div class="field-row">
              <label>
                Category
                <input type="text" value=${skill.name ?? ""} placeholder="Programming Languages"
                  onInput=${(e: Event) => onChange(update(skills, i, { name: val(e) }))} />
              </label>
              <label>
                Level
                <input type="text" value=${skill.level ?? ""} placeholder="Advanced"
                  onInput=${(e: Event) => onChange(update(skills, i, { level: val(e) }))} />
              </label>
            </div>
            <label>
              Keywords
              <${TagInput}
                items=${skill.keywords ?? []}
                placeholder="Add a keyword and press Enter"
                onChange=${(items: string[]) => onChange(update(skills, i, { keywords: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" onClick=${addEntry}>+ Add Skill Group</button>
    </fieldset>
  `;
}
