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
};

pub fn translations_for(locale: &str) -> &'static Translations {
    match locale {
        "it" => &IT,
        _ => &EN,
    }
}
