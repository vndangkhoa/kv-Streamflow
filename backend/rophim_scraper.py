"""
PhimMoiChill Scraper - Extracts movie catalog and video sources
Updated for phimmoichill.network
"""
import asyncio
import aiohttp
import ssl
import re
from bs4 import BeautifulSoup
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from urllib.parse import urljoin, urlparse
import json

BASE_URL = "https://phimmoichill.network"

@dataclass
class RophimMovie:
    id: str
    title: str
    original_title: Optional[str]
    slug: str
    thumbnail: str
    backdrop: Optional[str]
    year: Optional[int]
    rating: Optional[str]
    duration: Optional[int]  # in minutes
    quality: Optional[str]
    genre: Optional[str]
    description: Optional[str]
    category: str  # movies, series, anime, etc
    cast: Optional[List[str]] = None
    director: Optional[str] = None
    country: Optional[str] = None
    episodes: Optional[List[Dict]] = None


class RophimScraper:
    """Scraper for PhimMoiChill video catalog"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': BASE_URL
        }
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if not self.session:
            # Disable SSL verification for macOS compatibility
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            connector = aiohttp.TCPConnector(ssl=ssl_context)
            self.session = aiohttp.ClientSession(headers=self.headers, connector=connector)
        return self.session
    
    async def close(self):
        if self.session:
            await self.session.close()
            self.session = None
    
    async def _fetch_html(self, url: str) -> str:
        """Fetch HTML content from URL"""
        session = await self._get_session()
        async with session.get(url) as response:
            if response.status == 200:
                return await response.text()
            raise Exception(f"Failed to fetch {url}: {response.status}")
    
    async def _fetch_json(self, url: str) -> Dict:
        """Fetch JSON from URL"""
        session = await self._get_session()
        async with session.get(url) as response:
            if response.status == 200:
                return await response.json()
            raise Exception(f"Failed to fetch JSON {url}: {response.status}")
    
    async def get_homepage_movies(self, page: int = 1, limit: int = 24) -> List[RophimMovie]:
        """Extract movies from homepage/feed
        
        Uses /danh-sach/phim-le endpoint for PhimMoiChill
        Pagination uses /page/N format (not ?page=N query param)
        """
        if page == 1:
            url = f"{BASE_URL}/danh-sach/phim-le"
        else:
            url = f"{BASE_URL}/danh-sach/phim-le/page/{page}"
        html = await self._fetch_html(url)
        return self._parse_movie_grid(html, limit)
    
    async def get_category(self, category: str, page: int = 1, limit: int = 24) -> List[RophimMovie]:
        """Get movies by category with parallel page fetching"""
        # Determine how many pages we need to fetch to satisfy the limit (average ~40 items per page)
        # We'll fetch 2 pages in parallel if limit is high
        num_pages = 2 if limit > 40 else 1
        
        async def fetch_page(p):
            try:
                if p == 1:
                    url = f"{BASE_URL}/{category}"
                else:
                    url = f"{BASE_URL}/{category}/page/{p}"
                html = await self._fetch_html(url)
                return self._parse_movie_grid(html, 100)
            except Exception:
                return []

        # Start concurrent fetches
        page_tasks = [fetch_page(p) for p in range(page, page + num_pages)]
        results = await asyncio.gather(*page_tasks)
        
        # Combine results and remove duplicates
        movies = []
        seen_slugs = set()
        for batch in results:
            for m in batch:
                if m.slug not in seen_slugs:
                    movies.append(m)
                    seen_slugs.add(m.slug)
        
        return movies[:limit]
    
    async def search(self, query: str, limit: int = 20) -> List[RophimMovie]:
        """Search for movies"""
        url = f"{BASE_URL}/tim-kiem?keyword={query}"
        html = await self._fetch_html(url)
        return self._parse_movie_grid(html, limit)
    
    async def get_movie_detail(self, slug: str) -> Optional[RophimMovie]:
        """Get detailed movie info including episodes"""
        url = f"{BASE_URL}/phim/{slug}"
        html = await self._fetch_html(url)
        return self._parse_movie_detail(html, slug)
    
    async def get_video_source(self, movie_slug: str, episode: int = 1) -> Optional[str]:
        """Extract video source URL for playback
        
        Returns direct m3u8 or MP4 URL
        """
        # Try to get the player page
        player_url = f"{BASE_URL}/xem-phim/{movie_slug}/tap-{episode}"
        html = await self._fetch_html(player_url)
        
        # Look for embedded video sources
        sources = self._extract_video_sources(html)
        if sources:
            return sources[0]  # Return best quality source
        
        return None
    
    def _parse_movie_grid(self, html: str, limit: int) -> List[RophimMovie]:
        """Parse movie cards from HTML grid using BeautifulSoup"""
        movies = []
        soup = BeautifulSoup(html, 'lxml')
        
        # PhimMoiChill uses .myui-vodlist__box for each movie item
        movie_items = soup.select('.myui-vodlist__box')
        
        for item in movie_items[:limit]:
            try:
                # Find the main link with class myui-vodlist__thumb
                link = item.select_one('a.myui-vodlist__thumb')
                if not link:
                    link = item.select_one('a[href*="/phim/"]')
                if not link:
                    continue
                    
                href = link.get('href', '')
                slug = self._extract_slug(href)
                if not slug:
                    continue
                
                # Get title from link title attribute or h4.title
                title = link.get('title', '')
                if not title:
                    title_elem = item.select_one('h4.title a, h4 a, .title a')
                    if title_elem:
                        title = title_elem.get_text(strip=True)
                    else:
                        title = slug.replace('-', ' ').title()
                
                # Get thumbnail from background-image style
                thumbnail = ''
                style = link.get('style', '')
                bg_match = re.search(r'url\(([^)]+)\)', style)
                if bg_match:
                    thumbnail = bg_match.group(1).strip('"\'')
                else:
                    # Fallback to img tag
                    img = item.select_one('img')
                    if img:
                        thumbnail = img.get('src', '') or img.get('data-src', '')
                
                # Get quality badge (.pic-tag)
                quality_elem = item.select_one('.pic-tag, .quality, .label')
                quality = quality_elem.get_text(strip=True) if quality_elem else 'HD'
                
                # Get English title from description
                eng_title_elem = item.select_one('.text-muted, .myui-vodlist__detail p')
                original_title = eng_title_elem.get_text(strip=True) if eng_title_elem else None
                
                # Determine category from quality badge or episode count
                category = "movies"
                if quality and ('tập' in quality.lower() or 'ep' in quality.lower()):
                    category = "series"
                
                # Extract year from original title
                year = None
                if original_title:
                    year_match = re.search(r'\((\d{4})\)', original_title)
                    if year_match:
                        year = int(year_match.group(1))
                
                movie = RophimMovie(
                    id=slug,
                    title=title,
                    original_title=original_title,
                    slug=slug,
                    thumbnail=self._normalize_url(thumbnail),
                    backdrop=None,
                    year=year,
                    rating=None,
                    duration=None,
                    quality=quality or 'HD',
                    genre=None,
                    description=None,
                    category=category
                )
                movies.append(movie)
            except Exception as e:
                # Skip problematic items
                continue
        
        return movies
    
    def _parse_movie_detail(self, html: str, slug: str) -> Optional[RophimMovie]:
        """Parse detailed movie page"""
        soup = BeautifulSoup(html, 'lxml')
        
        # Get title
        title_elem = soup.select_one('h1.movie-title, h1, .title')
        title = title_elem.get_text(strip=True) if title_elem else slug.replace('-', ' ').title()
        
        # Get description from meta tags (better quality)
        description = None
        meta_desc = soup.select_one('meta[name="description"], meta[property="og:description"]')
        if meta_desc:
            description = meta_desc.get('content', '').strip()
        
        # Fallback to page content if no meta description
        if not description:
            desc_elem = soup.select_one('.description, .content, .film-description, .entry-content')
            description = desc_elem.get_text(strip=True) if desc_elem else None
        
        # Get poster from meta og:image (high quality)
        poster = ''
        poster_meta = soup.select_one('meta[property="og:image"]')
        if poster_meta:
            poster = poster_meta.get('content', '')
        else:
            # Fallback to img tag
            poster_elem = soup.select_one('.movie-l-img img, .thumb img, img.img-responsive')
            poster = poster_elem.get('src', '') if poster_elem else ''
        
        # Get metadata from info sections
        director = None
        cast = []
        country = None
        genres = []
        year = None
        rating = None
        episodes_count = None
        
        # PhimMoiChill uses <li> tags with labels
        info_items = soup.select('.movie-info li, .film-info li, .movie-details li, ul li')
        
        for item in info_items:
            item_text = item.get_text()
            
            # Year (Năm phát hành)
            if 'Năm' in item_text:
                year_match = re.search(r'(\d{4})', item_text)
                if year_match:
                    year = int(year_match.group(1))
            
            # Episodes (Số tập)
            elif 'Số tập' in item_text:
                ep_match = re.search(r'(\d+)', item_text)
                if ep_match:
                    episodes_count = int(ep_match.group(1))
            
            # Country (Quốc gia)
            elif 'Quốc gia' in item_text:
                country_links = item.select('a')
                if country_links:
                    country = ', '.join([a.get_text(strip=True) for a in country_links])
                else:
                    country = item_text.replace('Quốc gia:', '').strip()
            
            # Genres (Thể loại)
            elif 'Thể loại' in item_text:
                genre_links = item.select('a')
                if genre_links:
                    genres = [a.get_text(strip=True) for a in genre_links]
                else:
                    genre_text = item_text.replace('Thể loại:', '').strip()
                    genres = [g.strip() for g in genre_text.split(',') if g.strip()]
            
            # Director (Đạo diễn)
            elif 'Đạo diễn' in item_text:
                director_links = item.select('a')
                if director_links:
                    director = ', '.join([a.get_text(strip=True) for a in director_links])
                else:
                    director = item_text.replace('Đạo diễn:', '').strip()
            
            # Cast (Diễn viên)
            elif 'Diễn viên' in item_text:
                cast_links = item.select('a')
                if cast_links:
                    cast = [a.get_text(strip=True) for a in cast_links]
                else:
                    cast_text = item_text.replace('Diễn viên:', '').strip()
                    cast = [c.strip() for c in cast_text.split(',') if c.strip()]
            
            # Rating
            elif 'Đánh giá' in item_text or 'IMDb' in item_text:
                rating_match = re.search(r'(\d+\.?\d*)/10', item_text)
                if rating_match:
                    rating = rating_match.group(1)
        
        # Get episodes
        episodes = self._parse_episodes(soup)
        category = "series" if episodes or (episodes_count and episodes_count > 1) else "movies"
        
        return RophimMovie(
            id=slug,
            title=title,
            original_title=None,
            slug=slug,
            thumbnail=self._normalize_url(poster),
            backdrop=None,
            year=year,
            rating=rating,
            duration=self._extract_duration(html),
            quality=self._extract_quality(html),
            genre=', '.join(genres) if genres else None,
            description=description,  # Now has real description!
            category=category,
            cast=cast if cast else None,
            director=director,
            country=country,
            episodes=episodes
        )
    
    def _parse_episodes(self, soup) -> Optional[List[Dict]]:
        """Extract episode list from movie detail page"""
        episodes = []
        
        # Find episode links
        ep_links = soup.select('a[href*="/tap-"], a[href*="episode"], .episode-list a')
        
        for link in ep_links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # Extract episode number
            ep_match = re.search(r'tap-(\d+)', href) or re.search(r'(\d+)', text)
            if ep_match:
                number = int(ep_match.group(1))
                episodes.append({
                    'number': number,
                    'title': text or f"Tập {number}",
                    'url': self._normalize_url(href)
                })
        
        # Remove duplicates and sort
        seen = set()
        unique_episodes = []
        for ep in sorted(episodes, key=lambda x: x['number']):
            if ep['number'] not in seen:
                seen.add(ep['number'])
                unique_episodes.append(ep)
        
        return unique_episodes if unique_episodes else None
    
    def _extract_video_sources(self, html: str) -> List[str]:
        """Extract video source URLs from player page"""
        sources = []
        
        # Look for m3u8 sources
        m3u8_pattern = r'(https?://[^"\'\>\s]+\.m3u8[^"\'\>\s]*)'
        m3u8_matches = re.findall(m3u8_pattern, html)
        sources.extend(m3u8_matches)
        
        # Look for MP4 sources
        mp4_pattern = r'(https?://[^"\'\>\s]+\.mp4[^"\'\>\s]*)'
        mp4_matches = re.findall(mp4_pattern, html)
        sources.extend(mp4_matches)
        
        # Look for iframe sources (embedded players)
        iframe_pattern = r'<iframe[^>]*src="([^"]+)"'
        iframe_matches = re.findall(iframe_pattern, html)
        
        # Check for common video hostings in iframe
        for iframe_src in iframe_matches:
            if any(host in iframe_src for host in ['streamtape', 'doodstream', 'mixdrop', 'fembed', 'player', 'embed']):
                sources.append(iframe_src)
        
        return sources
    
    def _extract_slug(self, url: str) -> Optional[str]:
        """Extract movie slug from URL"""
        match = re.search(r'/phim/([^/?#]+)', url)
        if match:
            return match.group(1)
        match = re.search(r'/([^/?#]+)(?:\?|$)', url)
        return match.group(1) if match else None
    
    def _normalize_url(self, url: str) -> str:
        """Normalize relative URLs to absolute"""
        if not url:
            return ""
        if url.startswith('//'):
            return 'https:' + url
        if url.startswith('/'):
            return urljoin(BASE_URL, url)
        return url
    
    def _extract_year(self, text: str) -> Optional[int]:
        """Extract year from text"""
        match = re.search(r'\b(19|20)\d{2}\b', text)
        return int(match.group()) if match else None
    
    def _extract_quality(self, text: str) -> Optional[str]:
        """Extract video quality from text"""
        patterns = ['4K', '2160p', '1080p', 'FullHD', '720p', 'HD', '480p', 'SD', 'Full']
        for p in patterns:
            if re.search(rf'\b{p}\b', text, re.IGNORECASE):
                return p.replace('FullHD', '1080p').upper()
        return None
    
    def _extract_rating(self, text: str) -> Optional[str]:
        """Extract rating (IMDb, TV-MA, etc)"""
        match = re.search(r'(\d+\.?\d*)/10', text)
        if match:
            return match.group()
        return None
    
    def _extract_duration(self, text: str) -> Optional[int]:
        """Extract duration in minutes"""
        match = re.search(r'(\d+)\s*(?:phút|min|minutes?)', text, re.IGNORECASE)
        return int(match.group(1)) if match else None
    
    def _extract_genre(self, text: str) -> Optional[str]:
        """Extract genre tags"""
        genres = []
        genre_patterns = [
            r'Hành Động', r'Kinh Dị', r'Tình Cảm', r'Hài', r'Viễn Tưởng',
            r'Hoạt Hình', r'Phiêu Lưu', r'Bí Ẩn', r'Võ Thuật', r'Chiến Tranh',
            r'Action', r'Horror', r'Romance', r'Comedy', r'Sci-Fi',
            r'Animation', r'Adventure', r'Mystery', r'Martial Arts', r'War'
        ]
        for pattern in genre_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                genres.append(pattern)
        return ', '.join(genres[:3]) if genres else None


# Singleton instance
scraper = RophimScraper()


# Async helpers for non-async contexts
def get_homepage_sync(limit: int = 24) -> List[RophimMovie]:
    """Synchronous wrapper for getting homepage movies from page 1"""
    return asyncio.run(scraper.get_homepage_movies(1, limit))


def get_movies(page: int = 1, limit: int = 24) -> List[Dict]:
    """Compatible wrapper for get_homepage_movies returning dicts"""
    async def _fetch():
        local_scraper = RophimScraper()
        try:
            movies = await local_scraper.get_homepage_movies(page, limit)
            await local_scraper.close()
            return movies
        except Exception:
            await local_scraper.close()
            raise

    movies = asyncio.run(_fetch())
    return [m.__dict__ for m in movies]


def search_sync(query: str, limit: int = 20) -> List[RophimMovie]:
    """Synchronous wrapper for searching"""
    return asyncio.run(scraper.search(query, limit))


async def get_video_stream(slug: str, episode: int = 1, server: int = 0) -> Optional[str]:
    """Get video stream URL from ophim API
    
    Uses ophim1.com V1 API which provides direct m3u8 links.
    """
    import aiohttp
    import ssl
    
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    
    try:
        # ophim V1 API endpoint is more reliable
        api_url = f"https://ophim1.com/v1/api/phim/{slug}"
        print(f"DEBUG: Fetching stream from ophim V1 API: {api_url}")
        
        async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=ssl_ctx)) as session:
            async with session.get(api_url, timeout=15) as response:
                if response.status != 200:
                    print(f"DEBUG: API returned status {response.status}")
                    return None
                
                json_response = await response.json()
                
        # Handle the v1 structure: data.item.episodes
        data_block = json_response.get('data', {})
        item = data_block.get('item', {})
        episodes = item.get('episodes', [])
        
        if not episodes:
            # Fallback for old API structure: episodes
            episodes = json_response.get('episodes', [])
            
        if not episodes:
            print(f"DEBUG: No episodes found for slug: {slug}")
            return None
        
        # Get the requested server (default to first)
        server_idx = min(server, len(episodes) - 1)
        server_data = episodes[server_idx].get('server_data', [])
        
        if not server_data:
            print(f"DEBUG: No server data found for slug: {slug}")
            return None
        
        # Get the requested episode
        episode_idx = episode - 1
        if episode_idx >= len(server_data):
            # If specifically requested episode 1 but it's empty, use whatever is first
            episode_idx = 0
            
        if episode_idx < 0:
            episode_idx = 0
            
        ep_data = server_data[episode_idx]
        
        # Prefer m3u8 link, fallback to embed
        stream_url = ep_data.get('link_m3u8') or ep_data.get('link_embed')
        
        if stream_url:
            print(f"DEBUG: ✓ Found stream URL")
            return stream_url
        else:
            print(f"DEBUG: Links are empty in API response for {slug}")
            return None
            
    except Exception as e:
        print(f"ERROR: Exception in get_video_stream: {e}")

    # Fallback to scraping phimmoichill directly if API logic fails
    print(f"⚠ API logic failed, falling back to scraper for {slug}")
    
    try:
        from rophim_scraper import RophimScraper
        local_scraper = RophimScraper()
        url = await local_scraper.get_video_source(slug, episode)
        await local_scraper.close()
        return url
    except Exception as e:
        print(f"DEBUG: Scraper fallback also failed: {e}")
        return None



def get_movie_details(slug: str) -> Optional[Dict]:
    """Get movie details with episodes from ophim API"""
    import requests
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # First try ophim API which has more complete data including episodes
    try:
        api_url = f"https://ophim1.com/phim/{slug}"
        response = requests.get(api_url, verify=False, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            movie = data.get('movie', {})
            
            if movie:
                # Extract category/genre info
                categories = movie.get('category', [])
                genres = [c.get('name', '') for c in categories if c.get('name')]
                
                # Build episodes list
                episodes = data.get('episodes', [])
                
                return {
                    'id': movie.get('slug', slug),
                    'title': movie.get('name', ''),
                    'original_title': movie.get('origin_name'),
                    'slug': movie.get('slug', slug),
                    'thumbnail': movie.get('poster_url') or movie.get('thumb_url'),
                    'backdrop': movie.get('thumb_url'),
                    'year': movie.get('year'),
                    'rating': movie.get('tmdb', {}).get('vote_average') if movie.get('tmdb') else None,
                    'duration': movie.get('time'),
                    'quality': movie.get('quality', 'HD'),
                    'genre': ', '.join(genres) if genres else None,
                    'genres': genres,
                    'description': movie.get('content', '').replace('<p>', '').replace('</p>', ''),
                    'category': movie.get('type', 'movies'),
                    'cast': movie.get('actor', []),
                    'director': movie.get('director', [''])[0] if movie.get('director') else '',
                    'country': movie.get('country', [{}])[0].get('name', '') if movie.get('country') else '',
                    'episodes': episodes,  # Include full episodes data with streaming links
                    'source_url': f"https://phimmoichill.network/phim/{slug}"
                }
    except Exception as e:
        print(f"ophim API error: {e}")
    
    # Fallback to scraper
    async def _fetch():
        local_scraper = RophimScraper()
        try:
            movie = await local_scraper.get_movie_detail(slug)
            await local_scraper.close()
            if movie:
                return movie.__dict__
            return None
        except Exception:
            await local_scraper.close()
            return None
    
    return asyncio.run(_fetch())

