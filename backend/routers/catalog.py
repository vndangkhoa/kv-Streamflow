"""
Catalog Router
Movie catalog and streaming endpoints for ophim/PhimMoiChill integration
"""
import asyncio
import aiohttp
import ssl
import re
from typing import Optional, Dict, List
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from cache import cache
from config import settings
from security import verify_hmac
from logging_config import get_logger

logger = get_logger("catalog")

router = APIRouter(prefix="/api/rophim", tags=["catalog"])


# Category slug mappings
CATEGORY_MAP = {
    # Main categories
    'movies': 'danh-sach/phim-le',
    'series': 'danh-sach/phim-bo',
    'tv-shows': 'danh-sach/phim-bo',
    'animation': 'danh-sach/hoat-hinh',
    'cinema': 'danh-sach/phim-chieu-rap',
    # Vietnamese slugs (passthrough)
    'phim-le': 'danh-sach/phim-le',
    'phim-bo': 'danh-sach/phim-bo',
    'phim-moi': 'danh-sach/phim-moi-cap-nhat',
    'phim-moi-cap-nhat': 'danh-sach/phim-moi-cap-nhat',
    'hoat-hinh': 'danh-sach/hoat-hinh',
    'phim-chieu-rap': 'danh-sach/phim-chieu-rap',
    # New/trending/popular
    'trending': 'danh-sach/phim-moi-cap-nhat',
    'new': 'danh-sach/phim-le',
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
    # Additional genre mappings
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
}


def _get_ssl_connector():
    """Create SSL connector with verification disabled for ophim"""
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    return aiohttp.TCPConnector(ssl=ssl_ctx)


def _parse_movie_item(item: Dict) -> Dict:
    """Parse a movie item from ophim API response"""
    tmdb_data = item.get('tmdb', {})
    imdb_data = item.get('imdb', {})
    
    tmdb_rating = tmdb_data.get('vote_average', 0) or 0
    imdb_rating = imdb_data.get('vote_average', 0) or 0
    best_rating = max(tmdb_rating, imdb_rating)
    
    return {
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
    }


def _resolve_category_slug(category: Optional[str]) -> str:
    """Resolve category to ophim API slug"""
    if not category:
        return 'danh-sach/phim-le'
    
    # Use mapped slug or fallback to input as-is
    slug = CATEGORY_MAP.get(category, f'danh-sach/{category}')
    
    # If category starts with known prefixes, use as-is
    if category.startswith(('danh-sach/', 'the-loai/', 'quoc-gia/')):
        slug = category
    
    return slug


@router.get("/catalog")
async def get_catalog(
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=50),
    sort: str = Query("modified", description="Sort by: modified, year, rating"),
    authorized: bool = Depends(verify_hmac)
):
    """Get movie catalog from ophim API with sorting support."""
    # Check cache first
    cache_key = f"catalog:{category}:{page}:{limit}:{sort}"
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    slug = _resolve_category_slug(category)
    
    try:
        connector = _get_ssl_connector()
        
        async with aiohttp.ClientSession(connector=connector) as session:
            api_url = f"https://ophim1.com/v1/api/{slug}?page={page}"
            
            async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=settings.request_timeout)) as resp:
                if resp.status != 200:
                    logger.warning(f"Slug {slug} failed ({resp.status}), falling back to phim-le")
                    api_url = f"https://ophim1.com/v1/api/danh-sach/phim-le?page={page}"
                    async with session.get(api_url) as fallback_resp:
                        data = await fallback_resp.json()
                else:
                    data = await resp.json()
                
                items = data.get('data', {}).get('items', [])
                movies = [_parse_movie_item(item) for item in items]
                
                # Apply sorting
                if sort == 'year':
                    movies.sort(key=lambda x: x.get('year') or 0, reverse=True)
                elif sort == 'rating':
                    movies.sort(key=lambda x: x.get('rating') or 0, reverse=True)
                
                result = {
                    "movies": movies[:limit],
                    "page": page,
                    "category": category or 'movies',
                    "sort": sort,
                    "total": len(movies)
                }
                
                # Cache for 1 hour
                cache.set(cache_key, result, ttl=settings.cache_catalog_ttl)
                return result
                
    except aiohttp.ClientError as e:
        logger.error(f"Failed to fetch catalog: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch catalog: {str(e)}")


@router.get("/search")
async def search_movies(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    authorized: bool = Depends(verify_hmac)
):
    """Search movies by title AND actors using ophim API"""
    movies = []
    seen_slugs = set()
    
    connector = _get_ssl_connector()
    
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
        # Search by movie title (primary)
        try:
            api_url = f"https://ophim1.com/v1/api/tim-kiem?keyword={q}&limit={limit}"
            async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    items = data.get('data', {}).get('items', [])
                    for item in items:
                        add_movie(item)
        except Exception as e:
            logger.warning(f"Title search failed: {e}")
        
        # Search by actor name (secondary)
        if len(movies) < limit:
            try:
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
                logger.warning(f"Actor search failed: {e}")
    
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
            logger.warning(f"Scraper search failed: {e}")
    
    return {"movies": movies[:limit], "total": len(movies)}


@router.get("/categories/discover")
async def discover_categories(authorized: bool = Depends(verify_hmac)):
    """Discover all available categories from PhimMoiChill"""
    from category_discovery import get_categories
    
    try:
        categories = await get_categories()
        totals = {cat_type: len(cat_list) for cat_type, cat_list in categories.items()}
        
        return {
            "categories": categories,
            "totals": totals,
            "total_categories": sum(totals.values())
        }
    except Exception as e:
        logger.error(f"Failed to discover categories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to discover categories: {str(e)}")


@router.get("/home/curated")
async def get_curated_homepage_sections(authorized: bool = Depends(verify_hmac)):
    """Get curated homepage sections with TOP RATED, NEW RELEASES, and popular genres."""
    cache_key = "home:curated_v2"
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    connector = _get_ssl_connector()
    
    async def fetch_section(session, title: str, slug: str, sort_key: str = None, limit: int = 15):
        """Fetch a single section"""
        try:
            api_url = f"https://ophim1.com/v1/api/{slug}?page=1"
            async with session.get(api_url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status != 200:
                    return None
                data = await resp.json()
                items = data.get('data', {}).get('items', [])
                
                movies = [_parse_movie_item(item) for item in items[:30]]
                
                # Apply sorting
                if sort_key == 'rating':
                    movies.sort(key=lambda x: (x.get('rating') or 0, x.get('vote_count') or 0), reverse=True)
                elif sort_key == 'year':
                    movies.sort(key=lambda x: x.get('year') or 0, reverse=True)
                
                return {'title': title, 'key': slug, 'movies': movies[:limit]}
        except Exception as e:
            logger.warning(f"Error fetching {title}: {e}")
            return None
    
    try:
        async with aiohttp.ClientSession(connector=connector) as session:
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
        cache.set(cache_key, result, ttl=settings.cache_home_ttl)
        return result
        
    except Exception as e:
        logger.error(f"Error fetching curated sections: {e}")
        return {"sections": [], "error": str(e)}


@router.get("/stream/{slug}")
async def get_stream(
    slug: str,
    episode: int = Query(1, ge=1),
    authorized: bool = Depends(verify_hmac)
):
    """Get video stream URL from ophim API for a specific slug and episode."""
    from rophim_scraper import get_video_stream
    
    try:
        logger.debug(f"Processing stream request for {slug} ep {episode}")
        stream_url = await get_video_stream(slug, episode=episode)
        
        if not stream_url:
            logger.warning(f"Stream not found for {slug}")
            return JSONResponse(status_code=404, content={"detail": "Stream not found"})
        
        return {"stream_url": stream_url, "episode": episode, "slug": slug}
    except Exception as e:
        logger.error(f"Error in get_stream: {e}")
        return JSONResponse(status_code=500, content={"detail": str(e)})


class StreamRequest(BaseModel):
    """Request for video stream URL"""
    slug: str = ""
    source_url: str = ""
    episode: int = 1
    server: int = 0


@router.post("/stream")
async def get_stream_post(
    request: StreamRequest,
    authorized: bool = Depends(verify_hmac)
):
    """Get video stream URL (POST) - supports source_url if needed"""
    import traceback
    from rophim_scraper import get_video_stream
    
    try:
        slug = request.slug
        if not slug and request.source_url:
            # Extract slug from source_url
            match = re.search(r'/phim/([^/\?]+)', request.source_url)
            if match:
                slug = match.group(1)
        
        if not slug:
            raise HTTPException(status_code=400, detail="Could not extract slug from URL")
        
        stream_url = await get_video_stream(slug, episode=request.episode)
        
        if not stream_url:
            raise HTTPException(status_code=404, detail="Stream not found")
        
        return JSONResponse(content={"stream_url": stream_url, "episode": request.episode, "slug": slug})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_stream_post: {e}")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.get("/movie/{slug}")
async def get_movie_details(slug: str, authorized: bool = Depends(verify_hmac)):
    """Get detailed movie info from PhimMoiChill with optional TMDB enrichment"""
    from rophim_scraper import get_movie_details as fetch_movie_details
    
    try:
        loop = asyncio.get_event_loop()
        movie = await loop.run_in_executor(None, lambda: fetch_movie_details(slug))
        
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        # Clean up description field
        desc = movie.get('description', '')
        if desc and ('Trạng thái' in desc or 'Năm phát hành' in desc):
            movie['description'] = None
        
        # Try to enrich with TMDB data
        try:
            from tmdb_service import tmdb_service
            enriched = await tmdb_service.enrich_movie_data(movie)
            return enriched
        except Exception as tmdb_error:
            logger.warning(f"TMDB enrichment failed: {tmdb_error}")
            return movie
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch movie: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch movie: {str(e)}")


@router.get("/home/sections")
async def get_home_more_sections(
    page: int = Query(1, ge=1),
    view: str = Query('home'),
    authorized: bool = Depends(verify_hmac)
):
    """Get paginated sections for homepage OR specific views (infinite scroll)."""
    from category_scraper import PhimMoiChillCategoryScraper
    
    scraper = PhimMoiChillCategoryScraper()
    try:
        if view == 'home':
            if page < 2: 
                results = [] 
            else:
                results = await scraper.get_mixed_sections(page)
        else:
            results = await scraper.get_view_sections(view, page)
            
        return {"sections": results, "page": page}
    except Exception as e:
        logger.error(f"Error fetching more sections: {e}")
        return {"sections": [], "page": page}
    finally:
        await scraper.close()


@router.get("/category")
async def get_movies_by_category(
    slug: str = Query(..., description="Category slug"),
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=50),
    authorized: bool = Depends(verify_hmac)
):
    """Get movies for a specific category"""
    from rophim_scraper import RophimScraper
    
    try:
        scraper = RophimScraper()
        try:
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
        logger.error(f"Failed to fetch category: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch category: {str(e)}")


@router.get("/categories/all")
async def get_all_categories(authorized: bool = Depends(verify_hmac)):
    """Get all themed category sections in one call"""
    from category_scraper import get_categories_sync
    
    try:
        loop = asyncio.get_event_loop()
        categories = await loop.run_in_executor(None, get_categories_sync)
        
        return {
            "categories": categories,
            "total_sections": len(categories)
        }
    except Exception as e:
        logger.error(f"Failed to fetch categories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")


@router.get("/categories/hot")
async def get_hot_category(
    limit: int = Query(24, ge=1, le=50),
    authorized: bool = Depends(verify_hmac)
):
    """Get Hot Movies category"""
    from category_scraper import PhimMoiChillCategoryScraper
    
    try:
        async def _fetch():
            scraper = PhimMoiChillCategoryScraper()
            try:
                movies = await scraper.get_hot_movies(limit)
                await scraper.close()
                return movies
            except Exception:
                await scraper.close()
                raise
        
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: asyncio.run(_fetch()))
        
        return {"movies": movies, "category": "hot", "total": len(movies)}
    except Exception as e:
        logger.error(f"Failed to fetch hot movies: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch hot movies: {str(e)}")


@router.get("/categories/new-releases")
async def get_new_releases_category(
    limit: int = Query(24, ge=1, le=50),
    authorized: bool = Depends(verify_hmac)
):
    """Get New Releases category"""
    from category_scraper import PhimMoiChillCategoryScraper
    
    try:
        async def _fetch():
            scraper = PhimMoiChillCategoryScraper()
            try:
                movies = await scraper.get_new_releases(limit)
                await scraper.close()
                return movies
            except Exception:
                await scraper.close()
                raise
        
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: asyncio.run(_fetch()))
        
        return {"movies": movies, "category": "new_releases", "total": len(movies)}
    except Exception as e:
        logger.error(f"Failed to fetch new releases: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch new releases: {str(e)}")


@router.get("/categories/top10")
async def get_top10_category(authorized: bool = Depends(verify_hmac)):
    """Get Top 10 Most Watched"""
    from category_scraper import PhimMoiChillCategoryScraper
    
    try:
        async def _fetch():
            scraper = PhimMoiChillCategoryScraper()
            try:
                movies = await scraper.get_top_10()
                await scraper.close()
                return movies
            except Exception:
                await scraper.close()
                raise
        
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: asyncio.run(_fetch()))
        
        return {"movies": movies, "category": "top10", "total": len(movies)}
    except Exception as e:
        logger.error(f"Failed to fetch top 10: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch top 10: {str(e)}")


@router.get("/categories/cinema")
async def get_cinema_category(
    limit: int = Query(24, ge=1, le=50),
    authorized: bool = Depends(verify_hmac)
):
    """Get Cinema Releases category"""
    from category_scraper import PhimMoiChillCategoryScraper
    
    try:
        async def _fetch():
            scraper = PhimMoiChillCategoryScraper()
            try:
                movies = await scraper.get_cinema_releases(limit)
                await scraper.close()
                return movies
            except Exception:
                await scraper.close()
                raise
        
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: asyncio.run(_fetch()))
        
        return {"movies": movies, "category": "cinema", "total": len(movies)}
    except Exception as e:
        logger.error(f"Failed to fetch cinema releases: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch cinema releases: {str(e)}")


@router.post("/crawl/trigger")
async def trigger_crawl(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    authorized: bool = Depends(verify_hmac)
):
    """Trigger a movie catalog crawl."""
    from rophim_scraper import get_movies
    
    try:
        loop = asyncio.get_event_loop()
        movies = await loop.run_in_executor(None, lambda: get_movies(page, limit))
        
        return {
            "success": True,
            "crawled_count": len(movies),
            "page": page,
            "message": f"Successfully crawled {len(movies)} movies"
        }
    except Exception as e:
        logger.error(f"Crawl failed: {e}")
        raise HTTPException(status_code=500, detail=f"Crawl failed: {str(e)}")


@router.get("/crawl/status")
async def crawl_status():
    """Get the last crawl status and timestamp"""
    return {
        "status": "ready",
        "message": "Use POST /api/rophim/crawl/trigger to start a crawl"
    }
