import { html } from "htm/preact";
import { update, val, move, fieldError, hasItemErrors } from "./utils.js";
import { t } from "../i18n.js";
import type { Certificate, ValidationError } from "../types.js";

interface CertificateSectionProps {
  certificates: Certificate[];
  errors: ValidationError[];
  onChange: (certificates: Certificate[]) => void;
}

export function CertificateSection({ certificates, errors, onChange }: CertificateSectionProps) {
  function addEntry() {
    onChange([...certificates, {}]);
  }

  function removeEntry(index: number) {
    onChange(certificates.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>${t("certificates.legend")}</legend>
      ${certificates.map(
        (cert, i) => html`
          <div class=${"border-2 rounded-sm p-3 mb-3 " + (hasItemErrors(errors, `certificates[${i}]`) ? "border-red-400 bg-red-50" : "border-black/60 bg-appbg")} key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">${t("certificates.entry")} #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label=${t("common.moveUp")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(certificates, i, i - 1))}>↑</button>
                <button type="button" aria-label=${t("common.moveDown")} class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === certificates.length - 1}
                  onClick=${() => onChange(move(certificates, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>${t("common.remove")}</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("certificates.name")}
                <input type="text" value=${cert.name ?? ""} placeholder=${t("certificates.ph.name")}
                  onInput=${(e: Event) => onChange(update(certificates, i, { name: val(e) }))} />
              </label>
              <label>
                ${t("certificates.issuer")}
                <input type="text" value=${cert.issuer ?? ""} placeholder=${t("certificates.ph.issuer")}
                  onInput=${(e: Event) => onChange(update(certificates, i, { issuer: val(e) }))} />
              </label>
              <label>
                ${t("certificates.date")}
                <input type="month" value=${cert.date ?? ""}
                  onChange=${(e: Event) => onChange(update(certificates, i, { date: val(e) }))} />
              </label>
            </div>
            <label>
              ${t("certificates.url")}
              <input type="url" value=${cert.url ?? ""} placeholder=${t("certificates.ph.url")}
                class=${fieldError(errors, `certificates[${i}].url`) ? "border-red-500" : ""}
                onInput=${(e: Event) => onChange(update(certificates, i, { url: val(e) }))} />
              ${fieldError(errors, `certificates[${i}].url`) && html`<span class="text-red-500 text-xs">${fieldError(errors, `certificates[${i}].url`)}</span>`}
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>${t("certificates.add")}</button>
    </fieldset>
  `;
}
