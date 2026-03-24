import { html } from "htm/preact";
import type { Basics, Location } from "../types.js";

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

function val(e: Event): string {
  return (e.target as HTMLInputElement).value;
}

export function BasicsForm({ basics, onChange }: BasicsFormProps) {
  const loc = basics.location ?? {};

  return html`
    <fieldset>
      <legend>Personal Information</legend>
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
      <div class="field-row">
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
        <textarea rows="3" placeholder="A brief professional summary..."
          onInput=${(e: Event) => onChange(set(basics, { summary: val(e) }))}
        >${basics.summary ?? ""}</textarea>
      </label>
    </fieldset>
  `;
}
