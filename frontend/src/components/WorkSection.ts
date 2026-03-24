import { html } from "htm/preact";
import { TagInput } from "./TagInput.js";
import type { Work } from "../types.js";

interface WorkSectionProps {
  work: Work[];
  onChange: (work: Work[]) => void;
}

function update(work: Work[], index: number, patch: Partial<Work>): Work[] {
  return work.map((w, i) => (i === index ? { ...w, ...patch } : w));
}

function val(e: Event): string {
  return (e.target as HTMLInputElement).value;
}

export function WorkSection({ work, onChange }: WorkSectionProps) {
  function addEntry() {
    onChange([...work, {}]);
  }

  function removeEntry(index: number) {
    onChange(work.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>Work Experience</legend>
      ${work.map(
        (job, i) => html`
          <div class="entry-group" key=${i}>
            <div class="entry-header">
              <span class="entry-title">Work #${i + 1}</span>
              <button type="button" onClick=${() => removeEntry(i)}>Remove</button>
            </div>
            <div class="field-row">
              <label>
                Position
                <input type="text" value=${job.position ?? ""} placeholder="Software Engineer"
                  onInput=${(e: Event) => onChange(update(work, i, { position: val(e) }))} />
              </label>
              <label>
                Company
                <input type="text" value=${job.name ?? ""} placeholder="Acme Corp"
                  onInput=${(e: Event) => onChange(update(work, i, { name: val(e) }))} />
              </label>
            </div>
            <label>
              Location
              <input type="text" value=${job.location ?? ""} placeholder="San Francisco, CA"
                onInput=${(e: Event) => onChange(update(work, i, { location: val(e) }))} />
            </label>
            <div class="field-row">
              <label>
                Start Date
                <input type="month" value=${job.startDate ?? ""}
                  onChange=${(e: Event) => onChange(update(work, i, { startDate: val(e) }))} />
              </label>
              <label>
                End Date
                <input type="month" value=${job.endDate ?? ""}
                  onChange=${(e: Event) => onChange(update(work, i, { endDate: val(e) }))} />
              </label>
            </div>
            <label>
              Summary
              <textarea rows="2" placeholder="Brief description of role..."
                onInput=${(e: Event) => onChange(update(work, i, { summary: val(e) }))}
              >${job.summary ?? ""}</textarea>
            </label>
            <label>
              Highlights
              <${TagInput}
                items=${job.highlights ?? []}
                placeholder="Add a bullet point and press Enter"
                onChange=${(items: string[]) => onChange(update(work, i, { highlights: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" onClick=${addEntry}>+ Add Work Experience</button>
    </fieldset>
  `;
}
