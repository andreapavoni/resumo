//! Resumo — a minimalist resume builder with [JSON Resume](https://jsonresume.org) compatibility.
//!
//! Provides an HTTP API (`POST /api/render`) that accepts a JSON Resume document,
//! validates it, and returns rendered HTML along with any validation errors.

pub mod api;
pub mod i18n;
pub mod resume;
