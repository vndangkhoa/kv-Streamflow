"""
StreamFlow Pydantic Schemas
Type-safe request/response models for the API
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ====================
# Video Extraction
# ====================

class ExtractRequest(BaseModel):
    """Request to extract video stream URL"""
    url: str = Field(..., description="Source video URL to extract")
    quality: Optional[str] = Field(None, description="Preferred quality (e.g., '1080p', '720p')")


class ExtractResponse(BaseModel):
    """Response with extracted video stream information"""
    title: str
    thumbnail: str
    duration: int = Field(..., description="Duration in seconds")
    stream_url: str = Field(..., description="Direct stream URL (m3u8 or mp4)")
    resolution: str
    cached: bool = Field(..., description="Whether result was from cache")
    extraction_time_ms: int = Field(..., description="Time taken to extract in milliseconds")


# ====================
# Video Library
# ====================

class VideoCreate(BaseModel):
    """Request to add a video to library"""
    title: str = Field(..., min_length=1, max_length=500)
    source_url: str = Field(..., min_length=1, max_length=2000)
    description: Optional[str] = None
    thumbnail: Optional[str] = None
    category: Optional[str] = None


class VideoResponse(BaseModel):
    """Video from the library"""
    id: int
    title: str
    source_url: str
    thumbnail: Optional[str]
    duration: int
    resolution: Optional[str]
    category: Optional[str]
    
    model_config = {"from_attributes": True}


# ====================
# Movie Catalog
# ====================

class MovieItem(BaseModel):
    """Movie item from catalog"""
    id: str
    title: str
    original_title: Optional[str] = None
    slug: str
    thumbnail: str
    poster_url: Optional[str] = None
    backdrop: Optional[str] = None
    year: Optional[int] = None
    quality: Optional[str] = "HD"
    duration: Optional[str] = None
    category: str = "single"
    rating: Optional[float] = None
    tmdb_rating: Optional[float] = None
    imdb_rating: Optional[float] = None
    vote_count: Optional[int] = 0
    genres: Optional[List[str]] = None
    country: Optional[List[str]] = None
    description: Optional[str] = None
    episode_current: Optional[str] = None
    lang: Optional[str] = None
    modified: Optional[str] = None


class CatalogResponse(BaseModel):
    """Response with movie catalog"""
    movies: List[MovieItem]
    page: int
    category: str
    sort: Optional[str] = "modified"
    total: int


class SearchResponse(BaseModel):
    """Search results response"""
    movies: List[MovieItem]
    total: int


class SectionResponse(BaseModel):
    """Single section with movies"""
    title: str
    key: str
    movies: List[MovieItem]


class CuratedHomeResponse(BaseModel):
    """Curated homepage sections"""
    sections: List[SectionResponse]
    total: int


# ====================
# System
# ====================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = "healthy"
    cache_type: str
    version: str


class VersionInfo(BaseModel):
    """Version information for a package"""
    current: str
    latest: Optional[str] = None


class VersionsResponse(BaseModel):
    """All package versions"""
    status: str
    versions: dict


class UpdateResponse(BaseModel):
    """Update operation response"""
    package: Optional[str] = None
    success: bool
    message: str


# ====================
# Stream
# ====================

class StreamRequest(BaseModel):
    """Request for video stream URL"""
    slug: str = Field(..., description="Movie slug identifier")
    episode: int = Field(1, ge=1, description="Episode number")


class StreamResponse(BaseModel):
    """Video stream URL response"""
    stream_url: str


# ====================
# Watch History
# ====================

class WatchHistoryItem(BaseModel):
    """Single watch history entry"""
    slug: str
    title: str
    thumbnail: Optional[str] = None
    episode: int = 1
    progress: float = 0.0
    duration: Optional[int] = None
    timestamp: datetime


class WatchHistoryRequest(BaseModel):
    """Request to save watch progress"""
    slug: str
    title: str
    thumbnail: Optional[str] = None
    episode: int = 1
    progress: float = Field(0.0, ge=0.0, le=1.0, description="Progress as decimal (0.0 to 1.0)")
    duration: Optional[int] = None


class MyListItem(BaseModel):
    """Item in user's saved list"""
    slug: str
    title: str
    thumbnail: Optional[str] = None
    poster_url: Optional[str] = None
    added_at: datetime
