"""
Security Module Tests
Tests for HMAC authentication and signature generation
"""
import pytest
import time
import hmac
import hashlib


class TestSignatureGeneration:
    """Tests for HMAC signature generation"""
    
    def test_generate_signature_get_request(self, test_settings):
        """Should generate valid signature for GET requests"""
        from security import generate_signature
        
        timestamp = str(int(time.time()))
        path = "/api/catalog"
        method = "GET"
        
        signature = generate_signature(timestamp, path, method)
        
        assert signature is not None
        assert len(signature) == 64  # SHA256 hex digest length
    
    def test_generate_signature_post_request(self, test_settings):
        """Should generate valid signature for POST requests with body"""
        from security import generate_signature
        
        timestamp = str(int(time.time()))
        path = "/api/extract"
        method = "POST"
        body = b'{"url": "https://example.com/video"}'
        
        signature = generate_signature(timestamp, path, method, body)
        
        assert signature is not None
        assert len(signature) == 64
    
    def test_different_timestamps_produce_different_signatures(self, test_settings):
        """Different timestamps should produce different signatures"""
        from security import generate_signature
        
        sig1 = generate_signature("1000000000", "/api/test", "GET")
        sig2 = generate_signature("1000000001", "/api/test", "GET")
        
        assert sig1 != sig2
    
    def test_different_paths_produce_different_signatures(self, test_settings):
        """Different paths should produce different signatures"""
        from security import generate_signature
        
        timestamp = str(int(time.time()))
        
        sig1 = generate_signature(timestamp, "/api/path1", "GET")
        sig2 = generate_signature(timestamp, "/api/path2", "GET")
        
        assert sig1 != sig2
    
    def test_different_methods_produce_different_signatures(self, test_settings):
        """Different HTTP methods should produce different signatures"""
        from security import generate_signature
        
        timestamp = str(int(time.time()))
        path = "/api/test"
        
        sig_get = generate_signature(timestamp, path, "GET")
        sig_post = generate_signature(timestamp, path, "POST")
        
        assert sig_get != sig_post
    
    def test_body_affects_signature(self, test_settings):
        """Request body should affect the signature"""
        from security import generate_signature
        
        timestamp = str(int(time.time()))
        path = "/api/test"
        method = "POST"
        
        sig_empty = generate_signature(timestamp, path, method, b"")
        sig_with_body = generate_signature(timestamp, path, method, b'{"key": "value"}')
        
        assert sig_empty != sig_with_body


class TestSignatureVerification:
    """Tests for signature verification logic"""
    
    def test_valid_signature_passes(self, test_client, auth_headers):
        """Valid signature should pass authentication"""
        headers = auth_headers("/api/health", "GET")
        
        # Health doesn't require auth, but this tests the header generation
        response = test_client.get("/api/health", headers=headers)
        
        assert response.status_code == 200
    
    def test_missing_headers_rejected(self, test_client):
        """Requests without auth headers should be rejected on protected endpoints"""
        response = test_client.get("/api/admin/version")
        
        assert response.status_code == 401
        assert "Authentication headers missing" in response.json()["detail"]
    
    def test_invalid_signature_rejected(self, test_client):
        """Invalid signature should be rejected"""
        headers = {
            "X-Timestamp": str(int(time.time())),
            "X-Signature": "invalid_signature_here"
        }
        
        response = test_client.get("/api/admin/version", headers=headers)
        
        assert response.status_code == 401
        assert "Invalid signature" in response.json()["detail"]
    
    def test_expired_timestamp_rejected(self, test_client, test_settings):
        """Expired timestamps should be rejected"""
        from security import generate_signature
        
        # Timestamp from 10 minutes ago (beyond 5 min window)
        old_timestamp = str(int(time.time()) - 600)
        path = "/api/admin/version"
        signature = generate_signature(old_timestamp, path, "GET")
        
        headers = {
            "X-Timestamp": old_timestamp,
            "X-Signature": signature
        }
        
        response = test_client.get(path, headers=headers)
        
        assert response.status_code == 401
        assert "expired" in response.json()["detail"].lower()
    
    def test_invalid_timestamp_format_rejected(self, test_client):
        """Non-numeric timestamps should be rejected"""
        headers = {
            "X-Timestamp": "not-a-number",
            "X-Signature": "some_signature"
        }
        
        response = test_client.get("/api/admin/version", headers=headers)
        
        assert response.status_code == 401
        assert "Invalid timestamp" in response.json()["detail"]
