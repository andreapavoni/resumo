import { html } from "htm/preact";

interface TagInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function TagInput({ items, onChange, placeholder }: TagInputProps) {
  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const value = input.value.trim();
      if (value) {
        onChange([...items, value]);
        input.value = "";
      }
    }
  }

  return html`
    <div class="tag-input">
      ${items.map(
        (item, i) => html`
          <span class="tag-chip" key=${i}>
            ${item}
            <button type="button" onClick=${() => removeItem(i)} aria-label="Remove">×</button>
          </span>
        `
      )}
      <input
        type="text"
        class="tag-input-field"
        placeholder=${items.length === 0 ? (placeholder ?? "Type and press Enter") : ""}
        onKeyDown=${handleKeyDown}
      />
    </div>
  `;
}
