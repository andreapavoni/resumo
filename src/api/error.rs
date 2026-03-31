use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

/// Application-level errors that can occur during request handling.
///
/// Implements [`axum::response::IntoResponse`]: each variant maps to an HTTP
/// status code and logs the error before responding, so handler code can use
/// `?` directly without manual logging or status conversion.
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    /// An [Askama](https://docs.rs/askama) template failed to render.
    /// Results in a `500 Internal Server Error`.
    #[error("template render failed: {0}")]
    TemplateRender(#[from] askama::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!(%self, "internal error");
        StatusCode::INTERNAL_SERVER_ERROR.into_response()
    }
}
