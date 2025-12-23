"""
TMDB (The Movie Database) Service
Provides rich movie metadata from open-source movie database
"""
import aiohttp
import os
import asyncio
from typing import Optional, Dict, List

TMDB_API_KEY = os.getenv('TMDB_API_KEY', '')
TMDB_BASE = 'https://api.themoviedb.org/3'
TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

class TMDBService:
    """Service to fetch movie data from The Movie Database"""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or TMDB_API_KEY
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if not self.session:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        if self.session:
            await self.session.close()
            self.session = None
    
    async def search_movie(self, title: str, year: Optional[int] = None) -> Optional[Dict]:
        """
        Search for a movie by title and optional year
        Returns the best match or None
        """
        if not self.api_key:
            print("⚠ TMDB_API_KEY not set, skipping TMDB enrichment")
            return None
        
        try:
            session = await self._get_session()
            params = {
                'api_key': self.api_key,
                'query': title,
                'language': 'en-US'
            }
            if year:
                params['year'] = year
            
            async with session.get(f'{TMDB_BASE}/search/movie', params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    results = data.get('results', [])
                    if results:
                        # Return first result (best match)
                        return results[0]
                return None
        except Exception as e:
            print(f"TMDB search error: {e}")
            return None
    
    async def get_movie_details(self, tmdb_id: int) -> Optional[Dict]:
        """
        Get detailed movie information including cast and crew
        """
        if not self.api_key:
            return None
        
        try:
            session = await self._get_session()
            params = {
                'api_key': self.api_key,
                'append_to_response': 'credits',
                'language': 'en-US'
            }
            
            async with session.get(f'{TMDB_BASE}/movie/{tmdb_id}', params=params) as response:
                if response.status == 200:
                    return await response.json()
                return None
        except Exception as e:
            print(f"TMDB details error: {e}")
            return None
    
    def get_poster_url(self, poster_path: str, size: str = 'w500') -> str:
        """Get full poster URL from TMDB path"""
        if not poster_path:
            return ''
        return f'{TMDB_IMAGE_BASE}/{size}{poster_path}'
    
    def get_profile_url(self, profile_path: str, size: str = 'w185') -> str:
        """Get full profile photo URL from TMDB path"""
        if not profile_path:
            return ''
        return f'{TMDB_IMAGE_BASE}/{size}{profile_path}'
    
    async def enrich_movie_data(self, movie: Dict) -> Dict:
        """
        Enrich movie data with TMDB information
        Merges TMDB data into existing movie object
        """
        if not self.api_key:
            return movie
        
        try:
            title = movie.get('title') or movie.get('name', '')
            year = movie.get('year')
            
            if not title:
                return movie
            
            # Search for movie
            search_result = await self.search_movie(title, year)
            if not search_result:
                return movie
            
            tmdb_id = search_result.get('id')
            
            # Get detailed info
            details = await self.get_movie_details(tmdb_id)
            if not details:
                return movie
            
            # Merge data (TMDB takes precedence for certain fields)
            enriched = movie.copy()
            
            # Enhanced description
            if details.get('overview'):
                enriched['tmdb_description'] = details['overview']
            
            # Runtime in minutes
            if details.get('runtime'):
                enriched['runtime_minutes'] = details['runtime']
            
            # Budget and revenue
            if details.get('budget'):
                enriched['budget'] = details['budget']
            if details.get('revenue'):
                enriched['revenue'] = details['revenue']
            
            # Tagline
            if details.get('tagline'):
                enriched['tagline'] = details['tagline']
            
            # Better rating
            if details.get('vote_average'):
                enriched['tmdb_rating'] = details['vote_average']
            
            # Enhanced poster
            if details.get('poster_path'):
                enriched['tmdb_poster'] = self.get_poster_url(details['poster_path'])
            
            if details.get('backdrop_path'):
                enriched['tmdb_backdrop'] = self.get_poster_url(details['backdrop_path'], 'w1280')
            
            # Cast with photos
            credits = details.get('credits', {})
            cast_list = credits.get('cast', [])[:10]  # Top 10 cast
            enriched['tmdb_cast'] = [
                {
                    'name': person['name'],
                    'character': person.get('character', ''),
                    'profile_photo': self.get_profile_url(person.get('profile_path'))
                }
                for person in cast_list
            ]
            
            # Director
            crew_list = credits.get('crew', [])
            directors = [person['name'] for person in crew_list if person.get('job') == 'Director']
            if directors:
                enriched['tmdb_director'] = directors[0]
            
            print(f"✓ Enriched '{title}' with TMDB data")
            return enriched
            
        except Exception as e:
            print(f"Error enriching movie: {e}")
            return movie


# Singleton instance
tmdb_service = TMDBService()


# Sync wrapper
def enrich_movie_sync(movie: Dict) -> Dict:
    """Synchronous wrapper for enriching movie data"""
    return asyncio.run(tmdb_service.enrich_movie_data(movie))


if __name__ == "__main__":
    # Test
    import asyncio
    
    async def test():
        service = TMDBService()
        
        # Test search
        result = await service.search_movie("Junior", 1994)
        print(f"Search result: {result.get('title') if result else 'None'}")
        
        if result:
            details = await service.get_movie_details(result['id'])
            print(f"Runtime: {details.get('runtime')} min")
            print(f"Cast: {len(details.get('credits', {}).get('cast', []))} actors")
        
        await service.close()
    
    asyncio.run(test())
