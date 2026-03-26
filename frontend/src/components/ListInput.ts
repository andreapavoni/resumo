import { html } from "htm/preact";
import { useRef, useState } from "preact/hooks";

interface ListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

function move(arr: string[], from: number, to: number): string[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

export function ListInput({ items, onChange, placeholder }: ListInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function addItem() {
    const input = inputRef.current;
    if (!input) return;
    const value = input.value.trim();
    if (value) {
      onChange([...items, value]);
      input.value = "";
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  function saveEdit(index: number, value: string) {
    const trimmed = value.trim();
    if (trimmed) {
      onChange(items.map((item, i) => (i === index ? trimmed : item)));
    } else {
      onChange(items.filter((_, i) => i !== index));
    }
    setEditingIndex(null);
  }

  function handleEditKeyDown(e: KeyboardEvent, index: number) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(index, (e.target as HTMLInputElement).value);
    } else if (e.key === "Escape") {
      setEditingIndex(null);
    }
  }

  return html`
    <div class="mt-0.5 border border-gray-200 rounded bg-white overflow-hidden">
      ${items.map(
        (item, i) => html`
          <div class="flex items-baseline gap-1.5 px-2 py-1.5 border-b border-gray-200 text-sm" key=${i}>
            <span class="text-gray-400 shrink-0">\u2022</span>
            ${editingIndex === i
              ? html`<input
                  type="text"
                  class="flex-1 border border-appblue rounded px-0.5 py-0.5 text-sm outline-none w-auto mt-0"
                  value=${item}
                  onKeyDown=${(e: KeyboardEvent) => handleEditKeyDown(e, i)}
                  onBlur=${(e: FocusEvent) => saveEdit(i, (e.target as HTMLInputElement).value)}
                  ref=${(el: HTMLInputElement | null) => el?.focus()}
                />`
              : html`<span class="flex-1 cursor-text px-0.5 py-0.5 rounded-sm hover:bg-black/5" onClick=${() => setEditingIndex(i)}>${item}</span>`
            }
            <div class="flex gap-0.5 items-center shrink-0">
              <button type="button" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                onClick=${() => onChange(move(items, i, i - 1))}>↑</button>
              <button type="button" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === items.length - 1}
                onClick=${() => onChange(move(items, i, i + 1))}>↓</button>
              <button type="button"
                class="border-none bg-transparent text-gray-400 px-0.5 text-base leading-none cursor-pointer hover:text-gray-900 hover:bg-transparent"
                onClick=${() => onChange(items.filter((_: string, j: number) => j !== i))}
                aria-label="Remove">\u00d7</button>
            </div>
          </div>
        `
      )}
      <div class="flex">
        <input
          ref=${inputRef}
          type="text"
          class="flex-1 border-none rounded-none mt-0 text-sm"
          placeholder=${placeholder ?? "Add a bullet point and press Enter"}
          onKeyDown=${handleKeyDown}
        />
        <button type="button" class="border-none border-l border-gray-200 rounded-none bg-gray-100 text-xs px-3 py-1.5 hover:bg-gray-200" onClick=${addItem}>Add</button>
      </div>
    </div>
  `;
}
