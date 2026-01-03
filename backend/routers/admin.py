"""
Admin Router
Version management and system updates
"""
import asyncio
from fastapi import APIRouter, Depends

from security import verify_hmac
from logging_config import get_logger

logger = get_logger("admin")

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/version")
async def get_versions(authorized: bool = Depends(verify_hmac)):
    """Get versions of all managed dependencies"""
    from auto_updater import get_all_versions
    
    loop = asyncio.get_event_loop()
    versions = await loop.run_in_executor(None, get_all_versions)
    
    logger.info("Retrieved package versions")
    return {
        "status": "ok",
        "versions": versions
    }


@router.post("/update")
async def trigger_update(
    package: str = None,
    authorized: bool = Depends(verify_hmac)
):
    """
    Trigger manual update of dependencies
    
    Args:
        package: Specific package to update (yt-dlp, playwright, all)
                 If not specified, updates all packages
    """
    from auto_updater import update_yt_dlp, update_playwright, update_all_dependencies
    
    loop = asyncio.get_event_loop()
    
    if package == "yt-dlp":
        logger.info("Updating yt-dlp")
        success, msg = await loop.run_in_executor(None, update_yt_dlp)
        return {"package": "yt-dlp", "success": success, "message": msg}
    
    elif package == "playwright":
        logger.info("Updating playwright")
        success, msg = await loop.run_in_executor(None, update_playwright)
        return {"package": "playwright", "success": success, "message": msg}
    
    else:
        logger.info("Updating all dependencies")
        results = await loop.run_in_executor(None, update_all_dependencies)
        return {
            "status": "completed",
            "results": {pkg: {"success": s, "message": m} for pkg, (s, m) in results.items()}
        }
