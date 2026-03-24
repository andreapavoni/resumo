use axum::{body::Body, http::Request, routing::post, Router};
use http_body_util::BodyExt;
use tower::ServiceExt;

fn app() -> Router {
    Router::new().route("/api/render", post(resumo::handlers::render_resume))
}

async fn post_render(json: &serde_json::Value) -> (u16, String) {
    let body = serde_json::to_string(json).unwrap();
    let req = Request::post("/api/render")
        .header("content-type", "application/json")
        .body(Body::from(body))
        .unwrap();
    let resp = app().oneshot(req).await.unwrap();
    let status = resp.status().as_u16();
    let bytes = resp.into_body().collect().await.unwrap().to_bytes();
    (status, String::from_utf8(bytes.to_vec()).unwrap())
}

#[tokio::test]
async fn empty_resume_returns_200() {
    let (status, html) = post_render(&serde_json::json!({})).await;
    assert_eq!(status, 200);
    assert!(html.contains(r#"<article class="resume">"#));
}

#[tokio::test]
async fn renders_basics_name() {
    let (status, html) = post_render(&serde_json::json!({
        "basics": { "name": "Jane Doe", "label": "Engineer" }
    }))
    .await;
    assert_eq!(status, 200);
    assert!(html.contains("<h1>Jane Doe</h1>"));
    assert!(html.contains("Engineer"));
}

#[tokio::test]
async fn renders_contact_info() {
    let (_, html) = post_render(&serde_json::json!({
        "basics": {
            "email": "jane@example.com",
            "phone": "+1 555 1234"
        }
    }))
    .await;
    assert!(html.contains("mailto:jane@example.com"));
    assert!(html.contains("tel:+1 555 1234"));
}

#[tokio::test]
async fn renders_location() {
    let (_, html) = post_render(&serde_json::json!({
        "basics": {
            "location": { "city": "Portland", "region": "OR", "countryCode": "US" }
        }
    }))
    .await;
    assert!(html.contains("Portland"));
    assert!(html.contains("OR"));
    assert!(html.contains("US"));
}

#[tokio::test]
async fn work_entries_sorted_by_date_descending() {
    let (_, html) = post_render(&serde_json::json!({
        "work": [
            { "position": "Junior", "startDate": "2018-06" },
            { "position": "Senior", "startDate": "2022-01" },
            { "position": "Mid", "startDate": "2020-03" }
        ]
    }))
    .await;
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
    let (_, html) = post_render(&serde_json::json!({
        "education": [
            { "institution": "Early College", "startDate": "2010-09" },
            { "institution": "Recent University", "startDate": "2020-09" }
        ]
    }))
    .await;
    let recent_pos = html.find("Recent University").unwrap();
    let early_pos = html.find("Early College").unwrap();
    assert!(
        recent_pos < early_pos,
        "Education entries should be sorted newest first"
    );
}

#[tokio::test]
async fn missing_dates_sort_to_end() {
    let (_, html) = post_render(&serde_json::json!({
        "work": [
            { "position": "NoDate" },
            { "position": "Dated", "startDate": "2023-01" }
        ]
    }))
    .await;
    let dated_pos = html.find("Dated").unwrap();
    let nodate_pos = html.find("NoDate").unwrap();
    assert!(
        dated_pos < nodate_pos,
        "Entries without dates should appear after dated entries"
    );
}

#[tokio::test]
async fn renders_skills_with_keywords() {
    let (_, html) = post_render(&serde_json::json!({
        "skills": [
            { "name": "Languages", "keywords": ["Rust", "TypeScript", "Python"] }
        ]
    }))
    .await;
    assert!(html.contains("Languages"));
    assert!(html.contains("Rust"));
    assert!(html.contains("TypeScript"));
    assert!(html.contains("Python"));
}

#[tokio::test]
async fn renders_work_highlights() {
    let (_, html) = post_render(&serde_json::json!({
        "work": [{
            "position": "Engineer",
            "highlights": ["Built the thing", "Shipped the feature"]
        }]
    }))
    .await;
    assert!(html.contains("<li>Built the thing</li>"));
    assert!(html.contains("<li>Shipped the feature</li>"));
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
