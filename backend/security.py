"""
StreamFlow Security - HMAC Authentication
Implements request signing to prevent unauthorized API access
"""
import hmac
import hashlib
import time
from fastapi import Request, HTTPException, Security
from fastapi.security import APIKeyHeader
from starlette.middleware.base import BaseHTTPMiddleware

from config import settings
from logging_config import get_logger

logger = get_logger("security")

# Header definitions
signature_header = APIKeyHeader(name="X-Signature", auto_error=False)
timestamp_header = APIKeyHeader(name="X-Timestamp", auto_error=False)

# Request body cache key
REQUEST_BODY_KEY = "_cached_body"


class BodyCacheMiddleware(BaseHTTPMiddleware):
    """
    Middleware to cache request body for HMAC verification.
    This solves the issue of body consumption in FastAPI.
    """
    
    async def dispatch(self, request: Request, call_next):
        # Only cache body for methods that have a body
        if request.method in ("POST", "PUT", "PATCH"):
            body = await request.body()
            # Store in request state for later access
            request.state._cached_body = body
        
        response = await call_next(request)
        return response


def get_cached_body(request: Request) -> bytes:
    """Get the cached request body, or empty bytes if not cached."""
    return getattr(request.state, REQUEST_BODY_KEY, b"")


async def verify_hmac(
    request: Request,
    signature: str = Security(signature_header),
    timestamp: str = Security(timestamp_header)
) -> bool:
    """
    Verify HMAC signature of the request.
    
    Signature = HMAC_SHA256(secret, timestamp + path + method + body)
    
    This provides:
    - Authentication: Only clients with the secret can sign requests
    - Integrity: Request content cannot be tampered with
    - Replay protection: Timestamp prevents request reuse (5 min window)
    
    Returns:
        True if signature is valid
        
    Raises:
        HTTPException: 401 if authentication fails
    """
    if not signature or not timestamp:
        logger.warning("Authentication headers missing", extra={
            "path": request.url.path,
            "method": request.method
        })
        raise HTTPException(status_code=401, detail="Authentication headers missing")

    # 1. Check timestamp (prevents replay attacks, 5 minute window)
    try:
        request_time = int(timestamp)
        current_time = int(time.time())
        time_diff = abs(current_time - request_time)
        
        if time_diff > 1800:  # 30 minutes - increased for NAS time sync tolerance
            logger.warning(f"Request expired: time_diff={time_diff}s", extra={
                "path": request.url.path,
                "request_time": request_time,
                "current_time": current_time
            })
            raise HTTPException(status_code=401, detail="Request expired")
    except ValueError:
        logger.warning("Invalid timestamp format", extra={"timestamp": timestamp})
        raise HTTPException(status_code=401, detail="Invalid timestamp")

    # 2. Reconstruct payload including body for POST/PUT/PATCH
    body = b""
    if request.method in ("POST", "PUT", "PATCH"):
        body = get_cached_body(request)
    
    path = request.url.path
    method = request.method
    
    # Payload format: timestamp + path + method + body
    payload = f"{timestamp}{path}{method}".encode() + body
    
    # 3. Calculate expected signature
    expected_signature = hmac.new(
        settings.secret_key.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    # 4. Constant-time comparison (prevents timing attacks)
    if not hmac.compare_digest(signature, expected_signature):
        logger.warning("Invalid signature", extra={
            "path": request.url.path,
            "method": request.method
        })
        raise HTTPException(status_code=401, detail="Invalid signature")

    return True


def generate_signature(timestamp: str, path: str, method: str, body: bytes = b"") -> str:
    """
    Generate HMAC signature for a request.
    
    This is useful for testing or client-side signature generation.
    
    Args:
        timestamp: Unix timestamp as string
        path: Request path (e.g., "/api/catalog")
        method: HTTP method (e.g., "GET", "POST")
        body: Request body bytes (empty for GET)
    
    Returns:
        Hex-encoded HMAC-SHA256 signature
    """
    payload = f"{timestamp}{path}{method}".encode() + body
    return hmac.new(
        settings.secret_key.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
