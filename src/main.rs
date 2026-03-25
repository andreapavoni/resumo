use axum::{routing::post, Router};
use tower_http::services::{ServeDir, ServeFile};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/api/render", post(resumo::handlers::render_resume))
        .route_service("/app", ServeFile::new("static/app.html"))
        .fallback_service(ServeDir::new("static").fallback(ServeFile::new("static/app.html")));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    println!("Listening on http://127.0.0.1:3000");
    axum::serve(listener, app).await.unwrap();
}
