"""
Auto-Updater Module for KV-Netflix
Handles automatic updates for yt-dlp, Playwright, and other dependencies
"""

import subprocess
import sys
import logging
from typing import Dict, Optional, Tuple
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_package_version(package_name: str) -> Optional[str]:
    """Get installed version of a Python package"""
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "show", package_name],
            capture_output=True,
            text=True,
            timeout=30
        )
        if result.returncode == 0:
            for line in result.stdout.split("\n"):
                if line.startswith("Version:"):
                    return line.split(":")[1].strip()
        return None
    except Exception as e:
        logger.error(f"Error getting version for {package_name}: {e}")
        return None


def update_package(package_name: str) -> Tuple[bool, str]:
    """Update a Python package to the latest version"""
    try:
        logger.info(f"Updating {package_name}...")
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "--upgrade", package_name],
            capture_output=True,
            text=True,
            timeout=120
        )
        if result.returncode == 0:
            new_version = get_package_version(package_name)
            logger.info(f"✓ {package_name} updated to version {new_version}")
            return True, f"Updated to {new_version}"
        else:
            logger.error(f"Failed to update {package_name}: {result.stderr}")
            return False, result.stderr[:200]
    except subprocess.TimeoutExpired:
        return False, "Update timed out"
    except Exception as e:
        logger.error(f"Error updating {package_name}: {e}")
        return False, str(e)


def update_yt_dlp() -> Tuple[bool, str]:
    """Update yt-dlp to the latest version"""
    return update_package("yt-dlp")


def update_playwright() -> Tuple[bool, str]:
    """Update Playwright and install browsers"""
    # First update the package
    success, msg = update_package("playwright")
    if not success:
        return success, msg
    
    # Then update browsers
    try:
        logger.info("Updating Playwright browsers...")
        result = subprocess.run(
            [sys.executable, "-m", "playwright", "install", "chromium"],
            capture_output=True,
            text=True,
            timeout=300  # Browser downloads can take a while
        )
        if result.returncode == 0:
            logger.info("✓ Playwright browsers updated")
            return True, msg + " + browsers updated"
        else:
            logger.warning(f"Browser update had issues: {result.stderr[:100]}")
            return True, msg + " (browser update may have issues)"
    except subprocess.TimeoutExpired:
        return True, msg + " (browser update timed out)"
    except Exception as e:
        return True, msg + f" (browser update error: {str(e)[:50]})"


def get_all_versions() -> Dict[str, Optional[str]]:
    """Get versions of all managed packages"""
    packages = ["yt-dlp", "playwright", "aiohttp", "beautifulsoup4", "lxml"]
    versions = {}
    for pkg in packages:
        versions[pkg] = get_package_version(pkg)
    return versions


def update_all_dependencies() -> Dict[str, Tuple[bool, str]]:
    """Update all managed dependencies"""
    results = {}
    
    # Update yt-dlp (most frequently updated)
    results["yt-dlp"] = update_yt_dlp()
    
    # Update Playwright (includes browser updates)
    results["playwright"] = update_playwright()
    
    # Update scraping dependencies
    results["aiohttp"] = update_package("aiohttp")
    results["beautifulsoup4"] = update_package("beautifulsoup4")
    results["lxml"] = update_package("lxml")
    
    return results


async def check_and_update_on_startup():
    """Run update check on application startup (async wrapper)"""
    import asyncio
    
    def _check():
        logger.info("=" * 50)
        logger.info("KV-Netflix Auto-Update Check")
        logger.info("=" * 50)
        
        versions = get_all_versions()
        logger.info("Current versions:")
        for pkg, ver in versions.items():
            logger.info(f"  {pkg}: {ver or 'Not installed'}")
        
        # Only update yt-dlp on startup (it updates frequently)
        # Other updates should be triggered manually
        success, msg = update_yt_dlp()
        if success:
            logger.info(f"✓ yt-dlp: {msg}")
        else:
            logger.warning(f"⚠ yt-dlp update failed: {msg}")
        
        logger.info("=" * 50)
        return {"yt-dlp": (success, msg)}
    
    # Run in executor to avoid blocking
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _check)


# For direct testing
if __name__ == "__main__":
    print("Testing auto-updater...")
    print("\nCurrent versions:")
    for pkg, ver in get_all_versions().items():
        print(f"  {pkg}: {ver}")
    
    print("\nUpdating yt-dlp...")
    success, msg = update_yt_dlp()
    print(f"  Result: {msg}")
