/**
 * HistoryService - Manages watch history using localStorage
 * Allows users to save progress without logging in.
 */
if (!window.HistoryService) {
    window.HistoryService = class HistoryService {
        constructor() {
            this.STORAGE_KEY = 'kv_watch_history';
            this.MAX_ITEMS = 100; // Limit history size
        }

        /**
         * Get all history items
         * @returns {Array} List of history items sorted by timestamp (newest first)
         */
        getHistory() {
            try {
                const history = localStorage.getItem(this.STORAGE_KEY);
                return history ? JSON.parse(history) : [];
            } catch (e) {
                console.error('Error reading history:', e);
                return [];
            }
        }

        /**
         * Add or update a movie/episode in history
         * @param {Object} movie - Movie object
         * @param {Object} progress - Progress info (optional)
         */
        addToHistory(movie, progress = {}) {
            const history = this.getHistory();

            // Remove existing entry for this item if it exists
            // Identify by slug
            const existingIndex = history.findIndex(item => item.slug === movie.slug);

            if (existingIndex !== -1) {
                history.splice(existingIndex, 1);
            }

            // Create new entry
            const entry = {
                id: movie.id || movie.slug,
                slug: movie.slug,
                title: movie.title,
                thumbnail: movie.thumbnail,
                backdrop: movie.backdrop,
                description: movie.description,
                timestamp: Date.now(),
                progress: {
                    currentTime: progress.currentTime || 0,
                    duration: progress.duration || 0,
                    percentage: progress.percentage || 0,
                    episode: progress.episode || 1
                },
                ...movie // Store other metadata
            };

            // Add to front
            history.unshift(entry);

            // Trim size
            if (history.length > this.MAX_ITEMS) {
                history.pop();
            }

            this.saveHistory(history);
        }

        // --- Favorites (My List) Methods ---

        getFavorites() {
            try {
                const list = localStorage.getItem('myList');
                return list ? JSON.parse(list) : [];
            } catch (e) { return []; }
        }

        toggleFavorite(movie) {
            let list = this.getFavorites();
            const exists = list.some(item => item.slug === movie.slug);

            if (exists) {
                list = list.filter(item => item.slug !== movie.slug);
            } else {
                list.push({
                    id: movie.id || movie.slug,
                    slug: movie.slug,
                    title: movie.title,
                    thumbnail: movie.thumbnail,
                    addedAt: Date.now()
                });
            }

            localStorage.setItem('myList', JSON.stringify(list));
            return !exists; // Return true if added, false if removed
        }

        isFavorite(slug) {
            return this.getFavorites().some(item => item.slug === slug);
        }

        /**
         * Remove an item from history
         * @param {String} slug 
         */
        removeFromHistory(slug) {
            let history = this.getHistory();
            history = history.filter(item => item.slug !== slug);
            this.saveHistory(history);
        }

        /**
         * Clear all history
         */
        clearHistory() {
            localStorage.removeItem(this.STORAGE_KEY);
        }

        saveHistory(history) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
                // Dispatch event for UI updates
                window.dispatchEvent(new CustomEvent('history-updated', { detail: history }));
            } catch (e) {
                console.error('Error saving history:', e);
            }
        }

        /**
         * Check if a movie is in history
         */
        isInHistory(slug) {
            return this.getHistory().some(item => item.slug === slug);
        }
    }

    // Export singleton
    window.historyService = new window.HistoryService();
}
