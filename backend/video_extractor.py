"""
Video Extractor - yt-dlp wrapper for stream URL extraction
"""
import asyncio
from typing import Optional
from dataclasses import dataclass
import yt_dlp


@dataclass
class VideoInfo:
    """Extracted video information"""
    title: str
    thumbnail: str
    duration: int
    stream_url: str
    format_id: str
    resolution: str
    ext: str
    source_url: str


class VideoExtractor:
    """
    yt-dlp wrapper for extracting direct stream URLs.
    Supports quality negotiation up to 4K.
    """
    
    # Quality preference order (highest to lowest)
    QUALITY_PREFERENCE = [
        '2160p', '1440p', '1080p', '720p', '480p', '360p', '240p'
    ]
    
    def __init__(self):
        self.base_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'noplaylist': True,
        }
    
    def _get_format_selector(self, preferred_quality: Optional[str] = None) -> str:
        """Build format selector string for yt-dlp"""
        if preferred_quality:
            # User requested specific quality
            height = preferred_quality.replace('p', '')
            return f'bestvideo[height<={height}]+bestaudio/best[height<={height}]/best'
        # Default: best available
        return 'bestvideo+bestaudio/best'
    
    async def extract(
        self, 
        url: str, 
        preferred_quality: Optional[str] = None,
        cookies_file: Optional[str] = None
    ) -> VideoInfo:
        """
        Extract video information and stream URL.
        
        Args:
            url: Source video URL
            preferred_quality: Optional quality preference (e.g., '1080p', '720p')
            cookies_file: Optional path to cookies file for authenticated sources
        
        Returns:
            VideoInfo with stream URL and metadata
        
        Raises:
            Exception if extraction fails
        """
        opts = {
            **self.base_opts,
            'format': self._get_format_selector(preferred_quality),
        }
        
        if cookies_file:
            opts['cookiefile'] = cookies_file
        
        # Run yt-dlp in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(None, self._extract_sync, url, opts)
        
        return info
    
    def _extract_sync(self, url: str, opts: dict) -> VideoInfo:
        """Synchronous extraction (runs in thread pool)"""
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Get the best format's URL
            stream_url = info.get('url')
            
            # If no direct URL, check requested_formats (for merged streams)
            if not stream_url and 'requested_formats' in info:
                # Prefer video+audio manifest or video stream
                for fmt in info['requested_formats']:
                    if fmt.get('url'):
                        stream_url = fmt['url']
                        break
            
            # Fallback to formats list
            if not stream_url and 'formats' in info:
                for fmt in reversed(info['formats']):
                    if fmt.get('url'):
                        stream_url = fmt['url']
                        break
            
            if not stream_url:
                raise Exception("Could not extract stream URL")
            
            # Determine resolution
            height = info.get('height', 0)
            resolution = f"{height}p" if height else 'unknown'
            
            return VideoInfo(
                title=info.get('title', 'Unknown'),
                thumbnail=info.get('thumbnail', ''),
                duration=info.get('duration', 0),
                stream_url=stream_url,
                format_id=info.get('format_id', ''),
                resolution=resolution,
                ext=info.get('ext', 'mp4'),
                source_url=url
            )
    
    async def get_available_qualities(self, url: str) -> list[str]:
        """Get list of available quality options for a video"""
        opts = {
            **self.base_opts,
            'listformats': False,
        }
        
        loop = asyncio.get_event_loop()
        
        def extract_formats():
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)
                formats = info.get('formats', [])
                qualities = set()
                for fmt in formats:
                    height = fmt.get('height')
                    if height:
                        qualities.add(f"{height}p")
                return sorted(qualities, key=lambda x: int(x.replace('p', '')), reverse=True)
        
        return await loop.run_in_executor(None, extract_formats)


# Singleton instance
extractor = VideoExtractor()
