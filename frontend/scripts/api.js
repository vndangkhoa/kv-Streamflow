/**
 * StreamFlow - API Client
 * Handles all communication with the backend
 */

const API_BASE = '/api';

class ApiClient {
    /**
     * Extract video stream URL
     * @param {string} url - Source video URL
     * @param {string} quality - Optional quality preference (e.g., "1080p")
     * @returns {Promise<Object>} Extraction result with stream URL
     */
    async extractVideo(url, quality = null) {
        const response = await fetch(`${API_BASE}/extract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, quality })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Extraction failed');
        }

        return response.json();
    }

    /**
     * Get available quality options for a video
     * @param {string} url - Source video URL
     * @returns {Promise<string[]>} List of available qualities
     */
    async getQualities(url) {
        const response = await fetch(`${API_BASE}/qualities?url=${encodeURIComponent(url)}`);

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

        const response = await fetch(url);

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
        const response = await fetch(`${API_BASE}/videos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        const response = await fetch(`${API_BASE}/videos/${id}`, {
            method: 'DELETE'
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
        const response = await fetch(
            `${API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`
        );

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

        const response = await fetch(url);

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
        const response = await fetch(`${API_BASE}/rophim/home/curated`);

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
        const response = await fetch(
            `${API_BASE}/rophim/search?q=${encodeURIComponent(query)}&limit=${limit}`
        );

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
        const response = await fetch(`${API_BASE}/rophim/home/sections?page=${page}&view=${view}`);
        if (!response.ok) throw new Error('Failed to fetch home sections');
        return response.json();
    }

    /**
     * Get movie details from RoPhim
     * @param {string} slug - Movie slug
     * @returns {Promise<Object>} Movie details
     */
    async getRophimMovie(slug) {
        const response = await fetch(`${API_BASE}/rophim/movie/${encodeURIComponent(slug)}`);

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
        const response = await fetch(
            `${API_BASE}/rophim/stream/${encodeURIComponent(slug)}?episode=${episode}`
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
        const response = await fetch(`${API_BASE}/rophim/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ source_url: sourceUrl, slug: slug || '', episode, server })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get stream');
        }

        return response.json();
    }
}

export const api = new ApiClient();
