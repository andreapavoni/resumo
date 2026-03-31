# Build backend
FROM rust:1-slim AS backend
WORKDIR /app
COPY . .
RUN cargo build --release --bin resumo

# Build frontend
FROM node:22-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Runtime
FROM bitnami/minideb:trixie
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    rm -rf /var/lib/apt/lists/*
RUN useradd -m resumo
USER resumo

WORKDIR /app
COPY --from=backend /app/target/release/resumo /usr/local/bin
COPY --from=frontend /app/static ./static
ENTRYPOINT ["/usr/local/bin/resumo"]
