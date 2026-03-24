use axum::{routing::get, routing::post, Router};
use tower_http::services::ServeDir;

mod handlers;
mod models;

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(handlers::editor_page))
        .route("/preview", post(handlers::preview))
        .route("/entry/add", post(handlers::add_entry))
        .route("/entry/remove", post(handlers::remove_entry))
        .route("/export.json", post(handlers::export_json))
        .nest_service("/static", ServeDir::new("static"));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("Listening on http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}
