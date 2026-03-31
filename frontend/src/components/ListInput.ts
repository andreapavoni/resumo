import { html } from "htm/preact";
import { useRef, useState } from "preact/hooks";
import { move } from "./utils.js";
import { t } from "../i18n.js";

interface ListInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
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
    <div class="mt-0.5 border border-black/20 rounded-sm bg-white overflow-hidden">
      ${items.map(
        (item, i) => html`
          <div class="flex items-baseline gap-1.5 px-2 py-1.5 border-b border-black/10 text-sm" key=${i}>
            <span class="text-gray-400 shrink-0">\u2022</span>
            ${editingIndex === i
              ? html`<input
                  type="text"
                  class="flex-1 border border-appaccent rounded-sm px-0.5 py-0.5 text-sm outline-none w-auto mt-0"
                  value=${item}
                  onKeyDown=${(e: KeyboardEvent) => handleEditKeyDown(e, i)}
                  onBlur=${(e: FocusEvent) => saveEdit(i, (e.target as HTMLInputElement).value)}
                  ref=${(el: HTMLInputElement | null) => el?.focus()}
                />`
              : html`<button type="button" class="flex-1 cursor-text px-0.5 py-0.5 rounded-sm hover:bg-black/5 text-left font-normal border-none bg-transparent" aria-label=${t("common.editItem")} onClick=${() => setEditingIndex(i)}>${item}</button>`
            }
            <div class="flex gap-0.5 items-center shrink-0">
              <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                onClick=${() => onChange(move(items, i, i - 1))}>↑</button>
              <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === items.length - 1}
                onClick=${() => onChange(move(items, i, i + 1))}>↓</button>
              <button type="button"
                class="border-none bg-transparent text-gray-400 px-0.5 text-base leading-none cursor-pointer hover:text-gray-900 hover:bg-transparent"
                onClick=${() => onChange(items.filter((_: string, j: number) => j !== i))}
                aria-label=${t("common.remove")}>\u00d7</button>
            </div>
          </div>
        `
      )}
      <div class="flex">
        <input
          ref=${inputRef}
          type="text"
          class="flex-1 border-none rounded-none mt-0 text-sm"
          placeholder=${placeholder ?? t("common.listPlaceholder")}
          onKeyDown=${handleKeyDown}
        />
        <button type="button" class="border-none border-l border-black/20 rounded-none bg-gray-100 text-xs px-3 py-1.5 font-medium hover:bg-gray-200" onClick=${addItem}>${t("common.add")}</button>
      </div>
    </div>
  `;
}
