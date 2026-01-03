/**
 * Search Modal Functionality
 */

import { api } from './api.js';

// Search state
let searchTimeout = null;
const SEARCH_DEBOUNCE_MS = 300;

// Elements
const searchModal = document.getElementById('searchModal');
const searchBackdrop = document.getElementById('searchBackdrop');
const searchInput = document.getElementById('searchInput');
const closeSearch = document.getElementById('closeSearch');

const searchLoading = document.getElementById('searchLoading');
const searchGrid = document.getElementById('searchGrid');

// Search button in sidebar
const searchNavButton = document.querySelector('[data-view="search"]');

/**
 * Open search modal
 */
function openSearchModal() {
    searchModal.classList.add('active');
    setTimeout(() => searchInput.focus(), 100);
}

/**
 * Close search modal
 */
function closeSearchModal() {
    searchModal.classList.remove('active');
    searchInput.value = '';
    searchGrid.innerHTML = '';
    searchLoading.style.display = 'none';
}

/**
 * Perform search
 */
async function performSearch(query) {
    if (!query || query.trim().length < 2) {
        searchGrid.innerHTML = '';
        searchLoading.style.display = 'none';
        return;
    }

    // Show loading
    searchLoading.style.display = 'flex';

    try {
        // Search in the API
        const response = await api.searchRophim(query);

        searchLoading.style.display = 'none';

        if (response && response.movies && response.movies.length > 0) {
            // Display results
            searchGrid.innerHTML = response.movies.map(movie => {
                return `
                    <div class="video-card" data-id="${movie.slug}" onclick="window.location.href='/watch.html?id=${movie.slug}&slug=${movie.slug}'">
                        <div class="video-card__container">
                            <div class="video-card__thumbnail">
                                <img src="${movie.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.title}" loading="lazy">
                            </div>
                            <div class="video-card__overlay">
                                <div class="video-card__info">
                                    <h3 class="video-card__title">${movie.title}</h3>
                                    <div class="video-card__meta">
                                        <span>${movie.year || ''}</span>
                                        ${movie.quality ? `<span>${movie.quality}</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            // No results
            searchGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--apple-text-tertiary);">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48" style="opacity: 0.5; margin-bottom: 16px;">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                    <p>No results found for "${query}"</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Search failed:', error);
        searchLoading.style.display = 'none';
        searchGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--apple-error);">
                <p>Search failed. Please try again.</p>
            </div>
        `;
    }
}

/**
 * Setup search event listeners
 */
export function initSearch() {
    // Collect all possible search triggers
    const triggers = [
        document.getElementById('headerSearchBtn'),
        document.getElementById('mobileSearchBtn'),
        document.querySelector('[data-view="search"]'),
        document.querySelector('button[data-view="search"]') // Mobile bottom nav
    ];

    triggers.forEach(btn => {
        if (btn) {
            // Remove old listeners by cloning (simple way) or just add new one
            // Since we are shifting logic, just add listener
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop bubbling
                openSearchModal();
            });
        }
    });

    // Close button
    if (closeSearch) {
        closeSearch.addEventListener('click', closeSearchModal);
    }

    // Backdrop click
    if (searchBackdrop) {
        searchBackdrop.addEventListener('click', closeSearchModal);
    }

    // Search input with debouncing
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value;

            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, SEARCH_DEBOUNCE_MS);
        });

        // Enter key to search immediately
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                performSearch(e.target.value);
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K to open search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }

        // Escape to close
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
    });

    // Check for ?search= URL parameter and auto-perform search
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery && searchQuery.trim()) {
        // Open modal and perform search
        setTimeout(() => {
            openSearchModal();
            if (searchInput) {
                searchInput.value = searchQuery;
            }
            performSearch(searchQuery);

            // Clean up the URL without refreshing
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }, 300);
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}
