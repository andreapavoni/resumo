import { html } from "htm/preact";
import type { Reference } from "../types.js";

interface ReferenceSectionProps {
  references: Reference[];
  onChange: (references: Reference[]) => void;
}

function update(references: Reference[], index: number, patch: Partial<Reference>): Reference[] {
  return references.map((r, i) => (i === index ? { ...r, ...patch } : r));
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

export function ReferenceSection({ references, onChange }: ReferenceSectionProps) {
  function addEntry() {
    onChange([...references, {}]);
  }

  function removeEntry(index: number) {
    onChange(references.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>References</legend>
      ${references.map(
        (ref, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">Reference #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label="Move up" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(references, i, i - 1))}>↑</button>
                <button type="button" aria-label="Move down" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === references.length - 1}
                  onClick=${() => onChange(move(references, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>Remove</button>
              </div>
            </div>
            <label>
              Name
              <input type="text" value=${ref.name ?? ""} placeholder="Timothy Cook"
                onInput=${(e: Event) => onChange(update(references, i, { name: val(e) }))} />
            </label>
            <label>
              Reference
              <textarea rows="2" class="resize-none overflow-hidden" placeholder="What they said about you..."
                ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
                onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(update(references, i, { reference: val(e) })); }}
              >${ref.reference ?? ""}</textarea>
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>+ Add Reference</button>
    </fieldset>
  `;
}
