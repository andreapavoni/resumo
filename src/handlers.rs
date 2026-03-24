use askama::Template;
use axum::{response::Html, Json};

use crate::models::Resume;

#[derive(Template)]
#[template(path = "resume.html")]
struct ResumeTemplate {
    resume: Resume,
}

pub async fn render_resume(Json(mut resume): Json<Resume>) -> Html<String> {
    if let Some(ref mut work) = resume.work {
        work.sort_by(|a, b| {
            b.start_date
                .as_deref()
                .unwrap_or("")
                .cmp(&a.start_date.as_deref().unwrap_or(""))
        });
    }
    if let Some(ref mut edu) = resume.education {
        edu.sort_by(|a, b| {
            b.start_date
                .as_deref()
                .unwrap_or("")
                .cmp(&a.start_date.as_deref().unwrap_or(""))
        });
    }

    let template = ResumeTemplate { resume };
    Html(template.render().unwrap())
}
