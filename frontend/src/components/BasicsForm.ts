import { html } from "htm/preact";
import { useRef } from "preact/hooks";
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
      <legend>Personal Information</legend>
      <div class="flex items-center gap-3 mb-2">
        <input ref=${fileRef} type="file" accept="image/*" class="sr-only" onChange=${onFileChange} />
        ${basics.image
          ? html`
            <img class="w-14 h-14 rounded-full object-cover border-2 border-black" src=${basics.image} alt="Profile" />
            <div class="flex gap-1.5">
              <button type="button" onClick=${handlePhoto}>Change Photo</button>
              <button type="button" onClick=${removePhoto}>Remove</button>
            </div>
          `
          : html`<button type="button" onClick=${handlePhoto}>Add Profile Photo</button>`
        }
      </div>
      <label>
        Full Name
        <input type="text" value=${basics.name ?? ""} placeholder="Jane Doe"
          onInput=${(e: Event) => onChange(set(basics, { name: val(e) }))} />
      </label>
      <label>
        Title
        <input type="text" value=${basics.label ?? ""} placeholder="Software Engineer"
          onInput=${(e: Event) => onChange(set(basics, { label: val(e) }))} />
      </label>
      <label>
        Email
        <input type="email" value=${basics.email ?? ""} placeholder="jane@example.com"
          onInput=${(e: Event) => onChange(set(basics, { email: val(e) }))} />
      </label>
      <label>
        Phone
        <input type="text" value=${basics.phone ?? ""} placeholder="+1 555 123 4567"
          onInput=${(e: Event) => onChange(set(basics, { phone: val(e) }))} />
      </label>
      <label>
        Website
        <input type="url" value=${basics.url ?? ""} placeholder="https://janedoe.dev"
          onInput=${(e: Event) => onChange(set(basics, { url: val(e) }))} />
      </label>
      <div class="flex flex-col sm:flex-row gap-3">
        <label>
          City
          <input type="text" value=${loc.city ?? ""} placeholder="San Francisco"
            onInput=${(e: Event) => onChange(setLocation(basics, { city: val(e) }))} />
        </label>
        <label>
          Region
          <input type="text" value=${loc.region ?? ""} placeholder="CA"
            onInput=${(e: Event) => onChange(setLocation(basics, { region: val(e) }))} />
        </label>
        <label>
          Country
          <input type="text" value=${loc.countryCode ?? ""} placeholder="US"
            onInput=${(e: Event) => onChange(setLocation(basics, { countryCode: val(e) }))} />
        </label>
      </div>
      <label>
        Summary
        <textarea rows="1" class="resize-none overflow-hidden" placeholder="A brief professional summary..."
          ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
          onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(set(basics, { summary: val(e) })); }}
        >${basics.summary ?? ""}</textarea>
      </label>
      <div class="mt-3">
        <div class="text-xs font-bold uppercase tracking-wide mb-2">Social Profiles</div>
        ${(basics.profiles ?? []).map((profile, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-2 bg-white" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">Profile #${i + 1}</h3>
              <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10"
                onClick=${() => onChange({ ...basics, profiles: (basics.profiles ?? []).filter((_, j) => j !== i) })}>Remove</button>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                Network
                <input type="text" value=${profile.network ?? ""} placeholder="LinkedIn"
                  onInput=${(e: Event) => onChange(updateProfile(basics, i, { network: val(e) }))} />
              </label>
              <label>
                Username
                <input type="text" value=${profile.username ?? ""} placeholder="janedoe"
                  onInput=${(e: Event) => onChange(updateProfile(basics, i, { username: val(e) }))} />
              </label>
              <label>
                URL
                <input type="url" value=${profile.url ?? ""} placeholder="https://linkedin.com/in/janedoe"
                  onInput=${(e: Event) => onChange(updateProfile(basics, i, { url: val(e) }))} />
              </label>
            </div>
          </div>
        `)}
        <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg"
          onClick=${() => onChange({ ...basics, profiles: [...(basics.profiles ?? []), {}] })}>+ Add Profile</button>
      </div>
    </fieldset>
  `;
}
