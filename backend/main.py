"""
StreamFlow Backend - FastAPI Application
High-performance video streaming with yt-dlp integration
"""
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, List
import time
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from cache import cache
from video_extractor import extractor, VideoInfo
from database import init_db, get_db, VideoRepository, Video

# Initialize FastAPI app
app = FastAPI(
    title="KV-Netflix API",
    description="Ad-free video streaming with movie catalog",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response models
class ExtractRequest(BaseModel):
    url: str
    quality: Optional[str] = None  # e.g., "1080p", "720p"


class ExtractResponse(BaseModel):
    title: str
    thumbnail: str
    duration: int
    stream_url: str
    resolution: str
    cached: bool
    extraction_time_ms: int


class VideoCreate(BaseModel):
    title: str
    source_url: str
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    category: Optional[str] = None


class VideoResponse(BaseModel):
    id: int
    title: str
    source_url: str
    thumbnail: Optional[str]
    duration: int
    resolution: Optional[str]
    category: Optional[str]
    
    class Config:
        from_attributes = True


# Startup event
@app.on_event("startup")
async def startup():
    init_db()
    print("✓ KV-Netflix Database initialized")
    
    # Auto-update check disabled on startup (can cause hangs)
    # Use POST /api/admin/update to manually trigger updates
    print("ℹ Use /api/admin/update to update dependencies")


# Health check
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "cache_type": "redis" if cache.is_redis else "memory",
        "version": "1.0.0"
    }


# ============================================
# Admin Endpoints - Version & Updates
# ============================================

@app.get("/api/admin/version")
async def get_versions():
    """Get versions of all managed dependencies"""
    from auto_updater import get_all_versions
    import asyncio
    
    loop = asyncio.get_event_loop()
    versions = await loop.run_in_executor(None, get_all_versions)
    
    return {
        "status": "ok",
        "versions": versions
    }


@app.post("/api/admin/update")
async def trigger_update(package: str = None):
    """Trigger manual update of dependencies
    
    Args:
        package: Specific package to update (yt-dlp, playwright, all)
                 If not specified, updates all packages
    """
    from auto_updater import update_yt_dlp, update_playwright, update_all_dependencies
    import asyncio
    
    loop = asyncio.get_event_loop()
    
    if package == "yt-dlp":
        success, msg = await loop.run_in_executor(None, update_yt_dlp)
        return {"package": "yt-dlp", "success": success, "message": msg}
    
    elif package == "playwright":
        success, msg = await loop.run_in_executor(None, update_playwright)
        return {"package": "playwright", "success": success, "message": msg}
    
    else:
        # Update all
        results = await loop.run_in_executor(None, update_all_dependencies)
        return {
            "status": "completed",
            "results": {pkg: {"success": s, "message": m} for pkg, (s, m) in results.items()}
        }


# Video extraction endpoint
@app.post("/api/extract", response_model=ExtractResponse)
async def extract_video(request: ExtractRequest):
    """
    Extract video stream URL from source.
    Uses cache-aside pattern with 3-hour TTL.
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
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


# Get available qualities
@app.get("/api/qualities")
async def get_qualities(url: str):
    """Get available quality options for a video"""
    try:
        qualities = await extractor.get_available_qualities(url)
        return {"qualities": qualities}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Video CRUD endpoints
@app.post("/api/videos", response_model=VideoResponse)
async def create_video(video: VideoCreate, db=Depends(get_db)):
    """Add a video to the library"""
    repo = VideoRepository(db)
    
    # Check if already exists
    existing = repo.get_by_url(video.source_url)
    if existing:
        raise HTTPException(status_code=400, detail="Video already exists")
    
    new_video = repo.create(**video.dict())
    return new_video


@app.get("/api/videos", response_model=list[VideoResponse])
async def list_videos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    db=Depends(get_db)
):
    """List all videos with pagination"""
    repo = VideoRepository(db)
    if category:
        return repo.get_by_category(category, limit)
    return repo.get_all(skip, limit)


@app.get("/api/videos/{video_id}", response_model=VideoResponse)
async def get_video(video_id: int, db=Depends(get_db)):
    """Get video by ID"""
    repo = VideoRepository(db)
    video = repo.get_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@app.delete("/api/videos/{video_id}")
async def delete_video(video_id: int, db=Depends(get_db)):
    """Delete video from library"""
    repo = VideoRepository(db)
    if repo.delete(video_id):
        return {"message": "Video deleted"}
    raise HTTPException(status_code=404, detail="Video not found")


# Search endpoint
@app.get("/api/search", response_model=list[VideoResponse])
async def search_videos(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    db=Depends(get_db)
):
    """Search videos by title"""
    repo = VideoRepository(db)
    return repo.search(q, limit)


# ============================================
# PhimMoiChill Integration Endpoints (using Playwright crawler)
# ============================================

@app.get("/api/rophim/catalog")
async def get_phimmoichill_catalog(
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=50),
    sort: str = Query("modified", description="Sort by: modified, year, rating")
):
    """
    Get movie catalog from ophim API with sorting support.
    """
    # Check cache first
    cache_key = f"catalog:{category}:{page}:{limit}:{sort}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    import aiohttp
    import ssl
    
    # Map categories to ophim slugs
    category_map = {
        # Main categories
        'movies': 'danh-sach/phim-le',
        'series': 'danh-sach/phim-bo',
        'tv-shows': 'danh-sach/phim-bo',
        'animation': 'danh-sach/hoat-hinh',
        'cinema': 'danh-sach/phim-chieu-rap',
        # Vietnamese slugs (passthrough)
        'phim-le': 'danh-sach/phim-le',
        'phim-bo': 'danh-sach/phim-bo',
        'phim-moi': 'danh-sach/phim-moi-cap-nhat', # Updated to distinct
        'phim-moi-cap-nhat': 'danh-sach/phim-moi-cap-nhat',
        'hoat-hinh': 'danh-sach/hoat-hinh',
        'phim-chieu-rap': 'danh-sach/phim-chieu-rap',
        # New/trending/popular
        'trending': 'danh-sach/phim-moi-cap-nhat', # Distinct
        'new': 'danh-sach/phim-le', # Default to movies
        'popular': 'danh-sach/phim-le',
        'all': 'danh-sach/phim-le',
        # Genre categories  
        'action': 'the-loai/hanh-dong',
        'comedy': 'the-loai/hai-huoc',
        'drama': 'the-loai/chinh-kich',
        'horror': 'the-loai/kinh-di',
        'romance': 'the-loai/tinh-cam',
        'scifi': 'the-loai/vien-tuong',
        # Country categories
        'korean': 'quoc-gia/han-quoc',
        'han-quoc': 'quoc-gia/han-quoc',
        'usa': 'quoc-gia/au-my',
        'au-my': 'quoc-gia/au-my',
        'china': 'quoc-gia/trung-quoc',
        'trung-quoc': 'quoc-gia/trung-quoc',
        'japan': 'quoc-gia/nhat-ban',
        'nhat-ban': 'quoc-gia/nhat-ban',
        'thailand': 'quoc-gia/thai-lan',
        'thai-lan': 'quoc-gia/thai-lan',
        'vietnam': 'quoc-gia/viet-nam',
        'viet-nam': 'quoc-gia/viet-nam',
        'my': 'quoc-gia/au-my',
        'hong-kong': 'quoc-gia/hong-kong',
        'dai-loan': 'quoc-gia/dai-loan',
        'an-do': 'quoc-gia/an-do',
        
        # Additional mappings for main.js categories
        'hanh-dong': 'the-loai/hanh-dong',
        'kinh-di': 'the-loai/kinh-di',
        'tinh-cam': 'the-loai/tinh-cam',
        'vien-tuong': 'the-loai/vien-tuong',
        'hai-huoc': 'the-loai/hai-huoc',
        'han-quoc-hits': 'quoc-gia/han-quoc',
        'phieu-luu': 'the-loai/phieu-luu',
        'vo-thuat': 'the-loai/vo-thuat',
        'hinh-su': 'the-loai/hinh-su',
        'tai-lieu': 'the-loai/tai-lieu',
        'gia-dinh': 'the-loai/gia-dinh',
        'co-trang': 'the-loai/co-trang',
        'hoc-duong': 'the-loai/hoc-duong',
        'tam-ly': 'the-loai/tam-ly',
        'than-thoai': 'the-loai/than-thoai',
        'chien-tranh': 'the-loai/chien-tranh',
        'the-thao': 'the-loai/the-thao',
        'am-nhac': 'the-loai/am-nhac',
        'than-thoai': 'the-loai/than-thoai',
        'hoc-duong': 'the-loai/hoc-duong',
    }
    
    # Use mapped slug or fallback to input as-is (for advanced users)
    slug = category_map.get(category, f'danh-sach/{category}') if category else 'danh-sach/phim-le'
    # If category starts with known prefixes, use as-is
    if category and (category.startswith('danh-sach/') or category.startswith('the-loai/') or category.startswith('quoc-gia/')):
        slug = category
    
    try:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connector = aiohttp.TCPConnector(ssl=ssl_ctx)
        
        async with aiohttp.ClientSession(connector=connector) as session:
            # Use ophim JSON API
            api_url = f"https://ophim1.com/v1/api/{slug}?page={page}"
            
            async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    # Fallback to general movies if specific slug fails
                    print(f"Warning: slug {slug} failed ({resp.status}), falling back...")
                    api_url = f"https://ophim1.com/v1/api/danh-sach/phim-le?page={page}"
                    async with session.get(api_url) as fallback_resp:
                        data = await fallback_resp.json()
                else:
                    data = await resp.json()
                
                items = data.get('data', {}).get('items', [])
                
                # Parse movies with full metadata including ratings
                movies = []
                for item in items:
                    tmdb_data = item.get('tmdb', {})
                    imdb_data = item.get('imdb', {})
                    
                    # Get the best available rating
                    tmdb_rating = tmdb_data.get('vote_average', 0) or 0
                    imdb_rating = imdb_data.get('vote_average', 0) or 0
                    best_rating = max(tmdb_rating, imdb_rating)
                    
                    movies.append({
                        'id': item.get('slug', ''),
                        'title': item.get('name', ''),
                        'original_title': item.get('origin_name'),
                        'slug': item.get('slug', ''),
                        'thumbnail': f"https://img.ophim.live/uploads/movies/{item.get('thumb_url', '')}",
                        'poster_url': f"https://img.ophim.live/uploads/movies/{item.get('poster_url', '')}",
                        'year': item.get('year'),
                        'quality': item.get('quality', 'HD'),
                        'duration': item.get('time'),
                        'category': item.get('type', 'single'),
                        'tmdb_rating': tmdb_rating,
                        'imdb_rating': imdb_rating,
                        'rating': best_rating,
                        'vote_count': tmdb_data.get('vote_count', 0),
                        'genres': [cat.get('name') for cat in item.get('category', [])],
                        'country': [c.get('name') for c in item.get('country', [])],
                        'modified': item.get('modified', {}).get('time'),
                        'episode_current': item.get('episode_current'),
                        'lang': item.get('lang'),
                    })
                
                # Apply sorting
                if sort == 'year':
                    movies.sort(key=lambda x: x.get('year') or 0, reverse=True)
                elif sort == 'rating':
                    movies.sort(key=lambda x: x.get('rating') or 0, reverse=True)
                # 'modified' is already the default sort from API
                
                result = {
                    "movies": movies[:limit],
                    "page": page,
                    "category": category or 'movies',
                    "sort": sort,
                    "total": len(movies)
                }
                
                # Cache for 1 hour (3600s)
                cache.set(cache_key, result, ttl=3600)
                return result
                
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch catalog: {str(e)}")


@app.get("/api/rophim/search")
async def search_phimmoichill(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50)
):
    """Search movies by title AND actors using ophim API"""
    import aiohttp
    import ssl
    
    movies = []
    seen_slugs = set()
    
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    connector = aiohttp.TCPConnector(ssl=ssl_ctx)
    
    def add_movie(item):
        """Helper to add movie avoiding duplicates"""
        slug = item.get('slug', '')
        if slug and slug not in seen_slugs:
            seen_slugs.add(slug)
            movies.append({
                'id': slug,
                'title': item.get('name', ''),
                'original_title': item.get('origin_name'),
                'slug': slug,
                'thumbnail': f"https://img.ophim.live/uploads/movies/{item.get('thumb_url', '')}",
                'backdrop': f"https://img.ophim.live/uploads/movies/{item.get('poster_url', '')}",
                'year': item.get('year'),
                'rating': None,
                'duration': None,
                'quality': item.get('quality', 'HD'),
                'genre': None,
                'description': None,
                'category': item.get('type', 'movies')
            })
    
    async with aiohttp.ClientSession(connector=connector) as session:
        # 1. Search by movie title (primary)
        try:
            api_url = f"https://ophim1.com/v1/api/tim-kiem?keyword={q}&limit={limit}"
            async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    items = data.get('data', {}).get('items', [])
                    for item in items:
                        add_movie(item)
        except Exception as e:
            print(f"Title search failed: {e}")
        
        # 2. Search by actor name (secondary)
        if len(movies) < limit:
            try:
                # ophim actor search endpoint
                actor_slug = q.lower().replace(' ', '-')
                actor_url = f"https://ophim1.com/v1/api/danh-sach/dien-vien/{actor_slug}"
                async with session.get(actor_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        items = data.get('data', {}).get('items', [])
                        for item in items:
                            if len(movies) >= limit:
                                break
                            add_movie(item)
            except Exception as e:
                print(f"Actor search failed: {e}")
    
    # Fallback to phimmoichill scraper if no results
    if not movies:
        from rophim_scraper import RophimScraper
        try:
            scraper = RophimScraper()
            try:
                results = await scraper.search(q, limit)
                movies = [movie.__dict__ for movie in results]
            finally:
                await scraper.close()
        except Exception as e:
            print(f"Scraper search failed: {e}")
    
    return {
        "movies": movies[:limit],
        "total": len(movies)
    }




@app.get("/api/rophim/categories/discover")
async def discover_categories():
    """
    Discover all available categories from PhimMoiChill
    Returns types, genres, countries, and years
    """
    from category_discovery import get_categories
    
    try:
        categories = await get_categories()
        
        # Count total movies per category type
        totals = {
            cat_type: len(cat_list)
            for cat_type, cat_list in categories.items()
        }
        
        return {
            "categories": categories,
            "totals": totals,
            "total_categories": sum(totals.values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to discover categories: {str(e)}")


@app.get("/api/rophim/category")
async def get_movies_by_category(
    slug: str = Query(..., description="Category slug (e.g., 'the-loai/hanh-dong', 'danh-sach/phim-le')"),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=50)
):
    """
    Get movies for a specific category
    Examples: ?slug=phim-le, ?slug=the-loai/hanh-dong, ?slug=quoc-gia/han-quoc
    """
    from rophim_scraper import RophimScraper
    
    try:
        scraper = RophimScraper()
        try:
            # Use the get_category method which supports all category types
            results = await scraper.get_category(slug, page, limit)
            movies = [movie.__dict__ for movie in results]
            
            return {
                "movies": movies,
                "category": slug,
                "page": page,
                "total": len(movies)
            }
        finally:
            await scraper.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch category: {str(e)}")





@app.get("/api/rophim/home/curated")
async def get_curated_homepage_sections():
    """
    Get curated homepage sections with TOP RATED, NEW RELEASES, and popular genres.
    This provides a Rotten Tomatoes / Moviewiser style layout.
    """
    # Check cache
    cache_key = "home:curated_v2"
    cached = cache.get(cache_key)
    if cached:
        return cached

    import aiohttp
    import ssl
    
    sections = []
    
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    connector = aiohttp.TCPConnector(ssl=ssl_ctx)
    
    async def fetch_section(session, title: str, slug: str, sort_key: str = None, limit: int = 15):
        """Fetch a single section"""
        try:
            api_url = f"https://ophim1.com/v1/api/{slug}?page=1"
            async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json()
                items = data.get('data', {}).get('items', [])
                
                movies = []
                for item in items[:30]:  # Get more to allow better sorting
                    tmdb_data = item.get('tmdb', {})
                    imdb_data = item.get('imdb', {})
                    tmdb_rating = tmdb_data.get('vote_average', 0) or 0
                    imdb_rating = imdb_data.get('vote_average', 0) or 0
                    
                    movies.append({
                        'id': item.get('slug', ''),
                        'title': item.get('name', ''),
                        'original_title': item.get('origin_name'),
                        'slug': item.get('slug', ''),
                        'thumbnail': f"https://img.ophim.live/uploads/movies/{item.get('thumb_url', '')}",
                        'poster_url': f"https://img.ophim.live/uploads/movies/{item.get('poster_url', '')}",
                        'year': item.get('year'),
                        'quality': item.get('quality', 'HD'),
                        'rating': max(tmdb_rating, imdb_rating),
                        'tmdb_rating': tmdb_rating,
                        'vote_count': tmdb_data.get('vote_count', 0),
                        'category': item.get('type', 'single'),
                        'genres': [cat.get('name') for cat in item.get('category', [])],
                    })
                
                # Apply sorting
                if sort_key == 'rating':
                    movies.sort(key=lambda x: (x.get('rating') or 0, x.get('vote_count') or 0), reverse=True)
                elif sort_key == 'year':
                    movies.sort(key=lambda x: x.get('year') or 0, reverse=True)
                
                return {
                    'title': title,
                    'key': slug,
                    'movies': movies[:limit]
                }
        except Exception as e:
            print(f"Error fetching {title}: {e}")
            return None
    
    try:
        async with aiohttp.ClientSession(connector=connector) as session:
            import asyncio
            
            # Define curated sections
            section_configs = [
                ("🏆 Top Rated Movies", "danh-sach/phim-le", "rating"),
                ("🎬 New Releases", "danh-sach/phim-le", "year"),
                ("📺 Top Rated Series", "danh-sach/phim-bo", "rating"),
                ("💥 Action & Adventure", "the-loai/hanh-dong", "rating"),
                ("😱 Horror & Thriller", "the-loai/kinh-di", "rating"),
                ("❤️ Romance", "the-loai/tinh-cam", "rating"),
                ("🎭 Drama", "the-loai/chinh-kich", "rating"),
                ("😂 Comedy", "the-loai/hai-huoc", "rating"),
                ("🌟 Sci-Fi & Fantasy", "the-loai/vien-tuong", "rating"),
                ("🎌 Animation & Anime", "danh-sach/hoat-hinh", "rating"),
                ("🇰🇷 Korean Movies", "quoc-gia/han-quoc", "rating"),
                ("🇺🇸 Western Movies", "quoc-gia/au-my", "rating"),
            ]
            
            tasks = [fetch_section(session, title, slug, sort_key) for title, slug, sort_key in section_configs]
            results = await asyncio.gather(*tasks)
            
            sections = [r for r in results if r and r.get('movies')]
            
        result = {"sections": sections, "total": len(sections)}
        # Cache for 6 hours (21600s)
        cache.set(cache_key, result, ttl=21600)
        return result
        
    except Exception as e:
        print(f"Error fetching curated sections: {e}")
        return {"sections": [], "error": str(e)}



@app.get("/api/rophim/stream/{slug}")
async def get_rophim_stream(slug: str, episode: int = 1):
    """
    Get video stream URL from ophim API for a specific slug and episode.
    """
    from rophim_scraper import get_video_stream
    from fastapi.responses import JSONResponse
    
    try:
        print(f"DEBUG: Processing stream request for {slug} ep {episode}")
        stream_url = await get_video_stream(slug, episode=episode)
        
        if not stream_url:
            print(f"DEBUG: Stream not found for {slug}")
            return JSONResponse(status_code=404, content={"detail": "Stream not found"})
            
        print(f"DEBUG: Success! Returning stream URL for {slug}")
        return {"stream_url": stream_url}
    except Exception as e:
        print(f"ERROR in get_rophim_stream: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.post("/api/rophim/stream")
async def get_rophim_stream_post(data: dict):
    """
    Get video stream URL (POST) - supports source_url if needed
    """
    import traceback
    from fastapi.responses import JSONResponse
    from rophim_scraper import get_video_stream
    
    try:
        slug = data.get('slug')
        episode = int(data.get('episode', 1))
        
        if not slug:
             raise HTTPException(status_code=400, detail="Slug required")
             
        stream_url = await get_video_stream(slug, episode=episode)
        
        if not stream_url:
            raise HTTPException(status_code=404, detail="Stream not found")
            
        return JSONResponse(content={"stream_url": stream_url})
    except HTTPException:
        raise
    except Exception as e:
        print(f"CRITICAL ERROR in get_rophim_stream_post: {e}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500, 
            content={"detail": str(e)}
        )


@app.get("/api/rophim/home/sections")
async def get_home_more_sections(page: int = Query(1, ge=1), view: str = Query('home')):
    """
    Get paginated sections for homepage OR specific views (infinite scroll).
    Returns dynamic sections (Genres, Countries, etc.) or View specific sections.
    """
    from category_scraper import PhimMoiChillCategoryScraper
    
    scraper = PhimMoiChillCategoryScraper()
    try:
        if view == 'home':
            # Home logic (Page 2+ usually)
            # If page < 2, get_mixed_sections might return empty or negative index logic?
            # My logic: idx_start = (page - 2) * 5. If page=1 => -5.
            # But Main Page uses get_all_sections for Page 1.
            # So this endpoint is only for Page 2+ on Home.
            if page < 2: 
                results = [] 
            else:
                results = await scraper.get_mixed_sections(page)
        else:
            # Category Views using get_view_sections
            results = await scraper.get_view_sections(view, page)
            
        return {"sections": results, "page": page}
    except Exception as e:
        print(f"Error fetching more sections: {e}")
        return {"sections": [], "page": page}
    finally:
        await scraper.close()

def clean_movie_description(movie: Dict) -> Dict:
    """Remove messy metadata from description field"""
    desc = movie.get('description', '')
    if desc and ('Trạng thái' in desc or 'Năm phát hành' in desc):
        # Description contains concatenated metadata - clear it
        movie['description'] = None
    return movie


@app.get("/api/rophim/movie/{slug}")
async def get_phimmoichill_movie(slug: str):
    """Get detailed movie info from PhimMoiChill with optional TMDB enrichment"""
    import asyncio
    from rophim_scraper import get_movie_details
    
    try:
        loop = asyncio.get_event_loop()
        movie = await loop.run_in_executor(
            None,
            lambda: get_movie_details(slug)
        )
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        # Clean up description field
        movie = clean_movie_description(movie)
        
        # Try to enrich with TMDB data
        try:
            from tmdb_service import tmdb_service
            enriched = await tmdb_service.enrich_movie_data(movie)
            return enriched
        except Exception as tmdb_error:
            print(f"TMDB enrichment failed: {tmdb_error}")
            # Return base movie data if TMDB fails
            return movie
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch movie: {str(e)}")


@app.get("/api/rophim/stream/{slug}")
async def get_phimmoichill_stream(
    slug: str,
    episode: int = Query(1, ge=1),
    server: int = Query(0, ge=0, le=2)
):
    """Get video stream URL for a movie/episode using ophim API"""
    import asyncio
    from rophim_scraper import get_video_stream
    
    try:
        # Run sync scraper in thread pool
        loop = asyncio.get_event_loop()
        stream_url = await loop.run_in_executor(
            None,
            lambda: get_video_stream(slug, episode, server)
        )
        
        if not stream_url:
            raise HTTPException(status_code=404, detail="Stream not found - video source extraction failed")
        
        return {
            "stream_url": stream_url,
            "episode": episode,
            "slug": slug
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stream: {str(e)}")


class PhimMoiChillStreamRequest(BaseModel):
    source_url: str
    slug: str = ""
    episode: int = 1
    server: int = 0


@app.post("/api/rophim/stream")
async def get_phimmoichill_stream_by_url(request: PhimMoiChillStreamRequest):
    """Get video stream URL using slug from source_url - uses ophim API"""
    import asyncio
    import re
    from rophim_scraper import get_video_stream
    
    try:
        # Extract slug from source_url
        slug = request.slug
        if not slug and request.source_url:
            # e.g., https://phimmoichill.network/phim/slug-name
            match = re.search(r'/phim/([^/\?]+)', request.source_url)
            if match:
                slug = match.group(1)
        
        if not slug:
            raise HTTPException(status_code=400, detail="Could not extract slug from URL")
        
        loop = asyncio.get_event_loop()
        stream_url = await loop.run_in_executor(
            None,
            lambda: get_video_stream(slug, request.episode, request.server)
        )
        
        if not stream_url:
            raise HTTPException(status_code=404, detail="Stream not found - video source extraction failed")
        
        return {
            "stream_url": stream_url,
            "episode": request.episode,
            "slug": slug
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stream: {str(e)}")


# ============================================
# Scheduled Crawl Endpoint
# ============================================

@app.post("/api/crawl/trigger")
async def trigger_crawl(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Trigger a movie catalog crawl.
    Can be called manually or by external scheduler (cron, Docker healthcheck).
    Returns the number of movies crawled.
    """
    import asyncio
    from rophim_scraper import get_movies
    
    try:
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(
            None,
            lambda: get_movies(page, limit)
        )
        
        return {
            "success": True,
            "crawled_count": len(movies),
            "page": page,
            "message": f"Successfully crawled {len(movies)} movies"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crawl failed: {str(e)}")




@app.get("/api/crawl/status")
async def crawl_status():
    """Get the last crawl status and timestamp"""
    return {
        "status": "ready",
        "message": "Use POST /api/crawl/trigger to start a crawl"
    }


# ============================================
# Category Endpoints - PhimMoiChill Themed Sections
# ============================================

@app.get("/api/rophim/categories/all")
async def get_all_categories():
    """Get all themed category sections in one call"""
    import asyncio
    from category_scraper import get_categories_sync
    
    try:
        loop = asyncio.get_event_loop()
        categories = await loop.run_in_executor(None, get_categories_sync)
        
        return {
            "categories": categories,
            "total_sections": len(categories)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")


@app.get("/api/rophim/categories/hot")
async def get_hot_category(limit: int = Query(24, ge=1, le=50)):
    """Get Hot Movies category"""
    import asyncio
    from category_scraper import PhimMoiChillCategoryScraper
    
    try:
        async def _fetch():
            scraper = PhimMoiChillCategoryScraper()
            try:
                movies = await scraper.get_hot_movies(limit)
                await scraper.close()
                return movies
            except:
                await scraper.close()
                raise
        
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: asyncio.run(_fetch()))
        
        return {"movies": movies, "category": "hot", "total": len(movies)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch hot movies: {str(e)}")


@app.get("/api/rophim/categories/new-releases")
async def get_new_releases_category(limit: int = Query(24, ge=1, le=50)):
    """Get New Releases category"""
    import asyncio
    from category_scraper import PhimMoiChillCategoryScraper
    
    try:
        async def _fetch():
            scraper = PhimMoiChillCategoryScraper()
            try:
                movies = await scraper.get_new_releases(limit)
                await scraper.close()
                return movies
            except:
                await scraper.close()
                raise
        
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: asyncio.run(_fetch()))
        
        return {"movies": movies, "category": "new_releases", "total": len(movies)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch new releases: {str(e)}")


@app.get("/api/rophim/categories/top10")
async def get_top10_category():
    """Get Top 10 Most Watched"""
    import asyncio
    from category_scraper import PhimMoiChillCategoryScraper
    
    try:
        async def _fetch():
            scraper = PhimMoiChillCategoryScraper()
            try:
                movies = await scraper.get_top_10()
                await scraper.close()
                return movies
            except:
                await scraper.close()
                raise
        
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: asyncio.run(_fetch()))
        
        return {"movies": movies, "category": "top10", "total": len(movies)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top 10: {str(e)}")


@app.get("/api/rophim/categories/cinema")
async def get_cinema_category(limit: int = Query(24, ge=1, le=50)):
    """Get Cinema Releases category"""
    import asyncio
    from category_scraper import PhimMoiChillCategoryScraper
    
    try:
        async def _fetch():
            scraper = PhimMoiChillCategoryScraper()
            try:
                movies = await scraper.get_cinema_releases(limit)
                await scraper.close()
                return movies
            except:
                await scraper.close()
                raise
        
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: asyncio.run(_fetch()))
        
        return {"movies": movies, "category": "cinema", "total": len(movies)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cinema releases: {str(e)}")


# ============================================
# Static Files Serving (Production)
# ============================================

# Mount static files from the 'static' directory
# In Docker, the built frontend will be copied here
frontend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "static"))
print(f"🔍 DEBUG: Resolved frontend_path to: {frontend_path}")
print(f"🔍 DEBUG: Path exists: {os.path.exists(frontend_path)}")

if os.path.exists(frontend_path):
    print(f"✓ Serving frontend from {frontend_path}")
    
    # Mount directories only if they exist (Vite production builds often flatten these)
    for folder in ["assets", "icons", "scripts", "styles", "js"]:
        folder_path = os.path.join(frontend_path, folder)
        if os.path.exists(folder_path):
            app.mount(f"/{folder}", StaticFiles(directory=folder_path), name=folder)
            print(f"  - Mounted /{folder}")
    
    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(frontend_path, "index.html"))

    @app.get("/watch")
    @app.get("/watch.html")
    async def serve_watch():
        return FileResponse(os.path.join(frontend_path, "watch.html"))

    @app.get("/manifest.json")
    async def serve_manifest():
        return FileResponse(os.path.join(frontend_path, "manifest.json"))

    @app.get("/sw.js")
    async def serve_sw():
        return FileResponse(os.path.join(frontend_path, "sw.js"))

# Catch-all for any other routes (SPA support)
@app.exception_handler(404)
async def custom_404_handler(request, exc):
    if not request.url.path.startswith("/api"):
        if os.path.exists(os.path.join(frontend_path, "index.html")):
            return FileResponse(os.path.join(frontend_path, "index.html"))
    return JSONResponse(status_code=404, content={"detail": "Not found"})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

