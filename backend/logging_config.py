"""
StreamFlow Logging Configuration
Structured logging with JSON support for production
"""
import logging
import logging.config
import sys
from typing import Optional


def setup_logging(debug: bool = False, json_format: bool = False) -> logging.Logger:
    """
    Configure application logging.
    
    Args:
        debug: Enable debug level logging
        json_format: Use JSON format for production log aggregation
    
    Returns:
        Root logger instance
    """
    log_level = "DEBUG" if debug else "INFO"
    
    if json_format:
        # JSON format for production (compatible with log aggregators)
        log_format = '{"time": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s"}'
    else:
        # Human-readable format for development
        log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    
    config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": log_format,
                "datefmt": "%Y-%m-%d %H:%M:%S"
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "level": log_level,
                "formatter": "standard",
                "stream": "ext://sys.stdout"
            }
        },
        "loggers": {
            "streamflow": {
                "level": log_level,
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False
            }
        },
        "root": {
            "level": log_level,
            "handlers": ["console"]
        }
    }
    
    logging.config.dictConfig(config)
    return logging.getLogger("streamflow")


def get_logger(name: Optional[str] = None) -> logging.Logger:
    """
    Get a logger instance for a module.
    
    Args:
        name: Module name (e.g., __name__). If None, returns root streamflow logger.
    
    Returns:
        Logger instance
    
    Example:
        from logging_config import get_logger
        logger = get_logger(__name__)
        logger.info("Processing request", extra={"slug": slug})
    """
    if name:
        return logging.getLogger(f"streamflow.{name}")
    return logging.getLogger("streamflow")
