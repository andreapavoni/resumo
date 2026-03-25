use askama::Template;
use axum::{Json, extract::Query, response::Html};
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

        fn render_themed(theme: Theme, resume: Resume) -> String {
            match theme {
                $(Theme::$variant => $variant { resume }.render().unwrap(),)+
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
) -> Html<String> {
    if let Some(ref mut work) = resume.work {
        work.sort_by(|a, b| b.start_date.cmp(&a.start_date));
    }
    if let Some(ref mut edu) = resume.education {
        edu.sort_by(|a, b| b.start_date.cmp(&a.start_date));
    }

    Html(render_themed(query.theme, resume))
}
