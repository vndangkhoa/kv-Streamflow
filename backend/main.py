"""
StreamFlow Backend - FastAPI Application
High-performance video streaming with ophim integration

Refactored with modular router architecture for maintainability.
"""
import os
import time
from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse, Response

from config import settings
from logging_config import setup_logging, get_logger
from cache import cache
from video_extractor import extractor, VideoInfo
from database import init_db, get_db
from security import verify_hmac, BodyCacheMiddleware
from image_service import get_proxied_image

# Import routers
from routers import videos, admin, catalog
from models.schemas import ExtractRequest, ExtractResponse

# Setup logging
logger = setup_logging(debug=settings.debug)

# Initialize FastAPI app
app = FastAPI(
    title="StreamFlow API",
    description="Premium video streaming with movie catalog",
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add body cache middleware for HMAC verification
app.add_middleware(BodyCacheMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(videos.router)
app.include_router(admin.router)
app.include_router(catalog.router)

# Get module logger
log = get_logger("main")


# ====================
# Startup/Shutdown
# ====================

@app.on_event("startup")
async def startup():
    """Initialize application resources"""
    init_db()
    log.info("Database initialized")
    log.info(f"StreamFlow v{settings.app_version} started")
    log.info(f"Cache type: {'Redis' if cache.is_redis else 'In-Memory'}")


# ====================
# Core API Endpoints
# ====================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "cache_type": "redis" if cache.is_redis else "memory",
        "version": settings.app_version
    }


@app.get("/api/images/proxy")
async def proxy_image(url: str, width: int = None):
    """Proxy and optimize images (WebP + Resizing)"""
    response = await get_proxied_image(url, width)
    if not response:
        raise HTTPException(status_code=404, detail="Image not found or could not be processed")
    return response


@app.post("/api/extract", response_model=ExtractResponse)
async def extract_video(request: ExtractRequest, authorized: bool = Depends(verify_hmac)):
    """
    Extract video stream URL from source.
    Uses cache-aside pattern with configurable TTL.
    """
    start_time = time.time()
    
    # Check cache first
    cached_data = cache.get(f"video:{request.url}")
    if cached_data:
        extraction_time = int((time.time() - start_time) * 1000)
        return ExtractResponse(
            title=cached_data['title'],
            thumbnail=cached_data['thumbnail'],
            duration=cached_data['duration'],
            stream_url=cached_data['stream_url'],
            resolution=cached_data['resolution'],
            cached=True,
            extraction_time_ms=extraction_time
        )
    
    # Cache miss - extract with yt-dlp
    try:
        video_info = await extractor.extract(request.url, request.quality)
        
        # Cache the result
        cache.set(f"video:{request.url}", {
            'title': video_info.title,
            'thumbnail': video_info.thumbnail,
            'duration': video_info.duration,
            'stream_url': video_info.stream_url,
            'resolution': video_info.resolution,
        })
        
        extraction_time = int((time.time() - start_time) * 1000)
        
        return ExtractResponse(
            title=video_info.title,
            thumbnail=video_info.thumbnail,
            duration=video_info.duration,
            stream_url=video_info.stream_url,
            resolution=video_info.resolution,
            cached=False,
            extraction_time_ms=extraction_time
        )
        
    except Exception as e:
        log.error(f"Extraction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.get("/api/qualities")
async def get_qualities(url: str, authorized: bool = Depends(verify_hmac)):
    """Get available quality options for a video"""
    try:
        qualities = await extractor.get_available_qualities(url)
        return {"qualities": qualities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/search")
async def search_videos(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    db=Depends(get_db),
    authorized: bool = Depends(verify_hmac)
):
    """Search videos by title in local library"""
    from database import VideoRepository
    repo = VideoRepository(db)
    return repo.search(q, limit)


# ====================
# Static Files Serving
# ====================

frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "static"))
log.debug(f"Frontend path: {frontend_path}, exists: {os.path.exists(frontend_path)}")

if os.path.exists(frontend_path):
    log.info(f"Serving frontend from {frontend_path}")
    
    # Mount asset directories
    for folder in ["assets", "icons", "scripts", "styles", "js", "public"]:
        folder_path = os.path.join(frontend_path, folder)
        if os.path.exists(folder_path):
            app.mount(f"/{folder}", StaticFiles(directory=folder_path), name=folder)
            log.debug(f"Mounted /{folder}")
    
    @app.get("/manifest.json")
    async def serve_manifest():
        return FileResponse(os.path.join(frontend_path, "manifest.json"))

    @app.get("/sw.js")
    async def serve_sw():
        response = FileResponse(os.path.join(frontend_path, "sw.js"))
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response

    @app.get("/favicon.ico")
    async def serve_favicon():
        favicon = os.path.join(frontend_path, "favicon.ico")
        if os.path.exists(favicon):
            return FileResponse(favicon)
        return Response(status_code=204)

    @app.get("/download")
    @app.get("/download.html")
    async def serve_download():
        return FileResponse(os.path.join(frontend_path, "download.html"))

    @app.get("/watch")
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Check if it's a file request
        requested_file = os.path.join(frontend_path, full_path)
        if "." in full_path and os.path.exists(requested_file):
            return FileResponse(requested_file)
        
        # Serve index.html for SPA routing
        response = FileResponse(os.path.join(frontend_path, "index.html"))
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response


# Custom 404 handler for SPA
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    path = request.url.path
    static_prefixes = ["assets", "scripts", "styles", "js", "icons"]
    
    if (not path.startswith("/api") and 
        not any(path.startswith(f"/{f}") for f in static_prefixes) and
        "." not in path.split("/")[-1]):
        index_path = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    
    return JSONResponse(
        status_code=404, 
        content={"detail": "Not found", "path": path}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
