# StreamFlow V2

StreamFlow is a high-performance video streaming web application featuring a pure Go backend and a modern React + Tailwind frontend.

## 🚀 Features

- **Modern UI**: Built with React, TypeScript, and Tailwind CSS for a premium, responsive experience.
- **High Performance**: Backend written in Go (Golang) for speed and concurrency.
- **Smart Scraping**: Integrated scraping engine (Rophim) with automated episode extraction.
- **HLS Streaming**: Native HLS playback support.
- **Docker Ready**: Multi-stage Docker build for optimized deployment.

## 🛠️ Tech Stack

- **Backend**: Go (Chi Router, GORM, GoQuery)
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Database**: SQLite
- **Deployment**: Docker

## 📦 Installation

### Prerequisites

- Go 1.22+
- Node.js 20+
- Docker (optional)

### Local Development

1. **Backend**
   ```bash
   cd backend
   go mod tidy
   go run ./cmd/server/main.go
   ```
   Server runs at `http://localhost:8000`.

2. **Frontend**
   ```bash
   cd frontend-react
   npm install
   npm run dev
   ```
   Frontend runs at `http://localhost:5173` (proxying to backend).

### Docker Deployment

```bash
docker-compose up -d --build
```
Access the application at `http://localhost:8000`.

## 📂 Project Structure

- `backend/` - Go source code
- `frontend-react/` - React source code
- `Dockerfile` - Multi-stage build definition
- `docker-compose.yml` - Deployment configuration

## 📝 License

MIT
