use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("template render failed: {0}")]
    TemplateRender(#[from] askama::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        tracing::error!(%self, "internal error");
        StatusCode::INTERNAL_SERVER_ERROR.into_response()
    }
}
