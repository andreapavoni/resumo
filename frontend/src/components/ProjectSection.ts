import { html } from "htm/preact";
import { ListInput } from "./ListInput.js";
import { TagInput } from "./TagInput.js";
import type { Project } from "../types.js";

interface ProjectSectionProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}

function update(projects: Project[], index: number, patch: Partial<Project>): Project[] {
  return projects.map((p, i) => (i === index ? { ...p, ...patch } : p));
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

export function ProjectSection({ projects, onChange }: ProjectSectionProps) {
  function addEntry() {
    onChange([...projects, {}]);
  }

  function removeEntry(index: number) {
    onChange(projects.filter((_, i) => i !== index));
  }

  return html`
    <fieldset>
      <legend>Projects</legend>
      ${projects.map(
        (project, i) => html`
          <div class="border-2 border-black/60 rounded-sm p-3 mb-3 bg-appbg" key=${i}>
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-xs uppercase tracking-wide">Project #${i + 1}</h3>
              <div class="flex gap-1 items-center">
                <button type="button" aria-label="Move up" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === 0}
                  onClick=${() => onChange(move(projects, i, i - 1))}>↑</button>
                <button type="button" aria-label="Move down" class="px-1.5 py-0.5 text-xs leading-none min-w-0 disabled:opacity-30" disabled=${i === projects.length - 1}
                  onClick=${() => onChange(move(projects, i, i + 1))}>↓</button>
                <button type="button" class="text-appaccent border-appaccent hover:bg-appaccent/10" onClick=${() => removeEntry(i)}>Remove</button>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                Name
                <input type="text" value=${project.name ?? ""} placeholder="My Project"
                  onInput=${(e: Event) => onChange(update(projects, i, { name: val(e) }))} />
              </label>
              <label>
                Entity
                <input type="text" value=${project.entity ?? ""} placeholder="Company or org"
                  onInput=${(e: Event) => onChange(update(projects, i, { entity: val(e) }))} />
              </label>
              <label>
                Type
                <input type="text" value=${project.type ?? ""} placeholder="application, talk..."
                  onInput=${(e: Event) => onChange(update(projects, i, { type: val(e) }))} />
              </label>
            </div>
            <label>
              URL
              <input type="url" value=${project.url ?? ""} placeholder="https://github.com/user/project"
                onInput=${(e: Event) => onChange(update(projects, i, { url: val(e) }))} />
            </label>
            <div class="flex flex-col sm:flex-row gap-3">
              <label>
                Start Date
                <input type="month" value=${project.startDate ?? ""}
                  onChange=${(e: Event) => onChange(update(projects, i, { startDate: val(e) }))} />
              </label>
              <div class="flex-1">
                <label>
                  End Date
                  <input type="month" value=${project.endDate ?? ""}
                    disabled=${project.endDate === undefined}
                    onChange=${(e: Event) => onChange(update(projects, i, { endDate: val(e) }))} />
                </label>
                <label class="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked=${project.endDate === undefined}
                    onChange=${(e: Event) => {
                      const current = (e.target as HTMLInputElement).checked;
                      onChange(update(projects, i, { endDate: current ? undefined : "" }));
                    }} />
                  Ongoing
                </label>
              </div>
            </div>
            <label>
              Description
              <textarea rows="1" class="resize-none overflow-hidden" placeholder="Short summary of the project..."
                ref=${(el: HTMLTextAreaElement | null) => el && autoResize(el)}
                onInput=${(e: Event) => { autoResize(e.target as HTMLTextAreaElement); onChange(update(projects, i, { description: val(e) })); }}
              >${project.description ?? ""}</textarea>
            </label>
            <label>
              Roles
              <${TagInput}
                items=${project.roles ?? []}
                placeholder="Add a role and press Enter"
                onChange=${(items: string[]) => onChange(update(projects, i, { roles: items }))}
              />
            </label>
            <label>
              Keywords
              <${TagInput}
                items=${project.keywords ?? []}
                placeholder="Add a keyword and press Enter"
                onChange=${(items: string[]) => onChange(update(projects, i, { keywords: items }))}
              />
            </label>
            <label>
              Highlights
              <${ListInput}
                items=${project.highlights ?? []}
                onChange=${(items: string[]) => onChange(update(projects, i, { highlights: items }))}
              />
            </label>
          </div>
        `
      )}
      <button type="button" class="w-full border-2 border-black font-bold hover:bg-appbg" onClick=${addEntry}>+ Add Project</button>
    </fieldset>
  `;
}
