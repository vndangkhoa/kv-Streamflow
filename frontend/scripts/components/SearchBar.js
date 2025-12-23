/**
 * StreamFlow - Search Component
 * Real-time search with 300ms debouncing
 */

import { api } from '../api.js';

/**
 * Create a debounced function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Initialize search functionality
 * @param {HTMLInputElement} inputEl - Search input element
 * @param {HTMLElement} resultsEl - Search results container
 * @param {function} onSelect - Callback when result is selected
 */
export function initSearch(inputEl, resultsEl, onSelect) {
    if (!inputEl || !resultsEl) return;

    const DEBOUNCE_DELAY = 300;
    let currentQuery = '';

    /**
     * Perform search and update results
     * @param {string} query - Search query
     */
    async function performSearch(query) {
        currentQuery = query;

        if (!query || query.length < 2) {
            resultsEl.classList.remove('active');
            resultsEl.innerHTML = '';
            return;
        }

        try {
            // Use RoPhim search API instead of local database
            const response = await api.searchRophim(query);
            const results = response?.movies || [];

            // Only update if query hasn't changed
            if (query !== currentQuery) return;

            if (results.length === 0) {
                resultsEl.innerHTML = `
                    <div class="search__result" style="opacity: 0.5;">
                        <span>No results found for "${escapeHtml(query)}"</span>
                    </div>
                `;
            } else {
                resultsEl.innerHTML = results.map(video => `
                    <div class="search__result" data-video-slug="${video.slug}">
                        <img 
                            src="${video.poster_url || video.thumb_url || video.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 80 45\" fill=\"%231a1a1a\"%3E%3Crect width=\"80\" height=\"45\"/%3E%3C/svg%3E'}" 
                            alt="${escapeHtml(video.name || video.title)}"
                            class="search__result-thumb"
                            loading="lazy"
                        >
                        <div class="search__result-info">
                            <div class="search__result-title">${escapeHtml(video.name || video.title)}</div>
                            <div class="search__result-meta">
                                ${video.quality ? `${video.quality} • ` : ''}
                                ${video.year || ''}
                            </div>
                        </div>
                    </div>
                `).join('');

                // Add click handlers - navigate to watch page
                resultsEl.querySelectorAll('.search__result[data-video-slug]').forEach(el => {
                    el.addEventListener('click', () => {
                        const slug = el.dataset.videoSlug;
                        window.location.href = `/watch.html?id=${slug}&slug=${slug}`;
                    });
                });
            }

            resultsEl.classList.add('active');
        } catch (error) {
            console.error('Search error:', error);
            resultsEl.innerHTML = `
                <div class="search__result" style="color: var(--color-error);">
                    <span>Search failed. Please try again.</span>
                </div>
            `;
            resultsEl.classList.add('active');
        }
    }

    // Debounced search handler
    const debouncedSearch = debounce(performSearch, DEBOUNCE_DELAY);

    // Input event handler
    inputEl.addEventListener('input', (e) => {
        debouncedSearch(e.target.value.trim());
    });

    // Close results on click outside
    document.addEventListener('click', (e) => {
        if (inputEl && resultsEl && !inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
            resultsEl.classList.remove('active');
        }
    });

    // Close on escape
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            inputEl.blur();
            resultsEl.classList.remove('active');
        }
    });

    // Reopen on focus if there's a query
    inputEl.addEventListener('focus', () => {
        if (inputEl.value.trim().length >= 2) {
            resultsEl.classList.add('active');
        }
    });
}

/**
 * Escape HTML special characters
 * @param {string} str - Input string
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
