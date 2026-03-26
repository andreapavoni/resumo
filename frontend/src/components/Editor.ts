import { html } from "htm/preact";
import { BasicsForm } from "./BasicsForm.js";
import { WorkSection } from "./WorkSection.js";
import { VolunteerSection } from "./VolunteerSection.js";
import { EducationSection } from "./EducationSection.js";
import { AwardSection } from "./AwardSection.js";
import { CertificateSection } from "./CertificateSection.js";
import { PublicationSection } from "./PublicationSection.js";
import { SkillSection } from "./SkillSection.js";
import { LanguageSection } from "./LanguageSection.js";
import { InterestSection } from "./InterestSection.js";
import { ReferenceSection } from "./ReferenceSection.js";
import { ProjectSection } from "./ProjectSection.js";
import type {
  Resume, Basics, Work, Volunteer, Education, Award, Certificate,
  Publication, Skill, Language, Interest, Reference, Project,
} from "../types.js";

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
      <${VolunteerSection}
        volunteer=${resume.volunteer ?? []}
        onChange=${(volunteer: Volunteer[]) => onChange({ ...resume, volunteer })}
      />
      <${EducationSection}
        education=${resume.education ?? []}
        onChange=${(education: Education[]) => onChange({ ...resume, education })}
      />
      <${AwardSection}
        awards=${resume.awards ?? []}
        onChange=${(awards: Award[]) => onChange({ ...resume, awards })}
      />
      <${CertificateSection}
        certificates=${resume.certificates ?? []}
        onChange=${(certificates: Certificate[]) => onChange({ ...resume, certificates })}
      />
      <${PublicationSection}
        publications=${resume.publications ?? []}
        onChange=${(publications: Publication[]) => onChange({ ...resume, publications })}
      />
      <${SkillSection}
        skills=${resume.skills ?? []}
        onChange=${(skills: Skill[]) => onChange({ ...resume, skills })}
      />
      <${LanguageSection}
        languages=${resume.languages ?? []}
        onChange=${(languages: Language[]) => onChange({ ...resume, languages })}
      />
      <${InterestSection}
        interests=${resume.interests ?? []}
        onChange=${(interests: Interest[]) => onChange({ ...resume, interests })}
      />
      <${ReferenceSection}
        references=${resume.references ?? []}
        onChange=${(references: Reference[]) => onChange({ ...resume, references })}
      />
      <${ProjectSection}
        projects=${resume.projects ?? []}
        onChange=${(projects: Project[]) => onChange({ ...resume, projects })}
      />
    </div>
  `;
}
