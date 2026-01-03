import os
import httpx
import hashlib
from PIL import Image
from io import BytesIO
from fastapi.responses import Response
from typing import Optional

import asyncio
from functools import partial

CACHE_DIR = "cache/images"
os.makedirs(CACHE_DIR, exist_ok=True)

def process_image_sync(content: bytes, width: Optional[int], cache_path: str) -> Optional[bytes]:
    """Sync function to process image in thread pool"""
    try:
        img = Image.open(BytesIO(content))
        
        # Convert to RGB if necessary
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Resize if width specified
        if width and img.width > width:
            ratio = width / float(img.width)
            height = int(float(img.height) * float(ratio))
            img = img.resize((width, height), Image.LANCZOS)

        # Save to buffer as WebP
        output = BytesIO()
        img.save(output, format="WEBP", quality=80)
        webp_data = output.getvalue()

        # Save to cache
        with open(cache_path, "wb") as f:
            f.write(webp_data)
            
        return webp_data
    except Exception as e:
        print(f"Error processing image sync: {e}")
        return None

async def get_proxied_image(url: str, width: Optional[int] = None):
    """
    Fetch an image, resize it, convert to WebP, and cache it.
    Non-blocking version.
    """
    # Create a unique cache key based on URL and width
    cache_key = hashlib.md5(f"{url}_{width}".encode()).hexdigest()
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.webp")

    # 1. Check if cached version exists
    if os.path.exists(cache_path):
        # File IO in asyncio can still block slightly but usually acceptable for small files.
        # Ideally use aiofiles, but standard open is mostly fine for this scale.
        with open(cache_path, "rb") as f:
            return Response(content=f.read(), media_type="image/webp")

    # 2. Fetch original image (Async I/O)
    async with httpx.AsyncClient(follow_redirects=True) as client:
        try:
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
        except Exception as e:
            return None


    # 3. Process image with Pillow
    try:
        img = Image.open(BytesIO(response.content))
        
        # Convert to RGB if necessary (e.g., from RGBA or CMYK)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Resize if width specified
        if width and img.width > width:
            ratio = width / float(img.width)
            height = int(float(img.height) * float(ratio))
            img = img.resize((width, height), Image.LANCZOS)

        # 4. Save to buffer as WebP
        output = BytesIO()
        img.save(output, format="WEBP", quality=80)
        webp_data = output.getvalue()

        # 5. Save to cache
        with open(cache_path, "wb") as f:
            f.write(webp_data)

        return Response(content=webp_data, media_type="image/webp")

    except Exception as e:
        print(f"Error processing image: {e}")
        return None
