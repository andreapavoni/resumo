import { html } from "htm/preact";
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

export function EducationSection({ education, onChange }: EducationSectionProps) {
  function addEntry() {
    onChange([...education, {}]);
  }

  function removeEntry(index: number) {
    onChange(education.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>Education</legend>
      ${education.map(
        (edu, i) => html`
          <div class="entry-group" key=${i}>
            <div class="entry-header">
              <span class="entry-title">Education #${i + 1}</span>
              <button type="button" onClick=${() => removeEntry(i)}>Remove</button>
            </div>
            <label>
              Institution
              <input type="text" value=${edu.institution ?? ""} placeholder="University of Example"
                onInput=${(e: Event) => onChange(update(education, i, { institution: val(e) }))} />
            </label>
            <div class="field-row">
              <label>
                Degree
                <input type="text" value=${edu.studyType ?? ""} placeholder="B.Sc., M.Sc., Ph.D."
                  onInput=${(e: Event) => onChange(update(education, i, { studyType: val(e) }))} />
              </label>
              <label>
                Field of Study
                <input type="text" value=${edu.area ?? ""} placeholder="Computer Science"
                  onInput=${(e: Event) => onChange(update(education, i, { area: val(e) }))} />
              </label>
            </div>
            <div class="field-row">
              <label>
                Start Date
                <input type="month" value=${edu.startDate ?? ""}
                  onChange=${(e: Event) => onChange(update(education, i, { startDate: val(e) }))} />
              </label>
              <div class="date-field">
                <label>
                  End Date
                  <input type="month" value=${edu.endDate ?? ""}
                    disabled=${edu.endDate === undefined}
                    onChange=${(e: Event) => onChange(update(education, i, { endDate: val(e) }))} />
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" checked=${edu.endDate === undefined}
                    onChange=${(e: Event) => {
                      const current = (e.target as HTMLInputElement).checked;
                      onChange(update(education, i, { endDate: current ? undefined : "" }));
                    }} />
                  Current
                </label>
              </div>
            </div>
            <label>
              GPA / Score
              <input type="text" value=${edu.score ?? ""} placeholder="3.8"
                onInput=${(e: Event) => onChange(update(education, i, { score: val(e) }))} />
            </label>
          </div>
        `
      )}
      <button type="button" onClick=${addEntry}>+ Add Education</button>
    </fieldset>
  `;
}
