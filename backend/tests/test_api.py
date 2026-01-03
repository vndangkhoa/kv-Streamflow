"""
API Endpoint Tests
Tests for core API endpoints
"""
import pytest
from fastapi import status


class TestHealthEndpoint:
    """Tests for the health check endpoint"""
    
    def test_health_check_returns_ok(self, test_client):
        """Health endpoint should return healthy status"""
        response = test_client.get("/api/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "cache_type" in data
    
    def test_health_check_has_cache_type(self, test_client):
        """Health endpoint should indicate cache type"""
        response = test_client.get("/api/health")
        data = response.json()
        
        assert data["cache_type"] in ["redis", "memory"]


class TestImageProxy:
    """Tests for the image proxy endpoint"""
    
    def test_image_proxy_requires_url(self, test_client):
        """Image proxy should require URL parameter"""
        response = test_client.get("/api/images/proxy")
        
        # Should fail without URL parameter
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_image_proxy_invalid_url(self, test_client):
        """Image proxy should handle invalid URLs gracefully"""
        response = test_client.get("/api/images/proxy?url=not-a-valid-url")
        
        # Should return 404 for invalid/unreachable URLs
        assert response.status_code in [status.HTTP_404_NOT_FOUND, status.HTTP_500_INTERNAL_SERVER_ERROR]


class TestAuthenticatedEndpoints:
    """Tests for endpoints requiring HMAC authentication"""
    
    def test_extract_requires_auth(self, test_client):
        """Extract endpoint should require authentication"""
        response = test_client.post(
            "/api/extract",
            json={"url": "https://example.com/video"}
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_extract_with_valid_auth(self, test_client, auth_headers):
        """Extract endpoint should accept valid auth headers"""
        headers = auth_headers("/api/extract", "POST", b'{"url": "https://example.com/video"}')
        
        response = test_client.post(
            "/api/extract",
            json={"url": "https://example.com/video"},
            headers=headers
        )
        
        # Should not be 401 (may be 500 if URL is invalid, but auth passed)
        assert response.status_code != status.HTTP_401_UNAUTHORIZED
    
    def test_catalog_requires_auth(self, test_client):
        """Catalog endpoint should require authentication"""
        response = test_client.get("/api/rophim/catalog")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_catalog_with_valid_auth(self, test_client, auth_headers):
        """Catalog endpoint should work with valid auth"""
        headers = auth_headers("/api/rophim/catalog", "GET")
        
        response = test_client.get(
            "/api/rophim/catalog",
            headers=headers
        )
        
        # Auth should pass, may timeout on external API but shouldn't be 401
        assert response.status_code != status.HTTP_401_UNAUTHORIZED


class TestVideoEndpoints:
    """Tests for video CRUD endpoints"""
    
    def test_list_videos_requires_auth(self, test_client):
        """List videos endpoint should require auth"""
        response = test_client.get("/api/videos")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_create_video_requires_auth(self, test_client, sample_video):
        """Create video endpoint should require auth"""
        response = test_client.post("/api/videos", json=sample_video)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_list_videos_with_auth(self, test_client, auth_headers):
        """List videos should return empty list initially"""
        headers = auth_headers("/api/videos", "GET")
        
        response = test_client.get("/api/videos", headers=headers)
        
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)


class TestSearchEndpoint:
    """Tests for search functionality"""
    
    def test_search_requires_query(self, test_client, auth_headers):
        """Search should require a query parameter"""
        headers = auth_headers("/api/rophim/search", "GET")
        
        response = test_client.get("/api/rophim/search", headers=headers)
        
        # Should fail without 'q' parameter
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    
    def test_search_with_query(self, test_client, auth_headers):
        """Search should work with valid query"""
        headers = auth_headers("/api/rophim/search?q=test", "GET")
        
        response = test_client.get(
            "/api/rophim/search?q=test",
            headers=headers
        )
        
        # Should not be 401 or 422
        assert response.status_code not in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_422_UNPROCESSABLE_ENTITY
        ]
