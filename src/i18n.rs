//! Compile-time localisation for resume template labels.
//!
//! Only template-facing strings live here. Editor UI strings are handled
//! on the frontend (`frontend/src/i18n.ts`).

use serde::Deserialize;

/// Static strings used by resume HTML templates.
///
/// Each field is a section heading or UI label injected into the template
/// at render time. Add a new field here and in every [`Locale`] static
/// whenever the templates need a new translatable string.
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

/// Supported render locales. Passed as a `?locale=` query parameter.
/// Defaults to [`Locale::En`] when absent or unrecognised.
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

/// Returns the static [`Translations`] for the given locale.
/// Unknown locales fall back to English.
pub fn translations_for(locale: &Locale) -> &'static Translations {
    match locale {
        Locale::It => &IT,
        _ => &EN,
    }
}
