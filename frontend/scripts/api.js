/**
 * StreamFlow - API Client
 * Handles all communication with the backend
 */

// Hardcode API_BASE to ensure Android App works correctly
const API_BASE = 'https://nf.khoavo.myds.me/api';
// In production, this should NOT be hardcoded if possible, or obfuscated.
// Simple obfuscation for the secret key (should be improved in production)
const _s = [115, 102, 95, 116, 118, 95, 115, 101, 99, 117, 114, 101, 95, 57, 115, 56, 100, 55, 102, 54, 103, 53, 104, 52, 106, 51, 107, 50, 108, 49];
const SECRET_KEY = String.fromCharCode(..._s);

class ApiClient {
    /**
     * Generate HMAC signature for a request
     * @param {string} path - API path (e.g., /api/extract)
     * @param {string} method - HTTP method
     * @returns {Object} Headers with Signature and Timestamp
     */
    async signRequest(path, method = 'GET') {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        // Path needs to be strictly /api/... as per backend request.url.path
        const fullPath = path.startsWith('/api') ? path : `/api${path}`;

        const payload = `${timestamp}${fullPath}${method.toUpperCase()}`;

        const encoder = new TextEncoder();
        const keyData = encoder.encode(SECRET_KEY);
        const payloadData = encoder.encode(payload);

        const key = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signatureBuffer = await crypto.subtle.sign(
            'HMAC',
            key,
            payloadData
        );

        const signatureArray = Array.from(new Uint8Array(signatureBuffer));
        const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return {
            'X-Signature': signatureHex,
            'X-Timestamp': timestamp
        };
    }

    /**
     * Get a proxied and optimized image URL
     * @param {string} url - Original image URL
     * @param {number} width - Desired width
     * @returns {string} Proxied URL
     */
    getProxyUrl(url, width = 200) {
        if (!url) return '';
        return `${API_BASE}/images/proxy?url=${encodeURIComponent(url)}&width=${width}`;
    }

    /**
     * Extract video stream URL
     * @param {string} url - Source video URL
     * @param {string} quality - Optional quality preference (e.g., "1080p")
     * @returns {Promise<Object>} Extraction result with stream URL
     */
    async extractVideo(url, quality = null) {
        const path = '/api/extract';
        const authHeaders = await this.signRequest(path, 'POST');

        const response = await fetch(`${API_BASE}/extract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders
            },
            body: JSON.stringify({ url, quality })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Extraction failed');
        }

        return response.json();
    }

    async updateHeaders(options = {}, path, method = 'GET') {
        const authHeaders = await this.signRequest(path, method);
        return {
            ...options,
            headers: {
                ...options.headers,
                ...authHeaders
            }
        };
    }

    /**
     * Get available quality options for a video
     * @param {string} url - Source video URL
     * @returns {Promise<string[]>} List of available qualities
     */
    async getQualities(url) {
        const path = `/api/qualities`;
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/qualities?url=${encodeURIComponent(url)}`, {
            headers: authHeaders
        });

        if (!response.ok) {
            throw new Error('Failed to get qualities');
        }

        const data = await response.json();
        return data.qualities;
    }

    /**
     * List all videos
     * @param {Object} options - Query options
     * @returns {Promise<Array>} List of videos
     */
    async listVideos({ skip = 0, limit = 50, category = null } = {}) {
        let url = `${API_BASE}/videos?skip=${skip}&limit=${limit}`;
        if (category && category !== 'all') {
            url += `&category=${encodeURIComponent(category)}`;
        }

        const path = '/api/videos';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(url, { headers: authHeaders });

        if (!response.ok) {
            throw new Error('Failed to fetch videos');
        }

        return response.json();
    }

    /**
     * Add a video to the library
     * @param {Object} video - Video data
     * @returns {Promise<Object>} Created video
     */
    async addVideo(video) {
        const path = '/api/videos';
        const authHeaders = await this.signRequest(path, 'POST');

        const response = await fetch(`${API_BASE}/videos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders
            },
            body: JSON.stringify(video)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to add video');
        }

        return response.json();
    }

    /**
     * Delete a video from the library
     * @param {number} id - Video ID
     */
    async deleteVideo(id) {
        const path = `/api/videos/${id}`;
        const authHeaders = await this.signRequest(path, 'DELETE');

        const response = await fetch(`${API_BASE}/videos/${id}`, {
            method: 'DELETE',
            headers: authHeaders
        });

        if (!response.ok) {
            throw new Error('Failed to delete video');
        }
    }

    /**
     * Search videos by title
     * @param {string} query - Search query
     * @param {number} limit - Max results
     * @returns {Promise<Array>} Search results
     */
    async searchVideos(query, limit = 20) {
        const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        const path = '/api/search';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(url, { headers: authHeaders });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        return response.json();
    }

    /**
     * Check API health
     * @returns {Promise<Object>} Health status
     */
    async health() {
        const response = await fetch(`${API_BASE}/health`);
        return response.json();
    }

    // ============================================
    // RoPhim Integration Methods
    // ============================================

    /**
     * Get RoPhim movie catalog
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Catalog with movies
     */
    async getRophimCatalog({ category = null, country = null, genre = null, page = 1, limit = 24, sort = 'modified' } = {}) {
        let url = `${API_BASE}/rophim/catalog?page=${page}&limit=${limit}&sort=${sort}`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (country) url += `&country=${encodeURIComponent(country)}`;
        if (genre) url += `&genre=${encodeURIComponent(genre)}`;

        const path = '/api/rophim/catalog';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(url, { headers: authHeaders });

        if (!response.ok) {
            throw new Error('Failed to fetch RoPhim catalog');
        }

        return response.json();
    }

    /**
     * Get curated homepage sections (Top Rated, New Releases, by Genre)
     * @returns {Promise<Object>} Sections with movies sorted by rating
     */
    async getCuratedSections() {
        const path = '/api/rophim/home/curated';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/home/curated`, {
            headers: authHeaders
        });

        if (!response.ok) {
            throw new Error('Failed to fetch curated sections');
        }

        return response.json();
    }

    /**
     * Search movies on RoPhim
     * @param {string} query - Search query
     * @param {number} limit - Max results
     * @returns {Promise<Object>} Search results
     */
    async searchRophim(query, limit = 20) {
        const url = `${API_BASE}/rophim/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        const path = '/api/rophim/search';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(url, { headers: authHeaders });

        if (!response.ok) {
            throw new Error('RoPhim search failed');
        }

        return response.json();
    }

    /**
     * Get dynamic homepage sections (Genres/Countries)
     * @param {number} page - Page number
     * @returns {Promise<Object>} Sections
     */
    async getHomeSections(page = 2, view = 'home') {
        const path = '/api/rophim/home/sections';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/home/sections?page=${page}&view=${view}`, {
            headers: authHeaders
        });
        if (!response.ok) throw new Error('Failed to fetch home sections');
        return response.json();
    }

    /**
     * Get movie details from RoPhim
     * @param {string} slug - Movie slug
     * @returns {Promise<Object>} Movie details
     */
    async getRophimMovie(slug) {
        const path = `/api/rophim/movie/${encodeURIComponent(slug)}`;
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/movie/${encodeURIComponent(slug)}`, {
            headers: authHeaders
        });

        if (!response.ok) {
            throw new Error('Failed to fetch movie details');
        }

        return response.json();
    }

    /**
     * Get video stream URL from RoPhim
     * @param {string} slug - Movie slug
     * @param {number} episode - Episode number (default: 1)
     * @returns {Promise<Object>} Stream URL
     */
    async getRophimStream(slug, episode = 1) {
        const path = `/api/rophim/stream/${encodeURIComponent(slug)}`;
        const authHeaders = await this.signRequest(path, 'GET');

        const response = await fetch(
            `${API_BASE}/rophim/stream/${encodeURIComponent(slug)}?episode=${episode}`,
            { headers: authHeaders }
        );

        if (!response.ok) {
            throw new Error('Failed to get stream');
        }

        return response.json();
    }

    /**
     * Get video stream URL from PhimMoiChill using source URL or slug
     * This method extracts direct m3u8 from JWPlayer
     * @param {string} sourceUrl - Full source URL (e.g., https://royalcanalbikehire.ie/phim/movie-name)
     * @param {string} slug - Movie slug (optional, extracted from URL if not provided)
     * @param {number} episode - Episode number (default: 1)
     * @param {number} server - Server index (0=VIP1 m3u8, 1=VIP2 embed)
     * @returns {Promise<Object>} Stream URL
     */
    async getRophimStreamByUrl(sourceUrl, slug = '', episode = 1, server = 0) {
        const path = '/api/rophim/stream';
        const authHeaders = await this.signRequest(path, 'POST');

        const response = await fetch(`${API_BASE}/rophim/stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders
            },
            body: JSON.stringify({ source_url: sourceUrl, slug: slug || '', episode, server })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get stream');
        }

        return response.json();
    }

    /**
     * Discover all available categories
     * @returns {Promise<Object>} Categories
     */
    async discoverCategories() {
        const path = '/api/rophim/categories/discover';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/categories/discover`, {
            headers: authHeaders
        });
        if (!response.ok) throw new Error('Failed to discover categories');
        return response.json();
    }

    /**
     * Get movies for a specific category
     * @param {string} slug - Category slug
     * @param {number} page - Page
     * @returns {Promise<Object>} Movies
     */
    async getMoviesByCategory(slug, page = 1, limit = 24) {
        const path = '/api/rophim/category';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/category?slug=${encodeURIComponent(slug)}&page=${page}&limit=${limit}`, {
            headers: authHeaders
        });
        if (!response.ok) throw new Error('Failed to fetch category');
        return response.json();
    }
    /**
     * Get themed movie sections
     */
    async getHotMovies(limit = 24) {
        const path = '/api/rophim/categories/hot';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/categories/hot?limit=${limit}`, { headers: authHeaders });
        if (!response.ok) throw new Error('Failed to fetch hot movies');
        return response.json();
    }

    async getNewReleases(limit = 24) {
        const path = '/api/rophim/categories/new-releases';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/categories/new-releases?limit=${limit}`, { headers: authHeaders });
        if (!response.ok) throw new Error('Failed to fetch new releases');
        return response.json();
    }

    async getTop10() {
        const path = '/api/rophim/categories/top10';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/categories/top10`, { headers: authHeaders });
        if (!response.ok) throw new Error('Failed to fetch top 10');
        return response.json();
    }

    async getCinemaReleases(limit = 24) {
        const path = '/api/rophim/categories/cinema';
        const authHeaders = await this.signRequest(path, 'GET');
        const response = await fetch(`${API_BASE}/rophim/categories/cinema?limit=${limit}`, { headers: authHeaders });
        if (!response.ok) throw new Error('Failed to fetch cinema releases');
        return response.json();
    }
}

export const api = new ApiClient();
