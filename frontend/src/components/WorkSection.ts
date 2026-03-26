import { html } from "htm/preact";
import { ListInput } from "./ListInput.js";
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
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <span class="font-bold text-xs uppercase tracking-wide">Work #${i + 1}</span>
              <div class="flex gap-1 items-center">
                <button type="button" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(work, i, i - 1))}>↑</button>
                <button type="button" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === work.length - 1}
                  onClick=${() => onChange(move(work, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>Remove</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
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
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                Start Date
                <input type="month" value=${job.startDate ?? ""}
                  onChange=${(e: Event) => onChange(update(work, i, { startDate: val(e) }))} />
              </label>
              <div class="flex-1">
                <label>
                  End Date
                  <input type="month" value=${job.endDate ?? ""}
                    disabled=${job.endDate === undefined}
                    onChange=${(e: Event) => onChange(update(work, i, { endDate: val(e) }))} />
                </label>
                <label class="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked=${job.endDate === undefined}
                    onChange=${(e: Event) => {
                      const current = (e.target as HTMLInputElement).checked;
                      onChange(update(work, i, { endDate: current ? undefined : "" }));
                    }} />
                  Current position
                </label>
              </div>
            </div>
            <label>
              Summary
              <textarea rows="1" class="resize-none overflow-hidden" placeholder="Brief description of role..."
                ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
                onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(update(work, i, { summary: val(e) })); }}
              >${job.summary ?? ""}</textarea>
            </label>
            <label>
              Highlights
              <${ListInput}
                items=${job.highlights ?? []}
                onChange=${(items: string[]) => onChange(update(work, i, { highlights: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>+ Add Work Experience</button>
    </fieldset>
  `;
}
