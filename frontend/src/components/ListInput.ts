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
    <div class="list-input">
      ${items.map(
        (item, i) => html`
          <div class="list-input-item" key=${i}>
            <span class="list-input-bullet">\u2022</span>
            ${editingIndex === i
              ? html`<input
                  type="text"
                  class="list-input-edit"
                  value=${item}
                  onKeyDown=${(e: KeyboardEvent) => handleEditKeyDown(e, i)}
                  onBlur=${(e: FocusEvent) => saveEdit(i, (e.target as HTMLInputElement).value)}
                  ref=${(el: HTMLInputElement | null) => el?.focus()}
                />`
              : html`<span class="list-input-text" onClick=${() => setEditingIndex(i)}>${item}</span>`
            }
            <div class="list-input-controls">
              <button type="button" class="btn-icon" disabled=${i === 0}
                onClick=${() => onChange(move(items, i, i - 1))}>↑</button>
              <button type="button" class="btn-icon" disabled=${i === items.length - 1}
                onClick=${() => onChange(move(items, i, i + 1))}>↓</button>
              <button type="button" class="list-input-remove"
                onClick=${() => onChange(items.filter((_: string, j: number) => j !== i))}
                aria-label="Remove">\u00d7</button>
            </div>
          </div>
        `
      )}
      <div class="list-input-row">
        <input
          ref=${inputRef}
          type="text"
          class="list-input-field"
          placeholder=${placeholder ?? "Add a bullet point and press Enter"}
          onKeyDown=${handleKeyDown}
        />
        <button type="button" class="list-input-add" onClick=${addItem}>Add</button>
      </div>
    </div>
  `;
}
