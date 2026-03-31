use askama::Template;
use axum::{Json, extract::Query};
use serde::{Deserialize, Serialize};

use crate::{
    api::error::AppError,
    i18n::{Locale, Translations, translations_for},
    resume::{models::Resume, validate::ValidationError},
};

/// Available resume themes. Passed as a `?theme=` query parameter.
#[derive(Debug, Clone, Copy, Default, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    /// Single-column classic layout. Default.
    #[default]
    Classic,
    /// Two-column layout with a sidebar.
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

/// Response body for `POST /api/render`.
///
/// Always returns `200 OK` — errors are embedded in the response rather than
/// mapped to HTTP error codes so the frontend can display the live preview
/// alongside any validation messages.
#[derive(Serialize)]
pub struct RenderResponse {
    /// Rendered HTML fragment for the resume.
    pub html: String,
    /// Validation errors found in the submitted resume. Empty when valid.
    pub errors: Vec<ValidationError>,
}

/// Renders a JSON Resume document to HTML.
///
/// Accepts an optional `?theme=` query parameter (defaults to `classic`) and
/// an optional `?locale=` parameter (defaults to `en`).
///
/// Entries in date-bearing sections (`work`, `education`, `volunteer`, `projects`,
/// `publications`, `awards`, `certificates`) are sorted newest-first before rendering.
///
/// Validation runs alongside rendering; both results are returned in the response
/// regardless of whether errors were found.
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
