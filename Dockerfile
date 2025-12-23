# --- Stage 1: Build Frontend ---
FROM node:20-slim AS frontend-builder
WORKDIR /build-frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Final Image ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
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
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers (needed for scraping)
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy Backend code
COPY backend/ .

# Copy built Frontend to Backend's static directory
COPY --from=frontend-builder /build-frontend/dist ./static

# Create data directory for persistence
RUN mkdir -p /app/data

# Expose port (Unified: both API and Frontend)
EXPOSE 8000

# Start unified app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
