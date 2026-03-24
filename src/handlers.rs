use askama::Template;
use axum::{response::Html, Json};

use crate::resume::models::Resume;

#[derive(Template)]
#[template(path = "resume.html")]
struct ResumeTemplate {
    resume: Resume,
}

pub async fn render_resume(Json(mut resume): Json<Resume>) -> Html<String> {
    if let Some(ref mut work) = resume.work {
        work.sort_by(|a, b| b.start_date.cmp(&a.start_date));
    }
    if let Some(ref mut edu) = resume.education {
        edu.sort_by(|a, b| b.start_date.cmp(&a.start_date));
    }

    let template = ResumeTemplate { resume };
    Html(template.render().unwrap())
}
