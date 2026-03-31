use std::env;

use anyhow::{Context, Result};
use axum::{Router, routing::post};
use tower_http::services::{ServeDir, ServeFile};
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer};
use tracing::Level;

pub async fn start() -> Result<()> {
    let router = Router::new()
        .route("/api/render", post(super::handlers::render_resume))
        .route_service("/app", ServeFile::new("static/app.html"))
        .fallback_service(ServeDir::new("static").fallback(ServeFile::new("static/app.html")))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                .on_response(DefaultOnResponse::new().level(Level::INFO)),
        );

    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .with_context(|| format!("failed to bind to {addr}"))?;

    tracing::info!("Listening on http://{}", &addr);
    axum::serve(listener, router)
        .await
        .context("HTTP server error")?;
    Ok(())
}
