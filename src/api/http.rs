use std::env;

use anyhow::{Context, Result};
use axum::{Router, http::{header, HeaderValue}, routing::post};
use tower::ServiceBuilder;
use tower_http::compression::CompressionLayer;
use tower_http::services::{ServeDir, ServeFile};
use tower_http::set_header::SetResponseHeaderLayer;
use tower_http::trace::{DefaultMakeSpan, DefaultOnResponse, TraceLayer};
use tracing::Level;

/// Starts the HTTP server and blocks until it exits.
///
/// Routes:
/// - `POST /api/render` — render a JSON Resume document (see [`super::handlers::render_resume`])
/// - `GET /app` — serves the editor SPA entry point
/// - `GET /assets/*` — hashed static assets with long-term immutable caching
/// - Everything else — served from the `static/` directory, falling back to the SPA
///
/// The bind address is `0.0.0.0:{PORT}` where `PORT` is read from the environment
/// (defaults to `3000`).
pub async fn start() -> Result<()> {
    // Hashed assets (/assets/*) get a 1-year immutable cache: content-addressed
    // filenames mean the URL changes whenever the content changes, so browsers
    // can safely cache them forever.
    let assets = ServiceBuilder::new()
        .layer(SetResponseHeaderLayer::if_not_present(
            header::CACHE_CONTROL,
            HeaderValue::from_static("public, max-age=31536000, immutable"),
        ))
        .service(ServeDir::new("static/assets"));

    let router = Router::new()
        .route("/api/render", post(super::handlers::render_resume))
        .route_service("/app", ServeFile::new("static/app.html"))
        .nest_service("/assets", assets)
        .fallback_service(ServeDir::new("static").fallback(ServeFile::new("static/app.html")))
        .layer(
            ServiceBuilder::new()
                // Compress responses with gzip when the client supports it.
                .layer(CompressionLayer::new())
                // HTML files and API responses get no-cache so browsers always
                // revalidate. The /assets/ service sets its own header first, so
                // if_not_present leaves those responses untouched.
                .layer(SetResponseHeaderLayer::if_not_present(
                    header::CACHE_CONTROL,
                    HeaderValue::from_static("no-cache"),
                ))
                .layer(
                    TraceLayer::new_for_http()
                        .make_span_with(DefaultMakeSpan::new().level(Level::INFO))
                        .on_response(DefaultOnResponse::new().level(Level::INFO)),
                ),
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
