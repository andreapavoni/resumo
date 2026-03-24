import { html } from "htm/preact";
import { BasicsForm } from "./BasicsForm.js";
import { WorkSection } from "./WorkSection.js";
import { EducationSection } from "./EducationSection.js";
import { SkillSection } from "./SkillSection.js";
import type { Resume, Basics, Work, Education, Skill } from "../types.js";

interface EditorProps {
  resume: Resume;
  onChange: (resume: Resume) => void;
}

export function Editor({ resume, onChange }: EditorProps) {
  return html`
    <div>
      <${BasicsForm}
        basics=${resume.basics ?? {}}
        onChange=${(basics: Basics) => onChange({ ...resume, basics })}
      />
      <${WorkSection}
        work=${resume.work ?? []}
        onChange=${(work: Work[]) => onChange({ ...resume, work })}
      />
      <${EducationSection}
        education=${resume.education ?? []}
        onChange=${(education: Education[]) => onChange({ ...resume, education })}
      />
      <${SkillSection}
        skills=${resume.skills ?? []}
        onChange=${(skills: Skill[]) => onChange({ ...resume, skills })}
      />
    </div>
  `;
}
