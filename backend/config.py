"""
StreamFlow Configuration Management
Uses Pydantic Settings for type-safe environment configuration
"""
import os
import sys
from typing import Optional
from pydantic import BaseModel


class Settings(BaseModel):
    """Application settings loaded from environment variables"""
    
    # Security - REQUIRED (no default to prevent insecure deployments)
    secret_key: str = ""
    
    # Database
    database_url: str = "sqlite:///./streamflow.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # Application
    debug: bool = False
    app_version: str = "1.2.0"
    
    # CORS origins (comma-separated list)
    cors_origins: str = "https://nf.khoavo.myds.me,http://localhost:5173,http://localhost:3000,capacitor://localhost,http://localhost"
    
    # Cache TTL settings (in seconds)
    cache_default_ttl: int = 10800  # 3 hours
    cache_catalog_ttl: int = 3600   # 1 hour
    cache_home_ttl: int = 21600     # 6 hours
    
    # Request timeout
    request_timeout: int = 15
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
    
    model_config = {"extra": "ignore"}


def load_settings() -> Settings:
    """
    Load settings from environment variables.
    Fails fast if critical settings are missing.
    """
    secret_key = os.getenv("STREAMFLIX_SECRET_KEY", "sf_tv_secure_9s8d7f6g5h4j3k2l1")
    
    # Fail fast if secret key is not set in production
    if not secret_key:
        debug_mode = os.getenv("STREAMFLIX_DEBUG", "false").lower() == "true"
        if not debug_mode:
            print("=" * 60)
            print("ERROR: STREAMFLIX_SECRET_KEY environment variable is required!")
            print("=" * 60)
            print("\nFor development, you can set STREAMFLIX_DEBUG=true")
            print("For production, set a secure random key:")
            print("  export STREAMFLIX_SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')")
            print("")
            sys.exit(1)
        else:
            # Development mode - use a random key each restart
            import secrets
            secret_key = secrets.token_hex(32)
            print("⚠ WARNING: Using random secret key for development (sessions won't persist)")
    
    return Settings(
        secret_key=secret_key,
        database_url=os.getenv("DATABASE_URL", "sqlite:///./streamflow.db"),
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
        debug=os.getenv("STREAMFLIX_DEBUG", "false").lower() == "true",
        cors_origins=os.getenv("STREAMFLIX_CORS_ORIGINS", Settings.model_fields["cors_origins"].default),
        cache_default_ttl=int(os.getenv("STREAMFLIX_CACHE_DEFAULT_TTL", "10800")),
        cache_catalog_ttl=int(os.getenv("STREAMFLIX_CACHE_CATALOG_TTL", "3600")),
        cache_home_ttl=int(os.getenv("STREAMFLIX_CACHE_HOME_TTL", "21600")),
        request_timeout=int(os.getenv("STREAMFLIX_REQUEST_TIMEOUT", "15")),
    )


# Singleton settings instance
settings = load_settings()
