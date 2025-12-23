"""
Category Scraper for PhimMoiChill
Orchestrates category-based crawling to build themed sections
"""
import asyncio
from typing import Dict, List, Any
from rophim_scraper import RophimScraper
from category_discovery import get_categories

class PhimMoiChillCategoryScraper:
    """
    Advanced scraper that looks for categories first, then crawls them.
    """
    def __init__(self):
        self.scraper = RophimScraper()

    async def close(self):
        await self.scraper.close()

    async def get_all_sections(self) -> Dict[str, List[Dict]]:
        """
        Build complete homepage structure by crawling key categories
        """
        # 1. Discover Categories (Cached)
        discovered = await get_categories()
        
        # 2. Map discovered categories to UI sections
        # We look for specific slugs in the discovered lists
        
        tasks = []
        
        # Define what we want to fetch
        # Format: (section_key, category_expected_slug, fallback_slug)
        sections_to_fetch = [
            # Hot -> Phim Le Page 1
            ('hot', 'danh-sach/phim-le'),
            # New Releases -> Phim Le Page 2 (Variation)
            ('new_releases', 'danh-sach/phim-le'),
            # Series -> Phim Bo
            ('series', 'danh-sach/phim-bo'),
            # Animation -> Hoat Hinh
            ('animated', 'danh-sach/hoat-hinh'),
            # Cinema -> Phim Chieu Rap
            ('cinema', 'the-loai/phim-chieu-rap'), 
            # Top 10 -> Phim Le Page 1
            ('top10', 'danh-sach/phim-le'), 
            # Vietnamese
            ('vietnamese', 'quoc-gia/viet-nam')
        ]
        
        results = {}
        
        # Parallel fetch
        async def fetch_section(key, slug):
            try:
                # Use scraper to get movies for this category
                limit = 10 if key == 'top10' else 42 # Increased for 2-3 rows
                # Fetch Page 2 for New Releases to allow variety from Hot (Page 1)
                page = 2 if key == 'new_releases' else 1
                
                movies = await self.scraper.get_category(slug, page=page, limit=limit)
                
                # Fallback for cinema if empty - try action genre
                if key == 'cinema' and not movies:
                    movies = await self.scraper.get_category('the-loai/hanh-dong', page=1, limit=limit)
                
                # Convert to dict and enrich
                movie_dicts = []
                for idx, m in enumerate(movies, 1):
                    d = m.__dict__
                    
                    # Add Metadata Badges
                    if key == 'top10':
                        d['ranking'] = idx
                        d['badge'] = f'TOP {idx}'
                    elif key == 'hot':
                        d['badge'] = 'HOT'
                    elif key == 'new_releases':
                        d['badge'] = 'NEW'
                    elif key == 'cinema':
                        d['badge'] = 'CINEMA'
                    
                    movie_dicts.append(d)
                    
                return key, movie_dicts
            except Exception as e:
                print(f"Error fetching section {key} ({slug}): {e}")
                return key, []

        pending_tasks = [fetch_section(key, slug) for key, slug in sections_to_fetch]
        fetched_results = await asyncio.gather(*pending_tasks)
        
        for key, movies in fetched_results:
            results[key] = movies

        return results

    # Individual fetchers for specific endpoints
    
    async def get_hot_movies(self, limit=24):
        movies = await self.scraper.get_category('danh-sach/phim-le', 1, limit)
        return [m.__dict__ for m in movies]

    async def get_new_releases(self, limit=24):
        # Fetch page 2 for variety? Or just page 1
        movies = await self.scraper.get_category('danh-sach/phim-le', 1, limit)
        return [m.__dict__ for m in movies]
    
    async def get_cinema_releases(self, limit=24):
        # Try finding a cinema category
        movies = await self.scraper.get_category('the-loai/phim-chieu-rap', 1, limit)
        if not movies:
             # Fallback: Phim Le
             movies = await self.scraper.get_category('danh-sach/phim-le', 1, limit)
        return [m.__dict__ for m in movies]
    
    async def get_top_10(self):
        movies = await self.scraper.get_category('danh-sach/phim-le', 1, 10)
        return [m.__dict__ for m in movies]

    async def get_mixed_sections(self, page: int) -> List[Dict[str, Any]]:
        """
        Fetch subsequent pages of Main Categories for infinite scroll.
        Strategy: Keep the same structure (Hot, Series, etc.) but load Page N.
        """
        # Define the main structure to repeat
        main_categories = [
            {'title': 'Phim Hot (Movies)', 'slug': 'danh-sach/phim-le'},
            {'title': 'Phim Bộ Mới (Series)', 'slug': 'danh-sach/phim-bo'},
            {'title': 'Hoạt Hình & Anime', 'slug': 'danh-sach/hoat-hinh'},
            {'title': 'Phim Chiếu Rạp', 'slug': 'the-loai/phim-chieu-rap'},
            {'title': 'Phim Việt Nam', 'slug': 'quoc-gia/viet-nam'}
        ]
        
        tasks = []
        async def fetch_dynamic(cat):
            try:
                # Use large limit for multi-row display
                movies = await self.scraper.get_category(cat['slug'], page, 84)
                if not movies: return None
                
                # Optional: Differentiate title for clarity, or keep same?
                # User asked to "keep the same structure".
                # We can append " - Page N" or just leave as is.
                # Let's leave as is but maybe ensures frontend renders it.
                
                return {
                    'title': cat['title'],
                    'key': cat['slug'],
                    'movies': [m.__dict__ for m in movies]
                }
            except:
                return None

        tasks = [fetch_dynamic(cat) for cat in main_categories]
        results = await asyncio.gather(*tasks)
        return [r for r in results if r is not None]

    async def get_view_sections(self, view: str, page: int) -> List[Dict[str, Any]]:
        """
        Fetch structured sections for specific views (Movies, Series, etc.)
        mimicking the Main Page design with sliders.
        """
        sub_sections = []
        
        if view == 'movies':
            sub_sections = [
                {'title': 'Phim Lẻ Mới', 'slug': 'danh-sach/phim-le'},
                {'title': 'Hành Động', 'slug': 'the-loai/hanh-dong'},
                {'title': 'Tình Cảm', 'slug': 'the-loai/tinh-cam'},
                {'title': 'Kinh Dị', 'slug': 'the-loai/kinh-di'},
                {'title': 'Viễn Tưởng', 'slug': 'the-loai/vien-tuong'},
                {'title': 'Hài Hước', 'slug': 'the-loai/hai-huoc'}
            ]
        elif view == 'series':
            sub_sections = [
                {'title': 'Phim Bộ Mới', 'slug': 'danh-sach/phim-bo'},
                {'title': 'Hàn Quốc', 'slug': 'quoc-gia/han-quoc'},
                {'title': 'Trung Quốc', 'slug': 'quoc-gia/trung-quoc'},
                {'title': 'Âu Mỹ', 'slug': 'quoc-gia/au-my'},
                {'title': 'Thái Lan', 'slug': 'quoc-gia/thai-lan'}
            ]
        elif view == 'animation':
             sub_sections = [
                 {'title': 'Anime Mới', 'slug': 'danh-sach/hoat-hinh'},
                 {'title': 'Học Đường', 'slug': 'the-loai/hoc-duong'}, 
                 {'title': 'Nhật Bản', 'slug': 'quoc-gia/nhat-ban'}
             ]
        elif view == 'cinema':
             sub_sections = [
                 {'title': 'Phim Chiếu Rạp Hot', 'slug': 'the-loai/phim-chieu-rap'},
                 {'title': 'Hành Động', 'slug': 'the-loai/hanh-dong'},
                 {'title': 'Hài Hước', 'slug': 'the-loai/hai-huoc'}
             ]

        if not sub_sections: return []
        
        tasks = []
        async def fetch_section(cat):
             try:
                 # Fetch larger batch for multi-row
                 movies = await self.scraper.get_category(cat['slug'], page, 84)
                 if not movies: return None
                 
                 return {
                    'title': cat['title'],
                    'key': cat['slug'],
                    'movies': [m.__dict__ for m in movies]
                 }
             except: return None
        
        tasks = [fetch_section(cat) for cat in sub_sections]
        results = await asyncio.gather(*tasks)
        return [r for r in results if r is not None]


# Wrapper function for main.py (Sync compatibility)
def get_categories_sync() -> Dict[str, List[Dict]]:
    """Synchronous wrapper to get all category sections"""
    async def _run():
        scraper = PhimMoiChillCategoryScraper()
        try:
            return await scraper.get_all_sections()
        finally:
            await scraper.close()

    try:
        return asyncio.run(_run())
    except Exception as e:
        print(f"Sync Category Crawl Error: {e}")
        return {
            'hot': [], 'new_releases': [], 'top10': [], 
            'cinema': [], 'vietnamese': [], 'animated': [], 'series': []
        }
