use std::collections::BTreeMap;

use askama::Template;
use axum::{
    extract::{Form, Query},
    response::Html,
};
use serde::Deserialize;

use crate::models::*;

// --- Template structs ---

#[derive(Template)]
#[template(path = "editor.html")]
struct EditorTemplate;

#[derive(Template)]
#[template(path = "preview.html")]
struct PreviewTemplate {
    resume: Resume,
}

#[derive(Template)]
#[template(path = "partials/work_entry_form.html")]
struct WorkEntryFormTemplate {
    index: usize,
}

#[derive(Template)]
#[template(path = "partials/education_entry_form.html")]
struct EducationEntryFormTemplate {
    index: usize,
}

#[derive(Template)]
#[template(path = "partials/skill_entry_form.html")]
struct SkillEntryFormTemplate {
    index: usize,
}

// --- Route handlers ---

pub async fn editor_page() -> Html<String> {
    let template = EditorTemplate;
    Html(template.render().unwrap())
}

pub async fn preview(Form(fields): Form<Vec<(String, String)>>) -> Html<String> {
    let resume = parse_form_fields(&fields);
    let template = PreviewTemplate { resume };
    Html(template.render().unwrap())
}

#[derive(Deserialize)]
pub struct AddEntryParams {
    section: String,
}

pub async fn add_entry(
    Query(params): Query<AddEntryParams>,
    Form(fields): Form<Vec<(String, String)>>,
) -> Html<String> {
    let count_key = format!("{}_count", params.section);
    let index: usize = fields
        .iter()
        .find(|(k, _)| k == &count_key)
        .and_then(|(_, v)| v.parse().ok())
        .unwrap_or(0);
    let next_count = index + 1;

    let partial = match params.section.as_str() {
        "work" => WorkEntryFormTemplate { index }.render().unwrap(),
        "education" => EducationEntryFormTemplate { index }.render().unwrap(),
        "skills" => SkillEntryFormTemplate { index }.render().unwrap(),
        _ => return Html(String::new()),
    };

    // Return the partial + an OOB swap to update the hidden counter
    let oob = format!(
        r#"<input type="hidden" name="{count_key}" id="{section}-count" value="{next_count}" hx-swap-oob="true" />"#,
        count_key = count_key,
        section = params.section,
        next_count = next_count,
    );

    Html(format!("{partial}{oob}"))
}

pub async fn remove_entry() -> Html<String> {
    Html(String::new())
}

pub async fn export_json(
    Form(fields): Form<Vec<(String, String)>>,
) -> axum::response::Json<Resume> {
    let resume = parse_form_fields(&fields);
    axum::response::Json(resume)
}

// --- Form parsing ---

fn parse_form_fields(fields: &[(String, String)]) -> Resume {
    let mut resume = Resume::default();
    let mut work_map: BTreeMap<usize, Work> = BTreeMap::new();
    let mut edu_map: BTreeMap<usize, Education> = BTreeMap::new();
    let mut skill_map: BTreeMap<usize, Skill> = BTreeMap::new();

    for (key, value) in fields {
        let value = value.trim();
        if value.is_empty() {
            continue;
        }

        if let Some(field) = key.strip_prefix("basics.") {
            parse_basics(field, value, &mut resume);
        } else if let Some(rest) = key.strip_prefix("work[") {
            parse_indexed_entry(rest, value, &mut work_map, parse_work_field);
        } else if let Some(rest) = key.strip_prefix("education[") {
            parse_indexed_entry(rest, value, &mut edu_map, parse_education_field);
        } else if let Some(rest) = key.strip_prefix("skills[") {
            parse_indexed_entry(rest, value, &mut skill_map, parse_skill_field);
        }
    }

    if !work_map.is_empty() {
        resume.work = Some(work_map.into_values().collect());
    }
    if !edu_map.is_empty() {
        resume.education = Some(edu_map.into_values().collect());
    }
    if !skill_map.is_empty() {
        resume.skills = Some(skill_map.into_values().collect());
    }
    resume
}

fn parse_basics(field: &str, value: &str, resume: &mut Resume) {
    let basics = resume.basics.get_or_insert_with(Default::default);
    match field {
        "name" => basics.name = Some(value.to_string()),
        "label" => basics.label = Some(value.to_string()),
        "email" => basics.email = Some(value.to_string()),
        "phone" => basics.phone = Some(value.to_string()),
        "url" => basics.url = Some(value.to_string()),
        "summary" => basics.summary = Some(value.to_string()),
        "location.city" => {
            basics.location.get_or_insert_with(Default::default).city = Some(value.to_string());
        }
        "location.region" => {
            basics.location.get_or_insert_with(Default::default).region = Some(value.to_string());
        }
        "location.country_code" => {
            basics
                .location
                .get_or_insert_with(Default::default)
                .country_code = Some(value.to_string());
        }
        _ => {}
    }
}

fn parse_indexed_entry<T: Default>(
    rest: &str,
    value: &str,
    map: &mut BTreeMap<usize, T>,
    setter: fn(&str, &str, &mut T),
) {
    if let Some((idx_str, field)) = rest.split_once("].") {
        if let Ok(idx) = idx_str.parse::<usize>() {
            let entry = map.entry(idx).or_default();
            setter(field, value, entry);
        }
    }
}

fn parse_work_field(field: &str, value: &str, work: &mut Work) {
    match field {
        "position" => work.position = Some(value.to_string()),
        "name" => work.name = Some(value.to_string()),
        "location" => work.location = Some(value.to_string()),
        "start_date" => work.start_date = Some(value.to_string()),
        "end_date" => work.end_date = Some(value.to_string()),
        "summary" => work.summary = Some(value.to_string()),
        "highlights" => {
            let items: Vec<String> = value
                .lines()
                .map(|l| l.trim().to_string())
                .filter(|l| !l.is_empty())
                .collect();
            if !items.is_empty() {
                work.highlights = Some(items);
            }
        }
        _ => {}
    }
}

fn parse_education_field(field: &str, value: &str, edu: &mut Education) {
    match field {
        "institution" => edu.institution = Some(value.to_string()),
        "area" => edu.area = Some(value.to_string()),
        "study_type" => edu.study_type = Some(value.to_string()),
        "start_date" => edu.start_date = Some(value.to_string()),
        "end_date" => edu.end_date = Some(value.to_string()),
        "score" => edu.score = Some(value.to_string()),
        _ => {}
    }
}

fn parse_skill_field(field: &str, value: &str, skill: &mut Skill) {
    match field {
        "name" => skill.name = Some(value.to_string()),
        "level" => skill.level = Some(value.to_string()),
        "keywords" => {
            let items: Vec<String> = value
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();
            if !items.is_empty() {
                skill.keywords = Some(items);
            }
        }
        _ => {}
    }
}
