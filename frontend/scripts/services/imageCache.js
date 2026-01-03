/**
 * Image Cache Service
 * Caches movie posters and thumbnails for faster loading
 */

const IMAGE_CACHE_NAME = 'kvstream-images-v1';
const IMAGE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const IMAGE_CACHE_MAX_ITEMS = 500;

class ImageCacheService {
    constructor() {
        this.memoryCache = new Map();
        this.cacheEnabled = 'caches' in window;
        this.pendingRequests = new Map();
    }

    /**
     * Get cached image or fetch and cache it
     * @param {string} url - Image URL
     * @returns {Promise<string>} - Blob URL for the image
     */
    async getCachedImage(url) {
        if (!url || !this.cacheEnabled) return url;

        // Check memory cache first (fastest)
        if (this.memoryCache.has(url)) {
            return this.memoryCache.get(url);
        }

        // Deduplicate pending requests
        if (this.pendingRequests.has(url)) {
            return this.pendingRequests.get(url);
        }

        const fetchPromise = this._fetchAndCache(url);
        this.pendingRequests.set(url, fetchPromise);

        try {
            const result = await fetchPromise;
            return result;
        } finally {
            this.pendingRequests.delete(url);
        }
    }

    async _fetchAndCache(url) {
        try {
            const cache = await caches.open(IMAGE_CACHE_NAME);

            // Check cache first
            const cachedResponse = await cache.match(url);
            if (cachedResponse) {
                const blob = await cachedResponse.blob();
                const blobUrl = URL.createObjectURL(blob);
                this.memoryCache.set(url, blobUrl);
                return blobUrl;
            }

            // Fetch and cache
            const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
            if (response.ok) {
                const responseClone = response.clone();
                cache.put(url, responseClone);

                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                this.memoryCache.set(url, blobUrl);

                // Cleanup old cache entries periodically
                this._cleanupCache(cache);

                return blobUrl;
            }
        } catch (error) {
            // Silent fail - return original URL
            console.warn('Image cache failed:', url);
        }

        return url;
    }

    /**
     * Preload images for faster display
     * @param {string[]} urls - Array of image URLs to preload
     */
    async preloadImages(urls) {
        if (!urls || urls.length === 0) return;

        // Batch preload with limited concurrency
        const batchSize = 6;
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, i + batchSize);
            await Promise.allSettled(batch.map(url => this.getCachedImage(url)));
        }
    }

    /**
     * Create optimized image element with lazy loading and caching
     * @param {string} url - Image source URL
     * @param {string} alt - Alt text
     * @param {string} className - CSS class
     * @returns {HTMLImageElement}
     */
    createCachedImage(url, alt = '', className = '') {
        const img = document.createElement('img');
        img.alt = alt;
        img.className = className;
        img.loading = 'lazy';
        img.decoding = 'async';

        // Set placeholder first
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect fill="%23222"%3E%3C/rect%3E%3C/svg%3E';

        // Then load cached image
        if (url) {
            this.getCachedImage(url).then(cachedUrl => {
                img.src = cachedUrl;
            });
        }

        return img;
    }

    /**
     * Cleanup old cache entries
     */
    async _cleanupCache(cache) {
        try {
            const keys = await cache.keys();
            if (keys.length > IMAGE_CACHE_MAX_ITEMS) {
                // Remove oldest 20% of entries
                const toRemove = Math.floor(keys.length * 0.2);
                for (let i = 0; i < toRemove; i++) {
                    await cache.delete(keys[i]);
                }
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    }

    /**
     * Clear all cached images
     */
    async clearCache() {
        this.memoryCache.clear();
        if (this.cacheEnabled) {
            await caches.delete(IMAGE_CACHE_NAME);
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        const stats = {
            memoryItems: this.memoryCache.size,
            cacheItems: 0,
            cacheSize: 0
        };

        if (this.cacheEnabled) {
            try {
                const cache = await caches.open(IMAGE_CACHE_NAME);
                const keys = await cache.keys();
                stats.cacheItems = keys.length;
            } catch (e) { }
        }

        return stats;
    }
}

// Export singleton instance
export const imageCache = new ImageCacheService();

// Auto-preload visible images on scroll
let preloadObserver = null;

export function setupImagePreloading() {
    if (preloadObserver) return;

    preloadObserver = new IntersectionObserver((entries) => {
        const urls = entries
            .filter(e => e.isIntersecting)
            .map(e => e.target.dataset.src || e.target.src)
            .filter(Boolean);

        if (urls.length > 0) {
            imageCache.preloadImages(urls);
        }
    }, {
        rootMargin: '200px',
        threshold: 0
    });

    // Observe all images with data-src or src
    document.querySelectorAll('img[data-src], img[src]').forEach(img => {
        preloadObserver.observe(img);
    });
}

export default imageCache;
