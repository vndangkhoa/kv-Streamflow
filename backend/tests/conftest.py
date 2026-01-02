"""
StreamFlow Test Configuration
Pytest fixtures and test utilities
"""
import os
import sys
import pytest
from typing import Generator

# Add backend to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set test environment
os.environ["STREAMFLIX_DEBUG"] = "true"
os.environ["DATABASE_URL"] = "sqlite:///./test_streamflow.db"


@pytest.fixture(scope="session")
def test_settings():
    """Get test settings"""
    from config import settings
    return settings


@pytest.fixture(scope="function")
def test_client():
    """Create a test client for API testing"""
    from fastapi.testclient import TestClient
    from main import app
    
    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="function")
def async_client():
    """Create an async test client for async API testing"""
    import httpx
    from main import app
    
    async def _get_client():
        async with httpx.AsyncClient(app=app, base_url="http://test") as client:
            yield client
    
    return _get_client


@pytest.fixture(scope="function")
def db_session():
    """Create a test database session"""
    from database import SessionLocal, init_db, Base, engine
    
    # Create tables
    init_db()
    
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Clean up test database after tests
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def auth_headers():
    """Generate valid authentication headers for testing"""
    import time
    from security import generate_signature
    
    timestamp = str(int(time.time()))
    
    def _get_headers(path: str, method: str = "GET", body: bytes = b""):
        signature = generate_signature(timestamp, path, method, body)
        return {
            "X-Timestamp": timestamp,
            "X-Signature": signature
        }
    
    return _get_headers


@pytest.fixture
def sample_movie():
    """Sample movie data for testing"""
    return {
        "id": "test-movie",
        "title": "Test Movie",
        "original_title": "Original Test",
        "slug": "test-movie",
        "thumbnail": "https://example.com/thumb.jpg",
        "poster_url": "https://example.com/poster.jpg",
        "year": 2024,
        "quality": "HD",
        "category": "single",
        "rating": 8.5,
        "genres": ["Action", "Drama"],
    }


@pytest.fixture
def sample_video():
    """Sample video data for testing"""
    return {
        "title": "Test Video",
        "source_url": "https://example.com/video.mp4",
        "description": "A test video",
        "thumbnail": "https://example.com/thumb.jpg",
        "category": "movies"
    }
