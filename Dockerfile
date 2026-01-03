# StreamFlow Docker Image - Unified Backend + Frontend
# Multi-stage build for smaller image size

# ====================
# Stage 1: Dependencies
# ====================
FROM python:3.11-slim AS builder
WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies to wheels
COPY backend/requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# ====================
# Stage 2: Runtime
# ====================
FROM python:3.11-slim
WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r streamflow && useradd -r -g streamflow -d /app -s /sbin/nologin streamflow

# Install Python dependencies from wheels (faster)
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

# Install Playwright browsers (needed for scraping)
RUN playwright install chromium && playwright install-deps chromium

# Copy backend code
COPY backend/ .

# Create data directory with correct ownership
RUN mkdir -p /app/data && chown -R streamflow:streamflow /app

# Switch to non-root user
USER streamflow

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health || exit 1

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

