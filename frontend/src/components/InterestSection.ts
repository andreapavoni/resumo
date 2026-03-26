import { html } from "htm/preact";
import { TagInput } from "./TagInput.js";
import type { Interest } from "../types.js";

interface InterestSectionProps {
  interests: Interest[];
  onChange: (interests: Interest[]) => void;
}

function update(interests: Interest[], index: number, patch: Partial<Interest>): Interest[] {
  return interests.map((item, i) => (i === index ? { ...item, ...patch } : item));
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

export function InterestSection({ interests, onChange }: InterestSectionProps) {
  function addEntry() {
    onChange([...interests, {}]);
  }

  function removeEntry(index: number) {
    onChange(interests.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>Interests</legend>
      ${interests.map(
        (interest, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">Interest #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label="Move up" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(interests, i, i - 1))}>↑</button>
                <button type="button" aria-label="Move down" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === interests.length - 1}
                  onClick=${() => onChange(move(interests, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>Remove</button>
              </div>
            </div>
            <label>
              Name
              <input type="text" value=${interest.name ?? ""} placeholder="Philosophy"
                onInput=${(e: Event) => onChange(update(interests, i, { name: val(e) }))} />
            </label>
            <label>
              Keywords
              <${TagInput}
                items=${interest.keywords ?? []}
                placeholder="Add a keyword and press Enter"
                onChange=${(items: string[]) => onChange(update(interests, i, { keywords: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>+ Add Interest</button>
    </fieldset>
  `;
}
