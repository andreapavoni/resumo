use askama::Template;
use axum::{Json, extract::Query, http::StatusCode, response::Html};
use serde::Deserialize;

use crate::i18n::{Translations, translations_for};
use crate::resume::models::Resume;

#[derive(Debug, Clone, Copy, Default, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    #[default]
    Classic,
    Modern,
}

fn default_locale() -> String {
    "en".to_string()
}

#[derive(Deserialize)]
pub struct RenderQuery {
    #[serde(default)]
    pub theme: Theme,
    #[serde(default = "default_locale")]
    pub locale: String,
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

pub async fn render_resume(
    Query(query): Query<RenderQuery>,
    Json(mut resume): Json<Resume>,
) -> Result<Html<String>, StatusCode> {
    if let Some(ref mut work) = resume.work {
        work.sort_by(|a, b| b.start_date.cmp(&a.start_date));
    }
    if let Some(ref mut edu) = resume.education {
        edu.sort_by(|a, b| b.start_date.cmp(&a.start_date));
    }
    if let Some(ref mut vol) = resume.volunteer {
        vol.sort_by(|a, b| b.start_date.cmp(&a.start_date));
    }
    if let Some(ref mut proj) = resume.projects {
        proj.sort_by(|a, b| b.start_date.cmp(&a.start_date));
    }
    if let Some(ref mut pubs) = resume.publications {
        pubs.sort_by(|a, b| b.release_date.cmp(&a.release_date));
    }
    if let Some(ref mut awards) = resume.awards {
        awards.sort_by(|a, b| b.date.cmp(&a.date));
    }
    if let Some(ref mut certs) = resume.certificates {
        certs.sort_by(|a, b| b.date.cmp(&a.date));
    }

    let t = translations_for(&query.locale);
    render_themed(query.theme, resume, t).map(Html).map_err(|err| {
        tracing::error!(%err, "template render failed");
        StatusCode::INTERNAL_SERVER_ERROR
    })
}
