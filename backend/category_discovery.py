"""
Category Discovery Module for PhimMoiChill
Automatically discovers and maps all available categories
"""
import asyncio
import aiohttp
import ssl
from bs4 import BeautifulSoup
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional
from urllib.parse import urljoin

BASE_URL = "https://phimmoichill.network"

@dataclass
class Category:
    """Category metadata"""
    id: str
    name: str
    slug: str
    type: str  # 'type', 'genre', 'country', 'year'
    url: str
    parent: Optional[str] = None
    movie_count: int = 0
    
    def to_dict(self):
        return asdict(self)


class CategoryDiscovery:
    """Discovers categories from PhimMoiChill navigation"""
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        }
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if not self.session:
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
        """Fetch HTML content"""
        session = await self._get_session()
        async with session.get(url) as response:
            if response.status == 200:
                return await response.text()
            raise Exception(f"Failed to fetch {url}: {response.status}")
    
    async def discover_all_categories(self) -> Dict[str, List[Category]]:
        """
        Discover all categories from PhimMoiChill
        Returns organized structure of categories
        """
        try:
            html = await self._fetch_html(BASE_URL)
            soup = BeautifulSoup(html, 'lxml')
            
            categories = {
                'types': [],
                'genres': [],
                'countries': [],
                'years': []
            }
            
            # Discover main types (phim-le, phim-bo, etc.)
            categories['types'] = await self._discover_main_types(soup)
            
            # Discover genres (the-loai/*)
            categories['genres'] = await self._discover_genres(soup)
            
            # Discover countries (quoc-gia/*)
            categories['countries'] = await self._discover_countries(soup)
            
            # Generate year categories
            categories['years'] = self._generate_year_categories()
            
            return categories
            
        except Exception as e:
            print(f"Error discovering categories: {e}")
            return self._get_fallback_categories()
    
    async def _discover_main_types(self, soup: BeautifulSoup) -> List[Category]:
        """Discover main content types"""
        types = []
        
        # Look for navigation menu with main types
        nav_links = soup.select('nav a, .menu a, .navigation a')
        
        # Known type patterns
        type_patterns = {
            'phim-le': 'Movies',
            'phim-bo': 'TV Series', 
            'tv-shows': 'TV Shows',
            'hoat-hinh': 'Animation'
        }
        
        for link in nav_links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            for slug, name in type_patterns.items():
                if slug in href:
                    types.append(Category(
                        id=slug,
                        name=text or name,
                        slug=f'danh-sach/{slug}',
                        type='type',
                        url=urljoin(BASE_URL, f'/danh-sach/{slug}')
                    ))
                    break
        
        # Ensure we have at least the basic types
        if not types:
            for slug, name in type_patterns.items():
                types.append(Category(
                    id=slug,
                    name=name,
                    slug=f'danh-sach/{slug}',
                    type='type',
                    url=urljoin(BASE_URL, f'/danh-sach/{slug}')
                ))
        
        return types
    
    async def _discover_genres(self, soup: BeautifulSoup) -> List[Category]:
        """Discover genre categories"""
        genres = []
        
        # Look for genre menu/dropdown
        genre_links = soup.select('a[href*="the-loai/"]')
        
        seen_genres = set()
        for link in genre_links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # Extract genre slug from URL
            if '/the-loai/' in href:
                slug = href.split('/the-loai/')[-1].split('/')[0].split('?')[0]
                
                if slug and slug not in seen_genres:
                    seen_genres.add(slug)
                    genres.append(Category(
                        id=slug,
                        name=text or slug.replace('-', ' ').title(),
                        slug=f'the-loai/{slug}',
                        type='genre',
                        url=urljoin(BASE_URL, f'/the-loai/{slug}')
                    ))
        
        # Fallback: common genres
        if not genres:
            genres = self._get_fallback_genres()
        
        return genres
    
    async def _discover_countries(self, soup: BeautifulSoup) -> List[Category]:
        """Discover country categories"""
        countries = []
        
        # Look for country menu/dropdown
        country_links = soup.select('a[href*="quoc-gia/"]')
        
        seen_countries = set()
        for link in country_links:
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # Extract country slug from URL
            if '/quoc-gia/' in href:
                slug = href.split('/quoc-gia/')[-1].split('/')[0].split('?')[0]
                
                if slug and slug not in seen_countries:
                    seen_countries.add(slug)
                    countries.append(Category(
                        id=slug,
                        name=text or slug.replace('-', ' ').title(),
                        slug=f'quoc-gia/{slug}',
                        type='country',
                        url=urljoin(BASE_URL, f'/quoc-gia/{slug}')
                    ))
        
        # Fallback: common countries
        if not countries:
            countries = self._get_fallback_countries()
        
        return countries
    
    def _generate_year_categories(self) -> List[Category]:
        """Generate year-based categories"""
        from datetime import datetime
        current_year = datetime.now().year
        
        years = []
        for year in range(current_year, current_year - 10, -1):
            years.append(Category(
                id=str(year),
                name=str(year),
                slug=f'nam/{year}',
                type='year',
                url=urljoin(BASE_URL, f'/nam/{year}')
            ))
        
        return years
    
    def _get_fallback_genres(self) -> List[Category]:
        """Fallback genres if discovery fails"""
        genres_map = {
            'hanh-dong': 'Action',
            'kinh-di': 'Horror',
            'tinh-cam': 'Romance',
            'hai-huoc': 'Comedy',
            'vien-tuong': 'Sci-Fi',
            'phieu-luu': 'Adventure',
            'bi-an': 'Mystery',
            'chien-tranh': 'War',
            'tam-ly': 'Psychological',
            'gia-dinh': 'Family'
        }
        
        return [
            Category(
                id=slug,
                name=name,
                slug=f'the-loai/{slug}',
                type='genre',
                url=urljoin(BASE_URL, f'/the-loai/{slug}')
            )
            for slug, name in genres_map.items()
        ]
    
    def _get_fallback_countries(self) -> List[Category]:
        """Fallback countries if discovery fails"""
        countries_map = {
            'my': 'United States',
            'han-quoc': 'South Korea',
            'nhat-ban': 'Japan',
            'trung-quoc': 'China',
            'thai-lan': 'Thailand',
            'au-my': 'Europe & Americas',
            'viet-nam': 'Vietnam'
        }
        
        return [
            Category(
                id=slug,
                name=name,
                slug=f'quoc-gia/{slug}',
                type='country',
                url=urljoin(BASE_URL, f'/quoc-gia/{slug}')
            )
            for slug, name in countries_map.items()
        ]
    
    def _get_fallback_categories(self) -> Dict[str, List[Category]]:
        """Complete fallback if discovery fails"""
        return {
            'types': [
                Category('phim-le', 'Movies', 'danh-sach/phim-le', 'type', f'{BASE_URL}/danh-sach/phim-le'),
                Category('phim-bo', 'TV Series', 'danh-sach/phim-bo', 'type', f'{BASE_URL}/danh-sach/phim-bo'),
                Category('hoat-hinh', 'Animation', 'danh-sach/hoat-hinh', 'type', f'{BASE_URL}/danh-sach/hoat-hinh'),
            ],
            'genres': self._get_fallback_genres(),
            'countries': self._get_fallback_countries(),
            'years': self._generate_year_categories()
        }


# Singleton instance
_discovery_instance = None

async def get_categories() -> Dict[str, List[Dict]]:
    """Get all categories (cached)"""
    global _discovery_instance
    
    discovery = CategoryDiscovery()
    try:
        categories = await discovery.discover_all_categories()
        # Convert to dict format
        return {
            key: [cat.to_dict() for cat in cat_list]
            for key, cat_list in categories.items()
        }
    finally:
        await discovery.close()


def get_categories_sync() -> Dict[str, List[Dict]]:
    """Synchronous wrapper for getting categories"""
    return asyncio.run(get_categories())


# CLI testing
if __name__ == "__main__":
    import json
    
    print("Discovering categories from PhimMoiChill...")
    categories = get_categories_sync()
    
    print("\n" + "="*50)
    print("DISCOVERED CATEGORIES")
    print("="*50)
    
    for cat_type, cat_list in categories.items():
        print(f"\n{cat_type.upper()}: {len(cat_list)} categories")
        for cat in cat_list[:5]:  # Show first 5
            print(f"  - {cat['name']} ({cat['slug']})")
        if len(cat_list) > 5:
            print(f"  ... and {len(cat_list) - 5} more")
    
    print("\n" + "="*50)
    print(f"Total categories: {sum(len(cats) for cats in categories.values())}")
    print("="*50)
