# ===========================
# Stage 1: Frontend Build
# ===========================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend-react/package*.json ./
RUN npm ci
COPY frontend-react/ .
RUN npm run build

# ===========================
# Stage 2: Backend Build
# ===========================
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app/backend

# Install necessary build tools for CGO (SQLite)
RUN apk add --no-cache gcc musl-dev

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .
# Build Linux binary
RUN CGO_ENABLED=1 GOOS=linux go build -o server ./cmd/server/main.go

# ===========================
# Stage 3: Runtime
# ===========================
FROM python:3.11-alpine
WORKDIR /app

# Install Runtime Dependencies
# - ffmpeg: for yt-dlp media handling
# - yt-dlp: via pip
# - ca-certificates: for HTTPS
RUN apk add --no-cache ffmpeg ca-certificates && \
    pip install --no-cache-dir yt-dlp

# Create non-root user
RUN addgroup -S streamflow && adduser -S streamflow -G streamflow

# Copy Frontend Build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy Backend Binary
COPY --from=backend-builder /app/backend/server /app/server

# Setup Permissions
RUN chown -R streamflow:streamflow /app

USER streamflow

EXPOSE 8000

CMD ["/app/server"]
