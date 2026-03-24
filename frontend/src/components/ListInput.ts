import { html } from "htm/preact";
import { useRef } from "preact/hooks";

interface ListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function ListInput({ items, onChange, placeholder }: ListInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

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

  return html`
    <div class="list-input">
      ${items.map(
        (item, i) => html`
          <div class="list-input-item" key=${i}>
            <span class="list-input-bullet">•</span>
            <span class="list-input-text">${item}</span>
            <button type="button" class="list-input-remove" onClick=${() => removeItem(i)} aria-label="Remove">×</button>
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
