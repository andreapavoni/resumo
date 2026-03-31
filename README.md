# Resumo

A fast, lightweight, ATS-friendly resume builder. Semantic HTML output, browser-native PDF export via Print.

**[TRY IT](https://resumo.funky.studio)**

## Tech Stack

- **Backend:** Rust, Axum, Askama (server-side HTML rendering)
- **Frontend:** Preact, HTM, TypeScript, Vite
- **Data format:** [JSON Resume](https://jsonresume.org/) schema

## Architecture

The frontend (Preact SPA) manages all form state and UI. The backend is a stateless JSON API that accepts a JSON Resume object and returns rendered semantic HTML.

```
POST /api/render  — JSON Resume in, HTML fragment out
GET  /*            — Serves the SPA
```

## Development

Requires Rust (1.85+) and Node.js (18+).

```bash
# Terminal 1: Backend
cargo run

# Terminal 2: Frontend (with HMR)
cd frontend && npm install && npm run dev
```

Open http://localhost:5173 — Vite proxies `/api` requests to the Rust server on port 3000.

## Production Build

```bash
cd frontend && npm run build   # outputs to ../static/
cargo build --release
./target/release/resumo        # serves everything on http://127.0.0.1:3000
```

## Tests

```bash
cargo test
```
