# Build backend
FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin resumo

# Build frontend
FROM node:22-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Final runtime
FROM bitnami/minideb:trixie
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*
RUN useradd -m resumo
USER resumo

WORKDIR /app
COPY --from=builder /app/target/release/resumo /usr/local/bin
COPY --from=frontend /app/static ./static
ENTRYPOINT ["/usr/local/bin/resumo"]
