use askama::Template;
use axum::{Json, extract::Query};
use serde::{Deserialize, Serialize};

use crate::api::error::AppError;
use crate::i18n::{Locale, Translations, translations_for};
use crate::resume::models::Resume;
use crate::resume::validate::ValidationError;

#[derive(Debug, Clone, Copy, Default, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    #[default]
    Classic,
    Modern,
}

#[derive(Deserialize)]
pub struct RenderQuery {
    #[serde(default)]
    pub theme: Theme,
    #[serde(default)]
    pub locale: Locale,
}

macro_rules! theme_templates {
    ($($variant:ident => $path:literal),+ $(,)?) => {
        $(
            #[derive(Template)]
            #[template(path = $path)]
            struct $variant {
                resume: Resume,
                t: &'static Translations,
            }
        )+

        fn render_themed(theme: Theme, resume: Resume, t: &'static Translations) -> Result<String, askama::Error> {
            match theme {
                $(Theme::$variant => $variant { resume, t }.render(),)+
            }
        }
    };
}

theme_templates! {
    Classic => "themes/classic.html",
    Modern  => "themes/modern.html",
}

macro_rules! sort_by_date_desc {
    ($opt:expr, $date_field:ident) => {
        if let Some(ref mut items) = $opt {
            items.sort_by(|a, b| b.$date_field.cmp(&a.$date_field));
        }
    };
}

#[derive(Serialize)]
pub struct RenderResponse {
    pub html: String,
    pub errors: Vec<ValidationError>,
}

pub async fn render_resume(
    Query(query): Query<RenderQuery>,
    Json(mut resume): Json<Resume>,
) -> Result<Json<RenderResponse>, AppError> {
    let errors = resume.validate();
    if !errors.is_empty() {
        tracing::warn!(?errors, "resume validation errors");
    }

    sort_by_date_desc!(resume.work, start_date);
    sort_by_date_desc!(resume.education, start_date);
    sort_by_date_desc!(resume.volunteer, start_date);
    sort_by_date_desc!(resume.projects, start_date);
    sort_by_date_desc!(resume.publications, release_date);
    sort_by_date_desc!(resume.awards, date);
    sort_by_date_desc!(resume.certificates, date);

    let t = translations_for(&query.locale);
    let html = render_themed(query.theme, resume, t)?;

    Ok(Json(RenderResponse { html, errors }))
}
