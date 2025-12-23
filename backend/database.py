"""
Database module - SQLAlchemy with SQLite for video metadata
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./streamflow.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Video(Base):
    """Video metadata model"""
    __tablename__ = "videos"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), index=True)
    description = Column(Text, nullable=True)
    thumbnail = Column(String(1000), nullable=True)
    source_url = Column(String(2000), unique=True, index=True)
    duration = Column(Integer, default=0)
    resolution = Column(String(20), nullable=True)
    category = Column(String(100), index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class VideoRepository:
    """CRUD operations for videos"""
    
    def __init__(self, db):
        self.db = db
    
    def create(self, title: str, source_url: str, **kwargs) -> Video:
        video = Video(title=title, source_url=source_url, **kwargs)
        self.db.add(video)
        self.db.commit()
        self.db.refresh(video)
        return video
    
    def get_by_id(self, video_id: int) -> Optional[Video]:
        return self.db.query(Video).filter(Video.id == video_id).first()
    
    def get_by_url(self, source_url: str) -> Optional[Video]:
        return self.db.query(Video).filter(Video.source_url == source_url).first()
    
    def search(self, query: str, limit: int = 20) -> list[Video]:
        return self.db.query(Video).filter(
            Video.title.ilike(f"%{query}%")
        ).limit(limit).all()
    
    def get_all(self, skip: int = 0, limit: int = 50) -> list[Video]:
        return self.db.query(Video).offset(skip).limit(limit).all()
    
    def get_by_category(self, category: str, limit: int = 20) -> list[Video]:
        return self.db.query(Video).filter(
            Video.category == category
        ).limit(limit).all()
    
    def update(self, video_id: int, **kwargs) -> Optional[Video]:
        video = self.get_by_id(video_id)
        if video:
            for key, value in kwargs.items():
                setattr(video, key, value)
            self.db.commit()
            self.db.refresh(video)
        return video
    
    def delete(self, video_id: int) -> bool:
        video = self.get_by_id(video_id)
        if video:
            self.db.delete(video)
            self.db.commit()
            return True
        return False
