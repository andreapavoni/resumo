use axum::{Router, body::Body, http::Request, routing::post};
use http_body_util::BodyExt;
use tower::ServiceExt;

fn app() -> Router {
    Router::new().route("/api/render", post(resumo::api::handlers::render_resume))
}

#[derive(serde::Deserialize)]
struct RenderResponse {
    html: String,
    errors: Vec<ValidationError>,
}

#[derive(serde::Deserialize)]
struct ValidationError {
    field: String,
    code: String,
}

async fn post_render(json: &serde_json::Value) -> (u16, RenderResponse) {
    post_render_themed(json, "classic").await
}

async fn post_render_themed(json: &serde_json::Value, theme: &str) -> (u16, RenderResponse) {
    let body = serde_json::to_string(json).unwrap();
    let req = Request::post(format!("/api/render?theme={theme}"))
        .header("content-type", "application/json")
        .body(Body::from(body))
        .unwrap();
    let resp = app().oneshot(req).await.unwrap();
    let status = resp.status().as_u16();
    let bytes = resp.into_body().collect().await.unwrap().to_bytes();
    let response: RenderResponse = serde_json::from_slice(&bytes).unwrap();
    (status, response)
}

#[tokio::test]
async fn empty_resume_returns_200() {
    let (status, resp) = post_render(&serde_json::json!({})).await;
    assert_eq!(status, 200);
    assert!(resp.html.contains(r#"<article class="resume">"#));
    assert!(resp.errors.is_empty());
}

#[tokio::test]
async fn renders_basics_name() {
    let (status, resp) = post_render(&serde_json::json!({
        "basics": { "name": "Jane Doe", "label": "Engineer" }
    }))
    .await;
    assert_eq!(status, 200);
    assert!(resp.html.contains("<h1>Jane Doe</h1>"));
    assert!(resp.html.contains("Engineer"));
}

#[tokio::test]
async fn renders_contact_info() {
    let (_, resp) = post_render(&serde_json::json!({
        "basics": {
            "email": "jane@example.com",
            "phone": "+1 555 1234"
        }
    }))
    .await;
    assert!(resp.html.contains("mailto:jane@example.com"));
    assert!(resp.html.contains("tel:+1 555 1234"));
}

#[tokio::test]
async fn renders_location() {
    let (_, resp) = post_render(&serde_json::json!({
        "basics": {
            "location": { "city": "Portland", "region": "OR", "countryCode": "US" }
        }
    }))
    .await;
    assert!(resp.html.contains("Portland"));
    assert!(resp.html.contains("OR"));
    assert!(resp.html.contains("US"));
}

#[tokio::test]
async fn work_entries_sorted_by_date_descending() {
    let (_, resp) = post_render(&serde_json::json!({
        "work": [
            { "position": "Junior", "startDate": "2018-06" },
            { "position": "Senior", "startDate": "2022-01" },
            { "position": "Mid", "startDate": "2020-03" }
        ]
    }))
    .await;
    let html = &resp.html;
    let senior_pos = html.find("Senior").unwrap();
    let mid_pos = html.find("Mid").unwrap();
    let junior_pos = html.find("Junior").unwrap();
    assert!(
        senior_pos < mid_pos && mid_pos < junior_pos,
        "Work entries should be sorted newest first"
    );
}

#[tokio::test]
async fn education_entries_sorted_by_date_descending() {
    let (_, resp) = post_render(&serde_json::json!({
        "education": [
            { "institution": "Early College", "startDate": "2010-09" },
            { "institution": "Recent University", "startDate": "2020-09" }
        ]
    }))
    .await;
    let html = &resp.html;
    let recent_pos = html.find("Recent University").unwrap();
    let early_pos = html.find("Early College").unwrap();
    assert!(
        recent_pos < early_pos,
        "Education entries should be sorted newest first"
    );
}

#[tokio::test]
async fn missing_dates_sort_to_end() {
    let (_, resp) = post_render(&serde_json::json!({
        "work": [
            { "position": "NoDate" },
            { "position": "Dated", "startDate": "2023-01" }
        ]
    }))
    .await;
    let html = &resp.html;
    let dated_pos = html.find("Dated").unwrap();
    let nodate_pos = html.find("NoDate").unwrap();
    assert!(
        dated_pos < nodate_pos,
        "Entries without dates should appear after dated entries"
    );
}

#[tokio::test]
async fn renders_skills_with_keywords() {
    let (_, resp) = post_render(&serde_json::json!({
        "skills": [
            { "name": "Languages", "keywords": ["Rust", "TypeScript", "Python"] }
        ]
    }))
    .await;
    assert!(resp.html.contains("Languages"));
    assert!(resp.html.contains("Rust"));
    assert!(resp.html.contains("TypeScript"));
    assert!(resp.html.contains("Python"));
}

#[tokio::test]
async fn renders_work_highlights() {
    let (_, resp) = post_render(&serde_json::json!({
        "work": [{
            "position": "Engineer",
            "highlights": ["Built the thing", "Shipped the feature"]
        }]
    }))
    .await;
    assert!(resp.html.contains("<li>Built the thing</li>"));
    assert!(resp.html.contains("<li>Shipped the feature</li>"));
}

#[tokio::test]
async fn dates_display_human_readable() {
    let (_, resp) = post_render(&serde_json::json!({
        "work": [{
            "position": "Engineer",
            "startDate": "2022-11",
            "endDate": "2024-03"
        }]
    }))
    .await;
    assert!(
        resp.html.contains("Nov 2022"),
        "Start date should display as 'Nov 2022'"
    );
    assert!(
        resp.html.contains("Mar 2024"),
        "End date should display as 'Mar 2024'"
    );
}

#[tokio::test]
async fn missing_end_date_shows_present() {
    let (_, resp) = post_render(&serde_json::json!({
        "work": [{
            "position": "Engineer",
            "startDate": "2023-01"
        }]
    }))
    .await;
    assert!(resp.html.contains("Jan 2023"));
    assert!(resp.html.contains("Present"));
}

#[tokio::test]
async fn renders_profile_image() {
    let (_, resp) = post_render(&serde_json::json!({
        "basics": {
            "name": "Jane",
            "image": "data:image/png;base64,abc123"
        }
    }))
    .await;
    assert!(resp.html.contains(r#"<img class="resume-photo""#));
    assert!(resp.html.contains("data:image/png;base64,abc123"));
}

#[tokio::test]
async fn modern_theme_returns_200() {
    let (status, resp) = post_render_themed(
        &serde_json::json!({
            "basics": { "name": "Jane Doe", "label": "Engineer" }
        }),
        "modern",
    )
    .await;
    assert_eq!(status, 200);
    assert!(resp.html.contains("Jane Doe"));
    assert!(
        resp.html.contains("sidebar"),
        "Modern theme should have a sidebar"
    );
}

#[tokio::test]
async fn modern_theme_renders_skills_as_pills() {
    let (_, resp) = post_render_themed(
        &serde_json::json!({
            "skills": [{ "name": "Languages", "keywords": ["Rust", "Python"] }]
        }),
        "modern",
    )
    .await;
    assert!(resp.html.contains(r#"class="pill""#));
    assert!(resp.html.contains("Rust"));
}

#[tokio::test]
async fn invalid_json_returns_error() {
    let req = Request::post("/api/render")
        .header("content-type", "application/json")
        .body(Body::from("not json"))
        .unwrap();
    let resp = app().oneshot(req).await.unwrap();
    assert!(resp.status().is_client_error());
}

// --- Validation tests ---

#[tokio::test]
async fn validates_invalid_email() {
    let (status, resp) = post_render(&serde_json::json!({
        "basics": { "email": "not-an-email" }
    }))
    .await;
    assert_eq!(status, 200);
    assert!(!resp.html.is_empty(), "Should still render HTML");
    assert_eq!(resp.errors.len(), 1);
    assert_eq!(resp.errors[0].field, "basics.email");
}

#[tokio::test]
async fn validates_invalid_url() {
    let (status, resp) = post_render(&serde_json::json!({
        "basics": { "url": "not-a-url" }
    }))
    .await;
    assert_eq!(status, 200);
    assert!(!resp.html.is_empty());
    assert_eq!(resp.errors.len(), 1);
    assert_eq!(resp.errors[0].field, "basics.url");
}

#[tokio::test]
async fn validates_work_url() {
    let (_, resp) = post_render(&serde_json::json!({
        "work": [{ "url": "ftp://invalid" }]
    }))
    .await;
    assert_eq!(resp.errors.len(), 1);
    assert_eq!(resp.errors[0].field, "work[0].url");
}

#[tokio::test]
async fn validates_end_date_before_start_date() {
    let (status, resp) = post_render(&serde_json::json!({
        "work": [{
            "position": "Engineer",
            "startDate": "2024-06",
            "endDate": "2023-01"
        }]
    }))
    .await;
    assert_eq!(status, 200);
    assert!(!resp.html.is_empty(), "Should still render HTML despite errors");
    assert_eq!(resp.errors.len(), 1);
    assert_eq!(resp.errors[0].field, "work[0].endDate");
    assert_eq!(resp.errors[0].code, "end_date_before_start");
}

#[tokio::test]
async fn valid_resume_has_no_errors() {
    let (_, resp) = post_render(&serde_json::json!({
        "basics": {
            "email": "jane@example.com",
            "url": "https://example.com"
        },
        "work": [{
            "url": "https://company.com",
            "startDate": "2020-01",
            "endDate": "2024-01"
        }]
    }))
    .await;
    assert!(resp.errors.is_empty(), "Valid resume should have no errors");
}

#[tokio::test]
async fn multiple_validation_errors() {
    let (_, resp) = post_render(&serde_json::json!({
        "basics": {
            "email": "bad",
            "url": "bad"
        },
        "work": [{ "url": "bad" }]
    }))
    .await;
    assert_eq!(resp.errors.len(), 3);
}

#[tokio::test]
async fn validates_end_date_without_start_date() {
    let (status, resp) = post_render(&serde_json::json!({
        "work": [{
            "position": "Engineer",
            "endDate": "2023-06"
        }]
    }))
    .await;
    assert_eq!(status, 200);
    assert!(!resp.html.is_empty(), "Should still render HTML despite errors");
    assert_eq!(resp.errors.len(), 1);
    assert_eq!(resp.errors[0].field, "work[0].endDate");
    assert_eq!(resp.errors[0].code, "end_date_without_start");
}

#[tokio::test]
async fn validates_url_without_host() {
    let (_, resp) = post_render(&serde_json::json!({
        "basics": { "url": "https://" }
    }))
    .await;
    assert_eq!(resp.errors.len(), 1);
    assert_eq!(resp.errors[0].field, "basics.url");
    assert_eq!(resp.errors[0].code, "invalid_url");
}
