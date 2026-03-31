use std::env;

use anyhow::Context;
use resumo::api::setup_http;
use tracing_subscriber::{EnvFilter, fmt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    setup_logging();
    let srv_port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let app = setup_http().await;

    let addr_port = format!("0.0.0.0:{}", srv_port);
    let listener = tokio::net::TcpListener::bind(&addr_port).await
        .with_context(|| format!("failed to bind to {addr_port}"))?;
    tracing::info!("Listening on http://{}", &addr_port);
    axum::serve(listener, app).await
        .context("HTTP server error")?;
    Ok(())
}

fn setup_logging() {
    fmt()
        .with_env_filter(EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()))
        .init();
}
