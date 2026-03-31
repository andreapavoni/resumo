use serde::Deserialize;

pub struct Translations {
    pub summary: &'static str,
    pub experience: &'static str,
    pub education: &'static str,
    pub languages: &'static str,
    pub skills: &'static str,
    pub contact: &'static str,
    pub present: &'static str,
    pub gpa_label: &'static str,
    pub in_field: &'static str,
    pub volunteer: &'static str,
    pub projects: &'static str,
    pub awards: &'static str,
    pub certificates: &'static str,
    pub publications: &'static str,
    pub interests: &'static str,
    pub references: &'static str,
}

#[derive(Debug, Clone, Copy, Default, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Locale {
    #[default]
    En,
    It,
}

static EN: Translations = Translations {
    summary: "Summary",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    contact: "Contact",
    present: "Present",
    gpa_label: "GPA: ",
    in_field: "in",
    volunteer: "Volunteer",
    projects: "Projects",
    awards: "Awards",
    certificates: "Certificates",
    publications: "Publications",
    interests: "Interests",
    references: "References",
};

static IT: Translations = Translations {
    summary: "Riepilogo",
    experience: "Esperienza",
    education: "Istruzione",
    skills: "Competenze",
    languages: "Lingue",
    contact: "Contatti",
    present: "In corso",
    gpa_label: "Voto: ",
    in_field: "in",
    volunteer: "Volontariato",
    projects: "Progetti",
    awards: "Premi",
    certificates: "Certificazioni",
    publications: "Pubblicazioni",
    interests: "Interessi",
    references: "Referenze",
};

pub fn translations_for(locale: &Locale) -> &'static Translations {
    match locale {
        Locale::It => &IT,
        _ => &EN,
    }
}
