"""
Video Library Router
CRUD operations for the video library
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List

from database import get_db, VideoRepository
from security import verify_hmac
from models.schemas import VideoCreate, VideoResponse


router = APIRouter(prefix="/api/videos", tags=["videos"])


@router.post("", response_model=VideoResponse)
async def create_video(
    video: VideoCreate,
    db=Depends(get_db),
    authorized: bool = Depends(verify_hmac)
):
    """Add a video to the library"""
    repo = VideoRepository(db)
    
    # Check if already exists
    existing = repo.get_by_url(video.source_url)
    if existing:
        raise HTTPException(status_code=400, detail="Video already exists")
    
    new_video = repo.create(**video.model_dump())
    return new_video


@router.get("", response_model=List[VideoResponse])
async def list_videos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    db=Depends(get_db),
    authorized: bool = Depends(verify_hmac)
):
    """List all videos with pagination"""
    repo = VideoRepository(db)
    if category:
        return repo.get_by_category(category, limit)
    return repo.get_all(skip, limit)


@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: int,
    db=Depends(get_db),
    authorized: bool = Depends(verify_hmac)
):
    """Get video by ID"""
    repo = VideoRepository(db)
    video = repo.get_by_id(video_id)
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video


@router.delete("/{video_id}")
async def delete_video(
    video_id: int,
    db=Depends(get_db),
    authorized: bool = Depends(verify_hmac)
):
    """Delete video from library"""
    repo = VideoRepository(db)
    if repo.delete(video_id):
        return {"message": "Video deleted"}
    raise HTTPException(status_code=404, detail="Video not found")


@router.get("/search", response_model=List[VideoResponse])
async def search_videos(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=50),
    db=Depends(get_db),
    authorized: bool = Depends(verify_hmac)
):
    """Search videos by title"""
    repo = VideoRepository(db)
    return repo.search(q, limit)
