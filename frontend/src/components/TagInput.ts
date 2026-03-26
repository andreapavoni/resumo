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
    <div class="border border-black/20 rounded-sm px-1.5 py-1 mt-0.5 bg-white flex flex-wrap gap-1 min-h-9 cursor-text focus-within:outline focus-within:outline-2 focus-within:outline-appaccent">
      ${items.map(
        (item, i) => html`
          <span class="inline-flex items-center gap-1 bg-black text-white rounded-sm px-1.5 py-0.5 text-xs font-medium" key=${i}>
            ${item}
            <button type="button"
              class="bg-transparent border-none text-white p-0 text-xs leading-none cursor-pointer opacity-80 hover:opacity-100"
              onClick=${() => removeItem(i)} aria-label="Remove">×</button>
          </span>
        `
      )}
      <input
        type="text"
        class="border-none outline-none bg-transparent text-sm min-w-32 flex-1 px-0.5 py-0.5 w-auto inline-block mt-0"
        placeholder=${items.length === 0 ? (placeholder ?? "Type and press Enter") : ""}
        onKeyDown=${handleKeyDown}
      />
    </div>
  `;
}
