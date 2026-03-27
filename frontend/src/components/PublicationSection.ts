import { html } from "htm/preact";
import { t } from "../i18n.js";
import type { Publication } from "../types.js";

interface PublicationSectionProps {
  publications: Publication[];
  onChange: (publications: Publication[]) => void;
}

function update(publications: Publication[], index: number, patch: Partial<Publication>): Publication[] {
  return publications.map((p, i) => (i === index ? { ...p, ...patch } : p));
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

export function PublicationSection({ publications, onChange }: PublicationSectionProps) {
  function addEntry() {
    onChange([...publications, {}]);
  }

  function removeEntry(index: number) {
    onChange(publications.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("publications.legend")}</legend>
      ${publications.map(
        (pub, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("publications.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(publications, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === publications.length - 1}
                  onClick=${() => onChange(move(publications, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("publications.name")}
                <input type="text" value=${pub.name ?? ""} placeholder=${t("publications.ph.name")}
                  onInput=${(e: Event) => onChange(update(publications, i, { name: val(e) }))} />
              </label>
              <label>
                ${t("publications.publisher")}
                <input type="text" value=${pub.publisher ?? ""} placeholder=${t("publications.ph.publisher")}
                  onInput=${(e: Event) => onChange(update(publications, i, { publisher: val(e) }))} />
              </label>
              <label>
                ${t("publications.releaseDate")}
                <input type="month" value=${pub.releaseDate ?? ""}
                  onChange=${(e: Event) => onChange(update(publications, i, { releaseDate: val(e) }))} />
              </label>
            </div>
            <label>
              ${t("publications.url")}
              <input type="url" value=${pub.url ?? ""} placeholder=${t("publications.ph.url")}
                onInput=${(e: Event) => onChange(update(publications, i, { url: val(e) }))} />
            </label>
            <label>
              ${t("publications.summary")}
              <textarea rows="1" class="resize-none overflow-hidden" placeholder=${t("publications.ph.summary")}
                ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
                onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(update(publications, i, { summary: val(e) })); }}
              >${pub.summary ?? ""}</textarea>
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("publications.add")}</button>
    </fieldset>
  `;
}
