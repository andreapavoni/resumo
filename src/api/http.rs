use axum::{Router, routing::post};
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer};
use tracing::Level;

pub async fn setup_http() -> Router {
    Router::new()
        .route("/api/render", post(super::handlers::render_resume))
        .route_service("/app", ServeFile::new("static/app.html"))
        .fallback_service(ServeDir::new("static").fallback(ServeFile::new("static/app.html")))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                .on_response(DefaultOnResponse::new().level(Level::INFO)),
        )
}
