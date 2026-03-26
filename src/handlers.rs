use askama::Template;
use axum::{Json, extract::Query, http::StatusCode, response::Html};
use serde::Deserialize;

use crate::resume::models::Resume;

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
}

macro_rules! theme_templates {
    ($($variant:ident => $path:literal),+ $(,)?) => {
        $(
            #[derive(Template)]
            #[template(path = $path)]
            struct $variant { resume: Resume }
        )+

        fn render_themed(theme: Theme, resume: Resume) -> Result<String, askama::Error> {
            match theme {
                $(Theme::$variant => $variant { resume }.render(),)+
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

    render_themed(query.theme, resume).map(Html).map_err(|err| {
        tracing::error!(%err, "template render failed");
        StatusCode::INTERNAL_SERVER_ERROR
    })
}
