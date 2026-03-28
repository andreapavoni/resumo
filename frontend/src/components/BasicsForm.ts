import { html } from "htm/preact";
import { useRef } from "preact/hooks";
import { t } from "../i18n.js";
import type { Basics, Location, Profile } from "../types.js";

interface BasicsFormProps {
  basics: Basics;
  onChange: (basics: Basics) => void;
}

function set(basics: Basics, patch: Partial<Basics>): Basics {
  return { ...basics, ...patch };
}

function setLocation(basics: Basics, patch: Partial<Location>): Basics {
  return { ...basics, location: { ...basics.location, ...patch } };
}

function updateProfile(basics: Basics, index: number, patch: Partial<Profile>): Basics {
  const profiles = (basics.profiles ?? []).map((p, i) => i === index ? { ...p, ...patch } : p);
  return { ...basics, profiles };
}

function val(e: Event): string {
  return (e.target as HTMLInputElement).value;
}

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}

export function BasicsForm({ basics, onChange }: BasicsFormProps) {
  const loc = basics.location ?? {};
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePhoto() {
    fileRef.current?.click();
  }

  function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      alert(t("basics.photoTooLarge"));
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange(set(basics, { image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    onChange(set(basics, { image: undefined }));
    if (fileRef.current) fileRef.current.value = "";
  }

  return html`
    <fieldset>
      <legend>${t("basics.legend")}</legend>
      <div class="flex items-center gap-3 mb-2">
        <input ref=${fileRef} type="file" accept="image/*" class="sr-only" onChange=${onFileChange} />
        ${basics.image
          ? html`
            <img class="w-14 h-14 rounded-full object-cover border-2 border-black" src=${basics.image} alt="Profile" />
            <div class="flex gap-1.5">
              <button type="button" onClick=${handlePhoto}>${t("basics.changePhoto")}</button>
              <button type="button" onClick=${removePhoto}>${t("basics.removePhoto")}</button>
            </div>
          `
          : html`<button type="button" onClick=${handlePhoto}>${t("basics.addPhoto")}</button>`
        }
      </div>
      <label>
        ${t("basics.fullName")}
        <input type="text" value=${basics.name ?? ""} placeholder=${t("basics.ph.name")}
          onInput=${(e: Event) => onChange(set(basics, { name: val(e) }))} />
      </label>
      <label>
        ${t("basics.title")}
        <input type="text" value=${basics.label ?? ""} placeholder=${t("basics.ph.title")}
          onInput=${(e: Event) => onChange(set(basics, { label: val(e) }))} />
      </label>
      <label>
        ${t("basics.email")}
        <input type="email" value=${basics.email ?? ""} placeholder=${t("basics.ph.email")}
          onInput=${(e: Event) => onChange(set(basics, { email: val(e) }))} />
      </label>
      <label>
        ${t("basics.phone")}
        <input type="text" value=${basics.phone ?? ""} placeholder=${t("basics.ph.phone")}
          onInput=${(e: Event) => onChange(set(basics, { phone: val(e) }))} />
      </label>
      <label>
        ${t("basics.website")}
        <input type="url" value=${basics.url ?? ""} placeholder=${t("basics.ph.website")}
          onInput=${(e: Event) => onChange(set(basics, { url: val(e) }))} />
      </label>
      <div class="flex flex-col sm:flex-row gap-3">
        <label>
          ${t("basics.city")}
          <input type="text" value=${loc.city ?? ""} placeholder=${t("basics.ph.city")}
            onInput=${(e: Event) => onChange(setLocation(basics, { city: val(e) }))} />
        </label>
        <label>
          ${t("basics.region")}
          <input type="text" value=${loc.region ?? ""} placeholder=${t("basics.ph.region")}
            onInput=${(e: Event) => onChange(setLocation(basics, { region: val(e) }))} />
        </label>
        <label>
          ${t("basics.country")}
          <input type="text" value=${loc.countryCode ?? ""} placeholder=${t("basics.ph.country")}
            onInput=${(e: Event) => onChange(setLocation(basics, { countryCode: val(e) }))} />
        </label>
      </div>
      <label>
        ${t("basics.summary")}
        <textarea rows="1" class="resize-none overflow-hidden" placeholder=${t("basics.ph.summary")}
          ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
          onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(set(basics, { summary: val(e) })); }}
        >${basics.summary ?? ""}</textarea>
      </label>
      <div class="mt-3">
        <div class="text-xs font-bold uppercase tracking-wide mb-2">${t("basics.socialProfiles")}</div>
        ${(basics.profiles ?? []).map((profile, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-2 bg-white" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">Profile #${i + 1}</h3>
              <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10"
                onClick=${() => onChange({ ...basics, profiles: (basics.profiles ?? []).filter((_, j) => j !== i) })}>${t("common.remove")}</button>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                ${t("basics.network")}
                <input type="text" value=${profile.network ?? ""} placeholder=${t("basics.ph.network")}
                  onInput=${(e: Event) => onChange(updateProfile(basics, i, { network: val(e) }))} />
              </label>
              <label>
                ${t("basics.username")}
                <input type="text" value=${profile.username ?? ""} placeholder=${t("basics.ph.username")}
                  onInput=${(e: Event) => onChange(updateProfile(basics, i, { username: val(e) }))} />
              </label>
              <label>
                ${t("basics.url")}
                <input type="url" value=${profile.url ?? ""} placeholder=${t("basics.ph.url")}
                  onInput=${(e: Event) => onChange(updateProfile(basics, i, { url: val(e) }))} />
              </label>
            </div>
          </div>
        `)}
        <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg"
          onClick=${() => onChange({ ...basics, profiles: [...(basics.profiles ?? []), {}] })}>${t("basics.addProfile")}</button>
      </div>
    </fieldset>
  `;
}
