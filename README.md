# StreamFlow - Premium Cinema Experience 🎬

[![Docker Image](https://img.shields.io/docker/v/vndangkhoa/streamflow?label=DockerHub&logo=docker)](https://hub.docker.com/r/vndangkhoa/streamflow)
[![GitHub](https://img.shields.io/github/v/release/vndangkhoa/Streamflow?label=GitHub&logo=github)](https://github.com/vndangkhoa/Streamflow)

StreamFlow is a high-fidelity movie streaming application designed for NAS enthusiasts and home cinema lovers. It combines a premium **Apple TV+ inspired aesthetic** with a lightweight, high-performance backend, now consolidated into a **single Docker image** for effortless deployment.

---

## 💎 Premium Features

### 🧊 Liquid Glass UI
- **Immersive Design**: Deep frosted-glass effects (40px+ blur) with Apple-style deep occlusion.
- **Micro-interactions**: 1px translucent borders, 3D card scaling, and smooth state transitions.
- **Cinematic Hero**: Dynamic full-screen backdrops that change based on featured content.
- **Dark Mode Perfected**: A custom OLED-friendly palette optimized for theater viewing.

### 📱 Native PWA Experience
- **Installable**: Full Progressive Web App (PWA) support. Add to Home Screen on iOS and Android.
- **Native Feel**: Runs in standalone mode without browser chrome for a truly native app experience.
- **Custom Icons**: High-resolution 'Liquid Glass' app icons for your home screen.

### 🐳 Unified NAS Architecture
- **Single-Container Deployment**: Backend and Frontend are bundled into one efficient image.
- **Low Overhead**: Zero-bypass streaming shifts heavy video load 100% to the client side.
- **NAS-Optimized**: Designed to run smoothly on Synology, QNAP, and Unraid (linux/amd64).

### 🍅 Rich Metadata
- **Rotten Tomatoes Ratings**: Real-time integration of "Fresh" and "Rotten" score badges.
- **Smart Catalog**: Automatically categories Phim Lẻ, Phim Bộ, Hoạt Hình, and Cinema releases.
- **Watch History**: Cross-device history and "My List" bookmarks saved to Redis.

---

## � One-Step Deployment

Copy this into your `docker-compose.yml` and run `docker-compose up -d`:

```yaml
version: '3.8'

services:
  # StreamFlow Unified (Backend + Frontend)
  app:
    image: vndangkhoa/streamflow:latest
    platform: linux/amd64
    ports:
      - "3478:8000"
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=sqlite:///./data/streamflow.db
      - PYTHONUNBUFFERED=1
    volumes:
      - ./backend/data:/app/data
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped

  # Redis Cache & History
  redis:
    image: redis:7-alpine
    platform: linux/amd64
    ports:
      - "6379:6379"
    volumes:
      - ./redis-data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5
```

### 🏁 Accessing the App
- **UI & API**: [http://localhost:3478](http://localhost:3478)
- **API Docs**: [http://localhost:3478/docs](http://localhost:3478/docs)

---

## 🛠 Tech Stack
- **Backend**: FastAPI (Python 3.11), SQLAlchemy, Redis
- **Frontend**: Vanilla JS (ES6+), Vite, ArtPlayer.js
- **Scraping**: Defensive `aiohttp` & `yt-dlp` integration
- **Deployment**: Multi-stage Docker Build (Alpine/Debian-slim)

## 📝 Credits
Movie data provided by `ophim` API.
Designed with ❤️ by [vndangkhoa](https://github.com/vndangkhoa).

---

> [!TIP]
> **Synology Tip**: Use the **Container Manager** (formerly Docker) on Synology. Create a new "Project" using the YAML above for the best management experience.
