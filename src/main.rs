use axum::{Router, routing::post};
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer};
use tracing::Level;
use tracing_subscriber::{EnvFilter, fmt};

#[tokio::main]
async fn main() {
    fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();

    let app = Router::new()
        .route("/api/render", post(resumo::handlers::render_resume))
        .route_service("/app", ServeFile::new("static/app.html"))
        .fallback_service(ServeDir::new("static").fallback(ServeFile::new("static/app.html")))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                .on_response(DefaultOnResponse::new().level(Level::INFO)),
        );

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("Listening on http://0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}
