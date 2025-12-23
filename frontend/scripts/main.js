/**
 * KV-Netflix - Main Application Entry Point
 * Initializes the video streaming application
 */

import { api } from './api.js';
import { createVideoCard } from './components/VideoCard.js';
import { initPlayer, destroyPlayer } from './components/VideoPlayer.js';
import { initSearch } from './components/SearchBar.js';
import { showToast } from './components/Toast.js';

import { createInfoModal } from './components/InfoModal.js';
import { renderNewAndHotView } from './components/NewAndHot.js';
import { KeyboardNavigation } from './keyboard-nav.js';
// Drag scroll removed per user request
// Application state
const state = {
    videos: [],
    currentCategory: 'all',
    currentVideo: null,
    isLoading: false,
    featuredVideo: null,
    heroMovies: [],
    currentHeroIndex: 0,
    heroInterval: null,
    page: 1,
    hasMore: true
};

// DOM elements
const elements = {
    // Use videoGrid if exists, otherwise fall back to mainContent (Tailwind CSS design)
    videoGrid: document.getElementById('videoGrid') || document.getElementById('mainContent'),
    mainContent: document.getElementById('mainContent'),
    loading: document.getElementById('loading'),
    emptyState: document.getElementById('emptyState'),
    categories: document.getElementById('categories'),
    // Netflix-style navigation elements
    mainHeader: document.getElementById('mainHeader'),
    searchWrapper: document.getElementById('searchWrapper'),
    searchToggle: document.getElementById('searchToggle'),
    searchInput: document.getElementById('searchInput'),
    searchResults: document.getElementById('searchResults'),
    navLinks: document.querySelectorAll('.header__nav-link'),

    playerModal: document.getElementById('playerModal'),
    playerContainer: document.getElementById('playerContainer'),
    playerTitle: document.getElementById('playerTitle'),
    playerMeta: document.getElementById('playerMeta'),
    closePlayer: document.getElementById('closePlayer'),
    modalBackdrop: document.getElementById('modalBackdrop'),
    mobileNavItems: document.querySelectorAll('.mobile-nav__item, .sidebar__nav-item'),
    mobileBottomNavButtons: document.querySelectorAll('#mobileBottomNav .nav-item')
};

/**
 * Set the active state of mobile bottom navigation
 * @param {string} viewName - 'home', 'cinema', 'mylist', or 'search'
 */
function setMobileNavActive(viewName) {
    const navButtons = document.querySelectorAll('#mobileBottomNav .nav-item');
    navButtons.forEach(btn => {
        const isActive = btn.dataset.view === viewName;
        btn.classList.toggle('active', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('text-gray-400', !isActive);

        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.style.fontVariationSettings = isActive ? "'FILL' 1" : "'FILL' 0";
        }
    });
}

/**
 * Initialize the application
 */
async function init() {

    // Initialize search
    initSearch(elements.searchInput, elements.searchResults, handleVideoPlay);

    // Initialize Mobile Bottom Nav
    if (elements.mobileBottomNavButtons) {
        elements.mobileBottomNavButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.dataset.view;
                if (!view) return;

                // Update active state
                elements.mobileBottomNavButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Handle routing
                if (view === 'home') {
                    renderHome();
                } else if (view === 'search') {
                    // Mobile Search View
                    if (window.innerWidth < 768) {
                        try {
                            renderMobileSearch();
                        } catch (e) {
                            console.error('Search render failed', e);
                        }
                    } else {
                        elements.searchWrapper.classList.add('active');
                        elements.searchInput.focus();
                    }
                } else if (view === 'mylist') {
                    if (window.innerWidth < 768) {
                        renderMobileMyList();
                    } else {
                        renderHistoryView('mylist');
                    }
                } else if (view === 'downloads') {
                    showToast('Downloads feature coming soon!', 'info');
                } else if (view === 'profile') {
                    renderProfileView();
                } else if (view === 'cinema') {
                    setMobileNavActive('cinema');
                    renderCategoryView('cinema');
                } else {
                    renderCategoryView(view);
                }

                // Roll back to hero banner (scroll to top)
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // Set up event listeners
    setupEventListeners();

    // Load home view with organized sections
    await renderCategoryView('home');

    // Render hero with featured content
    await renderHero();

    // Handle view parameter from URL (e.g. for redirects from watch page)
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam && window.innerWidth < 768) {
        if (viewParam === 'search') renderMobileSearch();
        else if (viewParam === 'mylist') renderMobileMyList();
        else if (viewParam === 'cinema') renderCategoryView('cinema');
    }

    // Initialize TV-Style Keyboard Navigation
    const nav = new KeyboardNavigation();
    nav.init();

    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
        });
    }
}

/**
 * Render hero section with featured movie
 * @param {Object} video - Optional video object to render (defaults to state.featuredVideo)
 */
function renderHero(video = null) {
    const heroTitle = document.getElementById('heroTitle');
    const heroDescription = document.getElementById('heroDescription');
    const heroBg = document.getElementById('heroBg');
    const heroTag = document.getElementById('heroTag');
    const heroTagContainer = document.getElementById('heroTagContainer');
    const heroPlayBtn = document.getElementById('heroPlayBtn');
    const heroInfoBtn = document.getElementById('heroInfoBtn');
    const heroContent = document.getElementById('heroContent');

    // Get featured video (param, or state.featuredVideo, or first video)
    const featured = video || state.featuredVideo || state.videos[0];

    if (!featured) {
        return;
    }

    // Add fade out effect
    if (heroBg) heroBg.style.opacity = '0.5';
    if (heroContent) heroContent.style.opacity = '0';

    setTimeout(() => {
        // Update hero content
        if (heroTitle) heroTitle.textContent = featured.name || featured.title || 'Featured Movie';
        if (heroDescription) heroDescription.textContent = featured.description || featured.content || 'Watch now on StreamFlix';

        // Set background
        const backdrop = featured.backdrop || featured.poster_url || featured.thumb_url || featured.thumbnail || '';
        if (heroBg && backdrop) {
            heroBg.style.backgroundImage = `url('${backdrop}')`;
        }

        // Set category tag
        if (heroTag && heroTagContainer) {
            const genres = featured.genres || featured.category;

            // Unhide container
            heroTagContainer.classList.remove('hidden');

            if (genres && Array.isArray(genres) && genres.length > 0) {
                heroTag.textContent = genres[0];
            } else if (typeof genres === 'string') {
                heroTag.textContent = genres;
            } else {
                heroTag.textContent = '#1 in Movies Today';
            }
        }

        // Play button
        // Remove old listeners to prevent stacking
        if (heroPlayBtn) {
            const newPlayBtn = heroPlayBtn.cloneNode(true);
            heroPlayBtn.parentNode.replaceChild(newPlayBtn, heroPlayBtn);
            newPlayBtn.addEventListener('click', () => handleVideoPlay(featured));
        }

        // Info button
        if (heroInfoBtn) {
            const newInfoBtn = heroInfoBtn.cloneNode(true);
            heroInfoBtn.parentNode.replaceChild(newInfoBtn, heroInfoBtn);
            newInfoBtn.addEventListener('click', () => handleShowInfo(featured));
        }

        // Fade in
        if (heroBg) heroBg.style.opacity = '1';
        if (heroContent) heroContent.style.opacity = '1';
    }, 300);

    state.featuredVideo = featured;
}

/**
 * Start Hero Carousel
 */
function startHeroCarousel() {
    if (state.heroInterval) clearInterval(state.heroInterval);

    // Only start if we have multiple movies
    if (!state.heroMovies || state.heroMovies.length <= 1) return;

    state.heroInterval = setInterval(() => {
        state.currentHeroIndex++;
        if (state.currentHeroIndex >= state.heroMovies.length) {
            state.currentHeroIndex = 0;
        }
        renderHero(state.heroMovies[state.currentHeroIndex]);
    }, 8000); // 8 seconds
}

/**
 * Stop Hero Carousel
 */
function stopHeroCarousel() {
    if (state.heroInterval) {
        clearInterval(state.heroInterval);
        state.heroInterval = null;
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Header Scroll Effect - Master Instruction Logic
    const backToTopBtn = document.getElementById('backToTop');
    const handleScroll = () => {
        const scrollY = window.scrollY;

        // Header background change
        if (elements.mainHeader) {
            if (scrollY > 100) {
                elements.mainHeader.classList.add('scrolled');
                elements.mainHeader.style.backgroundColor = '#141414'; // Strict Netflix Black
            } else {
                elements.mainHeader.classList.remove('scrolled');
                elements.mainHeader.style.backgroundColor = 'transparent'; // Gradient handled by CSS
            }
        }

        // Back to top button visibility
        if (backToTopBtn) {
            if (scrollY > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();

    // Back to Top Button Click Handler
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Expandable Search Logic - REMOVED (Unifying with Modal)

    // Category Navigation
    elements.navLinks?.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;

            // Update active state
            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Load content for category
            state.currentCategory = category;
            loadVideos(category, true); // true = reset pagination
        });
    });

    // Mobile & Sidebar Navigation
    elements.mobileNavItems?.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;

            // Update active state
            elements.mobileNavItems.forEach(i => i.classList.remove('active'));
            // If it's a sidebar item, we might need to activate all matching items (desktop + mobile logic if split)
            // For now just activate clicked
            item.classList.add('active');

            // Sync other items with same view (e.g. if both mobile nav and sidebar exist)
            elements.mobileNavItems.forEach(i => {
                if (i.dataset.view === view) i.classList.add('active');
            });

            if (view === 'home') {
                elements.videoGrid.style.display = 'block';
                const newHot = document.getElementById('newHotContainer');
                if (newHot) newHot.style.display = 'none';
                state.currentCategory = 'all';
                loadVideos('all', true);
            } else if (['movies', 'series', 'animation', 'cinema'].includes(view)) {
                // Category Views
                elements.videoGrid.style.display = 'block';
                const newHot = document.getElementById('newHotContainer');
                if (newHot) newHot.style.display = 'none';

                state.currentCategory = view;
                loadVideos(view, true); // loadVideos handles the API call with category param
            } else if (view === 'history') {
                // History & My List View (SPA)
                elements.videoGrid.style.display = 'block';
                const newHot = document.getElementById('newHotContainer');
                if (newHot) newHot.style.display = 'none';
                renderHistoryView();
            } else if (view === 'search') {
                // Trigger search modal instead of legacy view
                const searchBtn = document.getElementById('headerSearchBtn');
                if (searchBtn) searchBtn.click();
            }

            // Roll back to hero banner (scroll to top)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Netflix Header Navigation (Desktop Top Nav)
    const netflixNavLinks = document.querySelectorAll('.netflix-header__nav-link');
    netflixNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;

            // Update active state on Netflix header
            netflixNavLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Sync sidebar/mobile items
            elements.mobileNavItems.forEach(i => {
                i.classList.remove('active');
                if (i.dataset.view === view) i.classList.add('active');
            });

            // Handle view switching
            elements.videoGrid.style.display = 'block';
            const newHot = document.getElementById('newHotContainer');
            if (newHot) newHot.style.display = 'none';

            if (view === 'home') {
                state.currentCategory = 'all';
                loadVideos('all', true);
            } else if (['movies', 'series', 'animation', 'cinema'].includes(view)) {
                state.currentCategory = view;
                loadVideos(view, true);
            } else if (view === 'history') {
                renderHistoryView();
            }

            // Roll back to hero banner (scroll to top)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Netflix Header Search Button
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    if (headerSearchBtn) {
        headerSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const searchModal = document.getElementById('searchModal');
            const searchInput = document.getElementById('searchInput');
            if (searchModal) {
                searchModal.classList.add('active');
                if (searchInput) setTimeout(() => searchInput.focus(), 100);
            }
        });
    }

    // Mobile Search Button
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const searchModal = document.getElementById('searchModal');
            const searchInput = document.getElementById('searchInput');
            if (searchModal) {
                searchModal.classList.add('active');
                if (searchInput) setTimeout(() => searchInput.focus(), 100);
            }
        });
    }

    // Close Search Modal
    const closeSearch = document.getElementById('closeSearch');
    if (closeSearch) {
        closeSearch.addEventListener('click', () => {
            const searchModal = document.getElementById('searchModal');
            if (searchModal) searchModal.classList.remove('active');
        });
    }

    // StreamFlix Nav Links (Tailwind design)
    const streamflixNavLinks = document.querySelectorAll('.nav-link');
    streamflixNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.dataset.view;

            // Update active state
            streamflixNavLinks.forEach(l => {
                l.classList.remove('active', 'text-white');
                l.classList.add('text-gray-300');
            });
            link.classList.add('active', 'text-white');
            link.classList.remove('text-gray-300');

            // Handle view switching with organized category sections
            if (view === 'home') {
                state.currentCategory = 'all';
                renderCategoryView('home');
            } else if (view === 'series') {
                state.currentCategory = 'series';
                renderCategoryView('series');
            } else if (view === 'movies') {
                state.currentCategory = 'movies';
                renderCategoryView('movies');
            } else if (view === 'cinema') {
                state.currentCategory = 'cinema';
                renderCategoryView('cinema');
            } else if (view === 'history') {
                renderHistoryView();
            }

            // Roll back to hero banner (scroll to top)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Modal close events
    elements.closePlayer?.addEventListener('click', closePlayerModal);
    elements.modalBackdrop?.addEventListener('click', closePlayerModal);


    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.playerModal?.classList.contains('active')) {
                closePlayerModal();
            }
            if (elements.searchWrapper?.classList.contains('active')) {
                elements.searchWrapper.classList.remove('active');
            }
            // Close search modal
            const searchModal = document.getElementById('searchModal');
            if (searchModal?.classList.contains('active')) {
                searchModal.classList.remove('active');
            }
        }
    });
}

/**
 * Load videos from API - tries RoPhim first, then database, then demo
 * @param {string} category - Optional category filter
 * @param {boolean} reset - Whether to reset pagination (e.g. category change)
 */
async function loadVideos(category = 'all', reset = false) {
    if (state.isLoading) return;
    if (reset) {
        state.page = 1;
        state.hasMore = true;
        state.videos = [];
        elements.videoGrid.innerHTML = '';
    }

    if (!state.hasMore) return;

    state.isLoading = true;
    showLoading(state.page === 1); // Only show full loader on first page

    // Helper function to add timeout to fetch
    const fetchWithTimeout = (promise, timeout = 12000) => {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), timeout)
            )
        ]);
    };

    // Top Search Button
    const topSearchBtn = document.getElementById('topSearchBtn');
    if (topSearchBtn) {
        topSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const searchModal = document.getElementById('searchModal');
            const searchInput = document.getElementById('searchInput');
            if (searchModal) {
                searchModal.classList.add('active');
                if (searchInput) setTimeout(() => searchInput.focus(), 100);
            }
        });
    }

    try {

        let apiResponse = null;
        let isSectionMode = false;

        // Section Mode disabled to force Responsive Grid Layout per user request


        // Fallback: Flat Catalog
        if (!apiResponse) {
            apiResponse = await fetchWithTimeout(
                api.getRophimCatalog({
                    category: category !== 'all' ? category : null,
                    page: state.page,
                    limit: 24
                }), 12000
            );
        }



        if (apiResponse && apiResponse.movies && apiResponse.movies.length > 0) {

            // Map API data to Video objects
            const newVideos = apiResponse.movies.map(m => ({
                id: m.id || `api_${Date.now()}_${Math.random()}`,
                title: m.title || 'Unknown Title',
                thumbnail: m.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image',
                backdrop: m.backdrop || m.thumbnail || 'https://via.placeholder.com/1920x1080?text=No+Backdrop',
                preview_url: m.preview_url || '',
                duration: m.duration || 0,
                resolution: m.quality || 'HD',
                category: m.category || 'movies',
                year: m.year || new Date().getFullYear(),
                description: m.description || '',
                matchScore: Math.floor(Math.random() * 15) + 85, // Random high match score
                source_url: m.source_url,
                slug: m.slug,
                // Rich Metadata
                cast: m.cast || [],
                director: m.director,
                country: m.country,
                episodes: m.episodes || []
            }));

            // Append new videos
            // Deduplicate based on ID or slug
            const existingIds = new Set(state.videos.map(v => v.id));
            const uniqueNewVideos = newVideos.filter(v => !existingIds.has(v.id));

            state.videos = [...state.videos, ...uniqueNewVideos];
            state.page += 1; // Increment page for next fetch

            // Detect if we reached end of content? (Usually API returns empty list, but here we got items)
            if (newVideos.length < 24) {
                // state.hasMore = false; // Optional optimization
            }


            // Force Responsive Grid Layout for ALL categories
            const isFirstBatch = state.page === 2; // Page bumped after fetch
            if (isFirstBatch) {
                renderVideoGrid(state.videos, false);
            } else {
                renderVideoGrid(uniqueNewVideos, true);
            }

            // Preload featured video for Hero only on first load


            // Setup/Update Infinite Scroll trigger
            setupInfiniteScrollTrigger();

            // Hide loading state on sentinel
            if (scrollSentinel) scrollSentinel.classList.remove('loading');

            state.isLoading = false;
            showLoading(false);
            return;
        } else {
            state.hasMore = false;
            // Hide sentinel when no more content
            if (scrollSentinel) {
                scrollSentinel.classList.remove('loading');
                scrollSentinel.style.display = 'none';
            }
            state.isLoading = false;
            showLoading(false);
        }

    } catch (error) {
        console.warn('API load failed:', error);
        // Only fallback to demo on first page load
        if (state.page === 1) {
            showToast('Using offline mode', 'info');
            const demoVideos = getDemoContent();
            state.videos = demoVideos;
            state.featuredVideo = demoVideos[0];
            renderVideoGrid(demoVideos);


        }
        state.isLoading = false;
        showLoading(false);
    }
}

/**
 * Render content as horizontal sliders - PhimMoi Style
 * @param {Array} videos - Videos to group
 */
/**
 * Render content as horizontal sliders - Apple TV+ Style
 * Enhanced with smart categorization and genre-based sections
 * @param {Array} videos - Videos to group
 */
/**
 * Render content as horizontal sliders - Apple TV+ Style
 * Enhanced with smart categorization and genre-based sections
 * @param {Array} videos - Videos to group
 */
function renderBackendSection(title, movies, isTop10, container = elements.videoGrid, usedIds = null) {
    if (!movies || movies.length === 0) return;

    // Deduplicate if set provided
    let uniqueMovies = movies;
    if (usedIds) {
        uniqueMovies = movies.filter(m => !usedIds.has(m.id || m.slug));
        if (uniqueMovies.length === 0) return;
        uniqueMovies.forEach(m => usedIds.add(m.id || m.slug));
    }

    // Normalize
    const normalizedVideo = uniqueMovies.map(m => ({
        id: m.id || m.slug,
        title: m.title,
        thumbnail: m.thumbnail,
        backdrop: m.backdrop || m.thumbnail,
        slug: m.slug,
        year: m.year,
        badge: m.badge,
        ranking: m.ranking
    }));

    const section = isTop10
        ? createTop10Section(title, normalizedVideo)
        : createSliderSection(title, normalizedVideo);

    container.appendChild(section);
}

async function renderSliders(videos) {
    elements.videoGrid.innerHTML = '';
    // Use Tailwind CSS layout classes
    elements.videoGrid.className = 'space-y-12';

    if (elements.emptyState) elements.emptyState.style.display = 'none';

    // 1. DISABLED: Curated sections API was overriding sectionConfigs.
    // Now using only sectionConfigs for full control over categories.
    /*
    try {
        const curatedResponse = await api.getCuratedSections();

        if (curatedResponse && curatedResponse.sections && curatedResponse.sections.length > 0) {

            curatedResponse.sections.forEach(section => {
                if (section.movies && section.movies.length > 0) {
                    // Normalize movies
                    const normalizedMovies = section.movies.map(m => ({
                        id: m.id || m.slug,
                        title: m.title,
                        thumbnail: m.thumbnail,
                        backdrop: m.poster_url || m.thumbnail,
                        slug: m.slug,
                        year: m.year,
                        quality: m.quality || 'HD',
                        resolution: m.quality || 'HD',
                        rating: m.rating,
                        tmdb_rating: m.tmdb_rating,
                        genres: m.genres,
                        category: m.category
                    }));

                    // Determine if this is a "Top Rated" section
                    const isTopRated = section.title.includes('Top Rated') || section.title.includes('🏆');

                    const sectionEl = isTopRated
                        ? createTop10Section(section.title, normalizedMovies)
                        : createSliderSection(section.title, normalizedMovies);
                    elements.videoGrid.appendChild(sectionEl);
                }
            });

            if (elements.videoGrid.children.length > 0) {
                return;
            }
        }
    } catch (e) {
        console.warn('Curated sections failed, trying backend categories...', e);
    }
    */

    // 2. DISABLED: Backend structured categories were also overriding sectionConfigs.
    // All rendering now happens in renderCategoryView() using sectionConfigs.
    /*
    try {
        let backendCategories = null;

        // Try categorySystem first, then direct API call
        if (window.categorySystem) {
            backendCategories = await window.categorySystem.loadCategories();
        }

        // Fallback: fetch directly from API
        if (!backendCategories) {
            const response = await fetch('/api/rophim/categories/all');
            const data = await response.json();
            backendCategories = data.categories;
        }

        if (backendCategories) {

            // Defined section order and titles
            const sectionConfig = [
                { key: 'hot', title: '🔥 Phim Hot (Movies)', isTop10: false },
                { key: 'top10', title: '🏆 Top 10 Phim Lẻ', isTop10: true },
                { key: 'series', title: '📺 Phim Bộ Mới (Series)', isTop10: false },
                { key: 'cinema', title: '🍿 Phim Chiếu Rạp', isTop10: false },
                { key: 'animated', title: '🎌 Hoạt Hình & Anime', isTop10: false },
                { key: 'vietnamese', title: '🇻🇳 Phim Việt Nam', isTop10: false },
                { key: 'tv_shows', title: '🎬 TV Shows', isTop10: false },
                { key: 'action', title: '💥 Action Movies', isTop10: false },
                { key: 'new_releases', title: '✨ Mới Cập Nhật', isTop10: false }
            ];

            // Track used videos to prevent duplicates across sections
            const globalUsedIds = new Set();

            // Render sections in order
            sectionConfig.forEach(config => {
                if (backendCategories[config.key] && backendCategories[config.key].length > 0) {
                    // Skip deduplication for Top 10 - it's a ranked section and should always show
                    const skipDedup = config.isTop10;
                    renderBackendSection(
                        config.title,
                        backendCategories[config.key],
                        config.isTop10,
                        elements.videoGrid,
                        skipDedup ? null : globalUsedIds
                    );
                }
            });

            // If we successfully rendered backend categories, return here
            if (elements.videoGrid.children.length > 0) {
                return;
            }
        }
    } catch (e) {
        console.warn('Failed to load backend categories, falling back to local logic', e);
    }
    */

    // --- FALLBACK / ORIGINAL LOGIC ---

    // Sort videos by year descending (newest first)
    videos.sort((a, b) => (b.year || 0) - (a.year || 0));

    // Track videos already added to sections to prevent duplicates
    const usedVideoIds = new Set();

    /**
     * Helper: Add videos to a section and track them
     */
    function addSection(title, videos, isTop10 = false) {
        if (!videos || videos.length === 0) return;

        // Filter out already-used videos
        const availableVideos = videos.filter(v => !usedVideoIds.has(v.id));
        if (availableVideos.length === 0) return;

        // Take up to 12 videos (or 10 for Top10)
        const limit = isTop10 ? 10 : 12;
        const sectionVideos = availableVideos.slice(0, limit);

        // Mark videos as used
        sectionVideos.forEach(v => usedVideoIds.add(v.id));

        // Create and append section
        const section = isTop10
            ? createTop10Section(title, sectionVideos)
            : createSliderSection(title, sectionVideos);
        elements.videoGrid.appendChild(section);

    }

    /**
     * Helper: Extract unique genres from videos
     */
    function extractGenres(videos) {
        const genreCounts = {};
        videos.forEach(v => {
            if (v.category && typeof v.category === 'string') {
                // Normalize category names
                const normalized = v.category.toLowerCase();
                const genreMap = {
                    'phim-le': 'Movies',
                    'phim-bo': 'Series',
                    'hoat-hinh': 'Animation',
                    'tv-shows': 'TV Shows'
                };
                const genre = genreMap[normalized] || v.category;
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            }
        });
        return genreCounts;
    }

    // ==========================================
    // PRIORITY SECTION 1: Featured/Top Content
    // ==========================================
    addSection('Top Charts: Movies', videos, true);

    // ==========================================
    // PRIORITY SECTION 2: Year-Based (Newest First)
    // ==========================================
    const currentYear = new Date().getFullYear();

    addSection('2024 New Releases',
        videos.filter(v => v.year === currentYear));

    addSection('2023 Hits',
        videos.filter(v => v.year === currentYear - 1));

    // ==========================================
    // PRIORITY SECTION 3: Quality-Based
    // ==========================================
    addSection('4K Ultra HD',
        videos.filter(v => v.resolution === '4K' || v.quality === '4K'));

    // ==========================================
    // PRIORITY SECTION 4: Category-Based
    // ==========================================
    addSection('Must-Watch Series',
        videos.filter(v => v.category === 'series' || v.category === 'phim-bo' || v.category === 'tv-shows'));

    addSection('Anime & Animation',
        videos.filter(v => v.category === 'anime' || v.category === 'hoat-hinh'));

    addSection('Action & Blockbusters',
        videos.filter(v => v.category === 'movies' || v.category === 'theater' || v.category === 'phim-le'));

    // ==========================================
    // PRIORITY SECTION 5: Country/Region-Based
    // ==========================================
    addSection('Korean Cinema',
        videos.filter(v => v.country && (v.country.includes('Korea') || v.country.includes('Hàn Quốc'))));

    addSection('Japanese Films',
        videos.filter(v => v.country && (v.country.includes('Japan') || v.country.includes('Nhật Bản'))));

    addSection('Hollywood Blockbusters',
        videos.filter(v => v.country && (v.country.includes('US') || v.country.includes('USA') || v.country.includes('Mỹ'))));

    addSection('European Collection',
        videos.filter(v => v.country && (
            v.country.includes('UK') || v.country.includes('France') ||
            v.country.includes('Germany') || v.country.includes('Spain') ||
            v.country.includes('Anh') || v.country.includes('Pháp') || v.country.includes('Đức')
        )));

    addSection('Asian Cinema',
        videos.filter(v => v.country && (
            v.country.includes('China') || v.country.includes('Thailand') ||
            v.country.includes('Hong Kong') || v.country.includes('Taiwan') ||
            v.country.includes('Trung Quốc') || v.country.includes('Thái Lan') || v.country.includes('Hồng Kông')
        )));

    // ==========================================
    // PRIORITY SECTION 6: Time-Period Based
    // ==========================================
    addSection('Recent Favorites (2020-2022)',
        videos.filter(v => v.year && v.year >= 2020 && v.year <= 2022));

    addSection('Modern Classics (2015-2019)',
        videos.filter(v => v.year && v.year >= 2015 && v.year < 2020));

    addSection('Timeless Classics',
        videos.filter(v => v.year && v.year < 2015));

    // ==========================================
    // PRIORITY SECTION 7: Dynamic Genre Sections
    // ==========================================
    // Get remaining unused videos
    const unusedVideos = videos.filter(v => !usedVideoIds.has(v.id));

    if (unusedVideos.length > 0) {
        const genreCounts = extractGenres(unusedVideos);

        // Sort genres by count and create sections for top genres
        const sortedGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        sortedGenres.forEach(([genre, count]) => {
            if (count >= 6) {
                addSection(`${genre} Collection`,
                    unusedVideos.filter(v => v.category === genre || v.category?.toLowerCase().includes(genre.toLowerCase())));
            }
        });
    }

    // ==========================================
    // FINAL FALLBACK: Hidden Gems (minimal)
    // ==========================================
    const stillUnused = videos.filter(v => !usedVideoIds.has(v.id));

    if (stillUnused.length >= 6) {
        addSection('Hidden Gems', stillUnused);
    }

    // Log categorization summary
}

/**
 * Create a Top 10 Section with numbered rankings - PhimMoi Style
 */
function createTop10Section(title, videos) {
    const section = document.createElement('section');
    section.className = 'slider-section top10-section';

    section.innerHTML = `
        <h2 class="section-title-apple">${title}</h2>
        <div class="slider-container">
            <button class="slider-btn slider-btn--left" aria-label="Previous">
                <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <div class="slider-track scrollbar-hide top10-track">
                <!-- Ranked cards will be injected here -->
            </div>
            <button class="slider-btn slider-btn--right" aria-label="Next">
                <svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
            </button>
        </div>
    `;

    const track = section.querySelector('.slider-track');
    videos.slice(0, 10).forEach((video, index) => {
        const card = createRankedCard(video, index + 1);
        track.appendChild(card);
    });

    // Mouse drag scrolling removed per user request

    // Slider Logic
    const btnLeft = section.querySelector('.slider-btn--left');
    const btnRight = section.querySelector('.slider-btn--right');

    btnRight.addEventListener('click', () => {
        track.scrollBy({ left: window.innerWidth * 0.6, behavior: 'smooth' });
    });

    btnLeft.addEventListener('click', () => {
        track.scrollBy({ left: -window.innerWidth * 0.6, behavior: 'smooth' });
    });

    return section;
}

/**
 * Create a ranked card with number - PhimMoi Top 10 style
 */
function createRankedCard(video, rank) {
    const card = document.createElement('div');
    card.className = 'ranked-card';
    card.innerHTML = `
        <span class="rank-number">${rank}</span>
        <div class="poster-card" data-id="${video.id}">
            <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
            <span class="poster-badge">${video.resolution || 'HD'}</span>
        </div>
        <div class="ranked-info">
            <div class="ranked-title">${video.title}</div>
            <div class="ranked-meta">${video.year || ''} • ${video.country || ''}</div>
        </div>
    `;

    return card;
}

/**
 * Create a Slider Section - Netflix-style Horizontal Scroll (Tailwind CSS)
 */
/**
 * Create a Horizontal Slider Section with scroll arrows
 */
function createSliderSection(title, videos, cardType = 'poster') {
    const section = document.createElement('section');
    section.className = 'flex flex-col gap-4 mb-12 relative';

    // Section Header
    const header = document.createElement('h2');
    header.className = 'text-xl md:text-2xl font-bold text-white hover:text-primary cursor-pointer transition-colors flex items-center gap-2 group px-4 md:px-12';
    header.innerHTML = `
        ${title}
        <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity text-primary">arrow_forward_ios</span>
    `;
    section.appendChild(header);

    // Slider wrapper (for positioning arrows)
    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'relative group/slider';

    // Left Arrow Button
    const leftBtn = document.createElement('button');
    leftBtn.className = 'absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity flex items-center justify-start pl-2';
    leftBtn.innerHTML = '<span class="material-symbols-outlined text-white text-3xl">chevron_left</span>';

    // Right Arrow Button
    const rightBtn = document.createElement('button');
    rightBtn.className = 'absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover/slider:opacity-100 transition-opacity flex items-center justify-end pr-2';
    rightBtn.innerHTML = '<span class="material-symbols-outlined text-white text-3xl">chevron_right</span>';

    // Horizontal Scroll Container - bigger cards
    const container = document.createElement('div');
    container.className = 'flex gap-3 overflow-x-auto scroll-smooth no-scrollbar px-4 md:px-12 pb-4';

    videos.forEach((video, index) => {
        let card;
        if (cardType === 'landscape') {
            card = createContinueWatchingCard(video);
        } else {
            // All cards use horizontal orientation with larger size
            card = createTailwindCard(video, false, 0, 'horizontal');
        }
        // Apply larger fixed width for cards in slider (bigger cards)
        card.className = card.className.replace('w-full', '');
        card.style.minWidth = '280px';
        card.style.maxWidth = '380px';
        card.style.flex = '0 0 auto';
        container.appendChild(card);
    });

    // Scroll functionality
    const scrollAmount = 600;
    leftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    rightBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    sliderWrapper.appendChild(leftBtn);
    sliderWrapper.appendChild(container);
    sliderWrapper.appendChild(rightBtn);
    section.appendChild(sliderWrapper);

    return section;
}

/**
 * Create a movie/poster card with Tailwind CSS (Netflix style)
 */
/**
 * Create a movie/poster card with Tailwind CSS (Netflix strict style)
 */
/**
 * Create a movie/poster card with Tailwind CSS (Netflix strict style)
 */
/**
 * Create a movie/poster card with Tailwind CSS (Netflix strict style)
 * @param {Object} video - Video object
 * @param {boolean} showRank - Show ranking number
 * @param {number} rank - Rank number
 * @param {string} orientation - 'vertical' or 'horizontal'
 */
function createTailwindCard(video, showRank = false, rank = 0, orientation = 'vertical') {
    const card = document.createElement('div');

    // Let grid control width; aspect ratio for sizing
    const aspectClass = orientation === 'horizontal' ? 'aspect-video' : 'aspect-[2/3]';

    // Use w-full to fill grid cell, no fixed width
    card.className = `w-full cursor-pointer snap-start group relative transition-all duration-300 ease-in-out hover:z-30 hover:scale-105`;

    // Prioritize backdrop for horizontal cards
    let image = video.poster_url || video.thumb_url || video.thumbnail || '';
    if (orientation === 'horizontal' && video.backdrop) {
        image = video.backdrop;
    }

    const title = video.name || video.title || 'Untitled';
    const year = video.year || '';
    const quality = video.quality || 'HD';
    const slug = video.slug || video.id || '';

    // Random match score for visual fidelity (90-99%)
    const matchScore = video.matchScore || Math.floor(Math.random() * (99 - 90 + 1) + 90);

    // Simulate Rotten Tomatoes (random 80-98%)
    const rtScore = Math.floor(Math.random() * (98 - 80 + 1) + 80);

    card.innerHTML = `
        <div class="relative ${aspectClass} rounded-md overflow-hidden bg-surface-dark shadow-lg transition-all duration-300 group-hover:shadow-2xl ring-0 group-hover:ring-2 group-hover:ring-white/20">
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('${image}');"></div>
            
            <!-- Gradient Overlay (Only visible on hover) -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- Badges Container -->
            <div class="absolute top-2 left-2 flex flex-col gap-1 z-20">
                 ${!showRank && year === new Date().getFullYear().toString() ? `<span class="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">NEW</span>` : ''}
                 ${video.quality ? `<span class="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase">${video.quality.replace('FHD', 'HD')}</span>` : ''}
                 ${video.current_episode ? `<span class="bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10">EP ${video.current_episode}</span>` : ''}
            </div>

            <!-- Number Badge -->
            ${showRank ? `<span class="absolute top-0 right-0 bg-primary text-white text-4xl font-black p-2 leading-none shadow-lg z-20">${rank}</span>` : ''}
            
            <!-- Hover Content -->
            <div class="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
                
                <!-- Action Buttons -->
                <div class="flex items-center justify-between mb-3 pointer-events-auto">
                    <div class="flex gap-2">
                        <button class="bg-white text-black h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-transform hover:scale-110 btn-play" title="Play">
                            <span class="material-symbols-outlined text-[20px] fill-current" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
                        </button>
                        <button class="bg-zinc-800/60 backdrop-blur-md border border-gray-400 text-white h-8 w-8 rounded-full flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-transform hover:scale-110 btn-add-list" data-slug="${slug}" title="Add to List">
                            <span class="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    </div>
                    <button class="bg-zinc-800/60 backdrop-blur-md border border-gray-400 text-white h-8 w-8 rounded-full flex items-center justify-center hover:border-white hover:bg-zinc-700 transition-transform hover:scale-110 btn-info" data-slug="${slug}" title="More Info">
                        <span class="material-symbols-outlined text-[18px]">info</span>
                    </button>
                </div>

                <!-- Metadata -->
                <div class="space-y-1">
                     <div class="flex items-center gap-2 text-[10px] font-semibold">
                        <span class="text-green-400">${matchScore}% Match</span>
                        <span class="border border-gray-400 px-1 rounded text-gray-200">${quality}</span>
                        <span class="text-gray-300">${year}</span>
                    </div>
                    
                    <!-- Ratings & Tags -->
                    <div class="flex items-center gap-3 text-[10px] font-bold">
                        <div class="flex items-center gap-1 text-yellow-500">
                             <span class="bg-[#FA320A] text-white px-1 rounded flex items-center gap-0.5 h-3.5">
                                <span class="material-symbols-outlined text-[10px]">local_pizza</span> ${rtScore}%
                            </span>
                        </div>
                         ${video.genres && video.genres.length > 0 ? `<span class="text-white/70 font-normal truncate max-w-[100px]">${video.genres[0]}</span>` : ''}
                    </div>

                    <h3 class="text-sm font-bold text-white leading-tight line-clamp-2 drop-shadow-md mt-1">
                        ${title}
                    </h3>
                </div>
            </div>
        </div>
    `;

    // Click handler for play (background click)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            handleVideoPlay(video);
        }
    });

    // Button Handlers
    const playBtn = card.querySelector('.btn-play');
    if (playBtn) playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleVideoPlay(video);
    });

    const addBtn = card.querySelector('.btn-add-list');
    if (addBtn) addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.historyService) {
            const added = window.historyService.toggleFavorite(video);
            // Visual toggle
            const icon = addBtn.querySelector('span');
            if (added) {
                icon.textContent = 'check';
                showToast('Added to My List', 'success');
            } else {
                icon.textContent = 'add';
                showToast('Removed from My List', 'info');
            }
        }
    });

    const infoBtn = card.querySelector('.btn-info');
    if (infoBtn) infoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Updated to use the new navigation logical as per previous request
        handleShowInfo(video);
    });

    return card;
}

/**
 * Create a Continue Watching card (landscape with progress bar)
 */
/**
 * Create a Continue Watching card (strict fit per preset)
 */
function createContinueWatchingCard(video) {
    const card = document.createElement('div');
    card.className = 'flex-none w-[280px] group/card cursor-pointer snap-start';

    const poster = video.backdrop || video.thumb_url || video.thumbnail || '';
    const title = video.name || video.title || 'Untitled';
    const progress = video.progress?.percentage || 0;
    const episode = video.progress?.episode ? `S${video.season || 1}:E${video.progress.episode}` : '';

    card.innerHTML = `
        <div class="relative aspect-video rounded-md overflow-hidden bg-surface-dark card-hover">
            <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${poster}');"></div>
            <div class="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/card:opacity-100">
                <span class="material-symbols-outlined text-5xl bg-black/50 rounded-full p-2 border-2 border-white">play_arrow</span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div class="h-full bg-primary" style="width: ${progress}%;"></div>
            </div>
        </div>
        <div class="mt-2 flex justify-between items-center px-1">
            <span class="text-sm font-semibold text-gray-200">${title}</span>
            ${episode ? `<span class="text-xs text-gray-400">${episode}</span>` : ''}
        </div>
    `;

    card.addEventListener('click', () => handleVideoPlay(video));
    return card;
}




/**
 * Render video grid (standard grid for search/categories)
 * @param {Array} videos - Array of video objects
 * @param {boolean} append - Whether to append to existing grid
 */
function renderVideoGrid(videos, append = false) {
    // If not appending, clear the grid
    if (!append) {
        elements.videoGrid.innerHTML = '';
        elements.videoGrid.innerHTML = '';
        elements.videoGrid.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-10';
    }

    if (videos.length === 0 && !append) {
        if (elements.emptyState) elements.emptyState.style.display = 'flex';
        return;
    }

    if (elements.emptyState) elements.emptyState.style.display = 'none';

    videos.forEach(video => {
        const card = createVideoCard(video, handleVideoPlay, handleShowInfo);
        elements.videoGrid.appendChild(card);
    });
}

function renderInfiniteGrid(videos) {

    if (!videos || videos.length === 0) {
        console.warn('No videos to render in infinite grid');
        return;
    }

    let infiniteContainer = document.getElementById('infinite-scroll-container');
    if (!infiniteContainer) {
        infiniteContainer = document.createElement('div');
        infiniteContainer.id = 'infinite-scroll-container';
        // Reduce top margin as the "Khám Phá Thêm" header from renderSliders already provides spacing
        infiniteContainer.style.marginTop = '1vw';
        elements.videoGrid.appendChild(infiniteContainer);

        // Removed redundant 'More to Explore' header here as it duplicates the one from renderSliders
    }

    // Group videos by year
    const currentYear = new Date().getFullYear();
    const moviesByYear = {};

    videos.forEach(video => {
        const year = video.year || currentYear;
        if (!moviesByYear[year]) {
            moviesByYear[year] = [];
        }
        moviesByYear[year].push(video);
    });

    // Sort years descending (newest first)
    const years = Object.keys(moviesByYear).sort((a, b) => b - a);

    // Create slider sections for each year
    let cardsAdded = 0;
    years.forEach(year => {
        const movies = moviesByYear[year];
        if (movies.length > 0) {
            const yearLabel = year == currentYear ? `${year} New Releases` :
                year == currentYear - 1 ? `${year} Hits` :
                    `${year} Movies`;
            const section = createSliderSection(yearLabel, movies);
            infiniteContainer.appendChild(section);
            cardsAdded += movies.length;
        }
    });

}

let scrollObserver;
let scrollSentinel = null;
let lastScrollTrigger = 0; // Debounce timer

function setupInfiniteScrollTrigger() {
    // If no more content, hide sentinel and don't set up observer
    if (!state.hasMore) {
        if (scrollSentinel) {
            scrollSentinel.classList.remove('loading');
            scrollSentinel.style.display = 'none';
        }
        if (scrollObserver) scrollObserver.disconnect();
        return;
    }

    if (scrollObserver) scrollObserver.disconnect();

    // Remove any existing sentinels first to prevent duplicates
    document.querySelectorAll('.scroll-sentinel').forEach(el => el.remove());
    scrollSentinel = null;

    const options = {
        root: null,
        rootMargin: '50px', // Reduced from 200px to prevent early triggering
        threshold: 0.0 // Trigger when any part is visible
    };

    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Debounce: require at least 1.5 seconds between triggers
            const now = Date.now();
            if (now - lastScrollTrigger < 1500) {
                return;
            }
            if (entry.isIntersecting && !state.isLoading && state.hasMore) {
                lastScrollTrigger = now;
                // Show loading state on sentinel
                if (scrollSentinel) scrollSentinel.classList.add('loading');
                loadVideos(state.currentCategory);
            }
        });
    }, options);

    // Create single sentinel element
    scrollSentinel = document.createElement('div');
    scrollSentinel.className = 'scroll-sentinel';
    scrollSentinel.id = 'scrollSentinel';

    // Place sentinel at the proper location - after infinite container or at end of videoGrid
    const infiniteContainer = document.getElementById('infinite-scroll-container');
    if (infiniteContainer) {
        // Insert after the infinite container for proper positioning
        infiniteContainer.parentNode.insertBefore(scrollSentinel, infiniteContainer.nextSibling);
    } else {
        elements.videoGrid.appendChild(scrollSentinel);
    }

    scrollObserver.observe(scrollSentinel);
}

function handleShowInfo(video) {
    navigateToWatch(video);
}

/**
 * Render History View - Shows user's watch history and saved content
 * @param {string} tab - 'history' or 'mylist'
 */
function renderHistoryView(tab = 'history') {
    if (elements.mainHeader) elements.mainHeader.style.display = '';
    if (!window.historyService) {
        console.error('HistoryService not initialized');
        return;
    }

    // Clear the grid
    elements.videoGrid.innerHTML = '';
    if (elements.emptyState) elements.emptyState.style.display = 'none';

    // Remove any existing history tabs
    const existingTabs = document.querySelector('.view-tabs');
    if (existingTabs) existingTabs.remove();

    // Create tabs for switching between History and My List
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'view-tabs';
    tabsContainer.innerHTML = `
        <button class="view-tab ${tab === 'history' ? 'active' : ''}" data-tab="history">Watch History</button>
        <button class="view-tab ${tab === 'mylist' ? 'active' : ''}" data-tab="mylist">My List</button>
    `;
    elements.videoGrid.before(tabsContainer);

    // Tab click listeners
    tabsContainer.querySelectorAll('.view-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            tabsContainer.remove();
            renderHistoryView(btn.dataset.tab);
        });
    });

    let items = [];
    if (tab === 'history') {
        items = window.historyService.getHistory();
    } else {
        items = window.historyService.getFavorites();
    }

    if (items.length === 0) {
        if (elements.emptyState) {
            elements.emptyState.style.display = 'flex';
            const emptyTitle = elements.emptyState.querySelector('h2');
            const emptyDesc = elements.emptyState.querySelector('p');

            if (tab === 'history') {
                if (emptyTitle) emptyTitle.textContent = 'No history yet';
                if (emptyDesc) emptyDesc.textContent = 'Movies you watch will appear here.';
            } else {
                if (emptyTitle) emptyTitle.textContent = 'My List is empty';
                if (emptyDesc) emptyDesc.textContent = 'Add movies to your list to watch later.';
            }
        }
        return;
    }

    // 1. Sort by Latest (Year/Date)
    items.sort((a, b) => {
        const dateA = a.timestamp || a.year || 0;
        const dateB = b.timestamp || b.year || 0;
        return dateB - dateA;
    });

    // Normalize items with horizontal orientation for slider
    const normalizedItems = items.map((item, index) => {
        return {
            ...item,
            id: item.id || item.slug,
            orientation: 'horizontal'
        };
    });

    // Ensure header is shown
    if (elements.mainHeader) elements.mainHeader.style.display = 'block';

    // Use horizontal slider layout (same as home page)
    const title = tab === 'history' ? 'Continue Watching' : 'My List';
    const sliderSection = createSliderSection(title, normalizedItems, 'poster');
    elements.videoGrid.appendChild(sliderSection);
}

/**
 * Render Library View - Legacy fallback for history/favorites
 */
function renderLibraryView() {
    renderHistoryView('mylist');
}

/**
 * Render Movies View - Shows movies in horizontal sliders organized by year
 */
async function renderMoviesView() {
    // Show loading state
    showLoading(true);

    // Clear the grid
    elements.videoGrid.innerHTML = '';
    if (elements.emptyState) elements.emptyState.style.display = 'none';

    try {
        // Load movies if not already loaded
        if (state.videos.length === 0 || state.currentCategory !== 'movies') {
            state.currentCategory = 'movies';
            state.page = 1;
            state.hasMore = true;

            const apiResponse = await api.getRophimCatalog({
                category: 'phim-le', // movies category
                page: 1,
                limit: 48 // Load more movies for better categorization
            });

            if (apiResponse && apiResponse.movies && apiResponse.movies.length > 0) {
                state.videos = apiResponse.movies.map(m => ({
                    id: m.id || `api_${Date.now()}_${Math.random()}`,
                    title: m.title || 'Unknown Title',
                    thumbnail: m.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image',
                    backdrop: m.backdrop || m.thumbnail || 'https://via.placeholder.com/1920x1080?text=No+Backdrop',
                    preview_url: m.preview_url || '',
                    duration: m.duration || 0,
                    resolution: m.quality || 'HD',
                    category: m.category || 'movies',
                    year: m.year || new Date().getFullYear(),
                    description: m.description || '',
                    matchScore: Math.floor(Math.random() * 15) + 85,
                    source_url: m.source_url,
                    slug: m.slug,
                    cast: m.cast || [],
                    director: m.director,
                    country: m.country,
                    episodes: m.episodes || []
                }));
            }
        }

        // Group movies by year
        const moviesByYear = {};
        const currentYear = new Date().getFullYear();

        state.videos.forEach(video => {
            const year = video.year || currentYear;
            if (!moviesByYear[year]) {
                moviesByYear[year] = [];
            }
            moviesByYear[year].push(video);
        });

        // Sort years descending (newest first)
        const years = Object.keys(moviesByYear).sort((a, b) => b - a);

        // Create slider sections for each year
        years.forEach(year => {
            const movies = moviesByYear[year];
            if (movies.length > 0) {
                const yearLabel = year == currentYear ? `${year} New Releases` :
                    year == currentYear - 1 ? `${year} Hits` :
                        `${year} Movies`;
                const section = createSliderSection(yearLabel, movies);
                elements.videoGrid.appendChild(section);
            }
        });

        showLoading(false);

    } catch (error) {
        console.error('Error loading movies:', error);
        showLoading(false);
        if (elements.emptyState) elements.emptyState.style.display = 'flex';
    }
}


/**
 * Render demo content when API is not available
 */
function renderDemoContent() {
    // Using CORS-friendly sample videos that work in browsers
    const SAMPLE_VIDEO = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // Big Buck Bunny HLS
    const SAMPLE_MP4 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    const demoVideos = [
        {
            id: 1,
            title: 'Venom: The Last Dance',
            thumbnail: 'https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg',
            backdrop: 'https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg',
            duration: 7200,
            resolution: '4K',
            category: 'movies',
            year: 2024,
            description: 'Eddie và Venom đang chạy trốn. Bị cả hai thế giới truy đuổi, họ buộc phải đưa ra quyết định khốc liệt...',
        }
    ];

    // Fuzzy match title
    const isBanner = bannerCategories.some(cat => title.includes(cat));

    // Attempt to find a video with a real backdrop first (landscape)
    // to avoid stretching portrait thumbnails
    const bannerVideo = videos.find(v => v.backdrop && v.backdrop !== v.thumbnail) || videos[0] || {};
    const backdrop = bannerVideo.backdrop || bannerVideo.thumbnail || '';

    // If we are using a thumbnail (likely portrait), apply blur
    const isPortrait = backdrop === bannerVideo.thumbnail;
    const bgStyle = isPortrait ? `background-image: url('${backdrop}'); filter: blur(20px) brightness(0.7); transform: scale(1.2);` : `background-image: url('${backdrop}');`;

    if (isBanner && backdrop) {
        // Create Banner Header with separate BG for zoom effects
        const bannerHeader = document.createElement('div');
        bannerHeader.className = 'section-banner group';

        bannerHeader.innerHTML = `
            <div class="section-banner__bg" style="${bgStyle}"></div>
            <div class="section-banner__overlay"></div>
            <div class="section-banner__content">
                <h2 class="section-banner__title">${title}</h2>
                <span class="section-banner__subtitle">Explore Collection <span style="font-size: 1.2em">›</span></span>
            </div>
        `;
        section.appendChild(bannerHeader);
    } else {
        // Standard Header
        const header = document.createElement('h2');
        header.className = 'section-title-apple';
        header.textContent = title;
        section.appendChild(header);
    }

    // Split videos into chunks (Rows)
    const rowSize = 21;

    const createRow = (rowVideos) => {
        const container = document.createElement('div');
        container.className = 'slider-container';
        // Add vertical spacing between rows
        container.style.marginBottom = '1.5rem';

        container.innerHTML = `
            <button class="slider-btn slider-btn--left" aria-label="Previous">
                <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <div class="slider-track scrollbar-hide">
                <!-- Cards injected here -->
            </div>
            <button class="slider-btn slider-btn--right" aria-label="Next">
                <svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
            </button>
        `;

        const track = container.querySelector('.slider-track');
        rowVideos.forEach(video => {
            const card = createVideoCard(video, handleVideoPlay, handleShowInfo);
            track.appendChild(card);
        });

        // Slider Logic
        const btnLeft = container.querySelector('.slider-btn--left');
        const btnRight = container.querySelector('.slider-btn--right');

        btnRight.addEventListener('click', () => {
            track.scrollBy({ left: window.innerWidth * 0.7, behavior: 'smooth' });
        });

        btnLeft.addEventListener('click', () => {
            track.scrollBy({ left: -window.innerWidth * 0.7, behavior: 'smooth' });
        });

        return container;
    };

    // Create rows
    for (let i = 0; i < videos.length; i += rowSize) {
        const chunk = videos.slice(i, i + rowSize);
        // Avoid creating a tiny final row if it has very few items compared to rowSize,
        // unless it's the only row.
        if (i > 0 && chunk.length < 5) break;

        section.appendChild(createRow(chunk));
    }

    return section;
    function setupInfiniteScrollTrigger() {
        // If no more content, hide sentinel and don't set up observer
        if (!state.hasMore) {
            if (scrollSentinel) {
                scrollSentinel.classList.remove('loading');
                scrollSentinel.style.display = 'none';
            }
            if (scrollObserver) scrollObserver.disconnect();
            return;
        }

        if (scrollObserver) scrollObserver.disconnect();

        // Remove any existing sentinels first to prevent duplicates
        document.querySelectorAll('.scroll-sentinel').forEach(el => el.remove());
        scrollSentinel = null;

        const options = {
            root: null,
            rootMargin: '50px', // Reduced from 200px to prevent early triggering
            threshold: 0.0 // Trigger when any part is visible
        };

        scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Debounce: require at least 1.5 seconds between triggers
                const now = Date.now();
                if (now - lastScrollTrigger < 1500) {
                    return;
                }
                if (entry.isIntersecting && !state.isLoading && state.hasMore) {
                    lastScrollTrigger = now;
                    // Show loading state on sentinel
                    if (scrollSentinel) scrollSentinel.classList.add('loading');
                    loadVideos(state.currentCategory);
                }
            });
        }, options);

        // Create single sentinel element
        scrollSentinel = document.createElement('div');
        scrollSentinel.className = 'scroll-sentinel';
        scrollSentinel.id = 'scrollSentinel';

        // Place sentinel at the proper location - after infinite container or at end of videoGrid
        const infiniteContainer = document.getElementById('infinite-scroll-container');
        if (infiniteContainer) {
            // Insert after the infinite container for proper positioning
            infiniteContainer.parentNode.insertBefore(scrollSentinel, infiniteContainer.nextSibling);
        } else {
            elements.videoGrid.appendChild(scrollSentinel);
        }

        scrollObserver.observe(scrollSentinel);
    }

    function handleShowInfo(video) {

        // Smart Recommendations: Filter by category/genre
        let recommendations = state.videos.filter(v =>
            v.id !== video.id &&
            (v.category === video.category || v.resolution === video.resolution)
        );

        // Fallback if not enough matches
        if (recommendations.length < 6) {
            const remaining = state.videos.filter(v => v.id !== video.id && !recommendations.includes(v));
            recommendations = [...recommendations, ...remaining];
        }

        // Shuffle and slice
        recommendations = recommendations.sort(() => Math.random() - 0.5).slice(0, 6);

        const modal = createInfoModal(video, (modalEl) => {
            modalEl.classList.remove('active');
            setTimeout(() => modalEl.remove(), 400);
        }, handleVideoPlay, recommendations);

    }
}

/**
 * Render hero section with featured content
 */


/**
 * Handle video play action - Navigate to dedicated watch page
 * @param {Object} video - Video object
 */
function handleVideoPlay(video) {
    // Store video data in sessionStorage for the watch page
    sessionStorage.setItem('currentVideo', JSON.stringify(video));

    // Store all videos for recommendations
    sessionStorage.setItem('allVideos', JSON.stringify(state.videos));

    // Navigation to Watch => NOW INFO PAGE
    navigateToWatch(video);
}

function navigateToWatch(video) {
    window.location.href = `/watch.html?slug=${video.slug}`;
}


/**
 * Load specific episode with server
 */
async function loadEpisode(video, episode, server) {
    try {
        let streamUrl = null;
        let poster = video.thumbnail;

        // Check if this is a PhimMoiChill movie
        const isPhimMoiChill = video.source_url && (
            video.source_url.includes('royalcanalbikehire') ||
            video.source_url.includes('phimmoichill') ||
            video.source_url.includes('/phim/') ||
            video.slug
        );

        if (isPhimMoiChill) {
            showToast('Loading stream...', 'info');
            try {
                const streamData = await api.getRophimStreamByUrl(video.source_url, video.slug, episode, server);
                if (streamData && streamData.stream_url) {
                    streamUrl = streamData.stream_url;
                }
            } catch (phimmoiError) {
                console.warn('PhimMoiChill stream extraction failed:', phimmoiError.message);
            }
        }

        // Fallback: try yt-dlp extraction
        if (!streamUrl && video.source_url) {
            try {
                const extraction = await api.extractVideo(video.source_url);
                if (extraction && extraction.stream_url) {
                    streamUrl = extraction.stream_url;
                    poster = extraction.thumbnail || poster;
                }
            } catch (extractError) {
                console.warn('Extraction failed:', extractError.message);
            }
        }

        // Final fallback: use source_url directly
        if (!streamUrl && video.source_url) {
            if (video.source_url.match(/\.(mp4|m3u8|webm)(\?|$)/i)) {
                streamUrl = video.source_url;
            }
        }

        if (streamUrl) {
            const isEmbedUrl = streamUrl.includes('goatembed') ||
                streamUrl.includes('/embed/') ||
                streamUrl.includes('player.') ||
                (streamUrl.includes('embed') && !streamUrl.match(/\.(mp4|m3u8|webm)/i));

            if (isEmbedUrl) {
                elements.playerContainer.innerHTML = `
                    <div class="embed-player-wrapper" style="width: 100%; height: 100%; position: relative; background: #000;">
                        <iframe 
                            src="${streamUrl}"
                            style="width: 100%; height: 100%; border: none;"
                            allowfullscreen
                            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                        ></iframe>
                    </div>
                `;
            } else {
                const art = initPlayer(elements.playerContainer, {
                    url: streamUrl,
                    poster: poster,
                    title: video.title,
                    autoplay: true
                });

                if (art && window.historyService) {
                    art.on('video:timeupdate', () => {
                        const currentTime = art.currentTime;
                        const duration = art.duration;
                        if (currentTime > 0 && duration > 0 && Math.floor(currentTime) % 5 === 0) {
                            window.historyService.addToHistory(video, {
                                currentTime,
                                duration,
                                percentage: (currentTime / duration) * 100,
                                episode: 1 // Default to 1 for modal player
                            });
                        }
                    });
                }
            }
            showToast('Playing...', 'success');
        } else {
            throw new Error('Không tìm thấy nguồn phát phim');
        }

    } catch (error) {
        console.error('Video playback failed:', error);
        showToast(`Lỗi: ${error.message}`, 'error');
        elements.playerContainer.innerHTML = `
            <div class="player-skeleton" style="flex-direction: column; gap: 16px;">
                <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48" style="color: var(--color-error)">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>Cannot load video</p>
                <p style="font-size: 12px; color: var(--color-text-tertiary)">${video.title}</p>
                <button class="btn btn--ghost" onclick="location.reload()">Thử lại</button>
            </div>
        `;
    }
}


/**
 * Close player modal
 */
function closePlayerModal() {
    elements.playerModal.classList.remove('active');
    destroyPlayer();
    elements.playerContainer.innerHTML = '';
    state.currentVideo = null;
}

/**
 * Close add video modal
 */
function closeAddModal() {
    elements.addVideoModal.classList.remove('active');
    elements.addVideoForm.reset();
}

/**
 * Handle add video form submission
 * @param {Event} e - Form submit event
 */
async function handleAddVideo(e) {
    e.preventDefault();

    const url = document.getElementById('videoUrl').value;
    const title = document.getElementById('videoTitle').value;
    const category = document.getElementById('videoCategory').value;

    try {
        showToast('Extracting video info...', 'info');

        // First extract to get metadata
        const extraction = await api.extractVideo(url);

        // Add to library
        await api.addVideo({
            title: title || extraction.title,
            source_url: url,
            thumbnail: extraction.thumbnail,
            category: category || null
        });

        showToast('Video added successfully!', 'success');
        closeAddModal();

        // Reload videos
        await loadVideos(state.currentCategory);

    } catch (error) {
        console.error('Failed to add video:', error);
        showToast(`Failed to add video: ${error.message}`, 'error');
    }
}

/**
 * Set active category tab
 * @param {string} category - Category to activate
 */
function setActiveCategory(category) {
    state.currentCategory = category;

    elements.categories.querySelectorAll('.category').forEach(btn => {
        btn.classList.toggle('category--active', btn.dataset.category === category);
    });
}

/**
 * Show/hide loading indicator
 * @param {boolean} show - Whether to show loading
 */
function showLoading(show) {
    if (elements.loading) {
        elements.loading.style.display = show ? 'flex' : 'none';
    }
    // Support both old videoGrid and new mainContent layouts
    if (elements.videoGrid) {
        elements.videoGrid.style.display = show ? 'none' : 'block';
    }
}

/**
 * Render organized category view based on view type
 * Netflix-style: Multiple horizontal slider sections per view
 * @param {string} viewType - 'home', 'series', 'movies', or 'cinema'
 */
async function renderCategoryView(viewType) {
    // Cleanup History Tabs if they exist
    const historyTabs = document.querySelector('.view-tabs');
    if (historyTabs) historyTabs.remove();

    if (elements.mainHeader) elements.mainHeader.style.display = '';
    showLoading(true);
    elements.videoGrid.innerHTML = '';
    elements.videoGrid.className = 'space-y-12';

    // Section configurations per view type (2 rows per category)
    const sectionConfigs = {
        home: [
            { title: 'Continue Watching', type: 'history', limit: 12, cardType: 'landscape' },
            { title: 'Cinema Releases', category: 'phim-chieu-rap', limit: 12, isHeroSource: true },
            { title: 'Top Rated', category: 'phim-le', sort: 'rating', limit: 12 },
            { title: 'Action & Adventure', category: 'hanh-dong', limit: 12 },
            { title: 'Animation', category: 'hoat-hinh', limit: 12 },
            { title: 'Korean Hits', category: 'han-quoc', limit: 12 },
            { title: 'Horror & Thriller', category: 'kinh-di', limit: 12 },
            { title: 'Romance', category: 'tinh-cam', limit: 12 },
        ],
        series: [
            { title: 'Popular TV Shows', category: 'phim-bo', limit: 12, isHeroSource: true },
            { title: 'Korean Dramas', category: 'korean', limit: 12 },
            { title: 'Chinese Dramas', category: 'china', limit: 12 },
            { title: 'Anime Series', category: 'hoat-hinh', limit: 12 },
            { title: 'Documentaries', category: 'tai-lieu', limit: 12 },
        ],
        movies: [
            { title: 'Blockbuster Movies', category: 'phim-le', sort: 'year', limit: 12, isHeroSource: true },
            { title: 'Action & Adventure', category: 'action', limit: 12 },
            { title: 'Comedy Films', category: 'comedy', limit: 12 },
            { title: 'Cinema Releases', category: 'phim-chieu-rap', limit: 12 },
            { title: 'Horror Movies', category: 'kinh-di', limit: 12 },
            { title: 'Sci-Fi & Fantasy', category: 'vien-tuong', limit: 12 },
        ],
        cinema: [
            { title: 'Now Showing', category: 'phim-chieu-rap', limit: 12, isHeroSource: true },
            { title: 'New Releases', category: 'phim-le', sort: 'year', limit: 12 },
            { title: 'Top Rated', category: 'phim-le', sort: 'rating', limit: 12 },
            { title: 'Action Blockbusters', category: 'action', limit: 12 },
            { title: 'Animated Features', category: 'hoat-hinh', limit: 12 },
        ]
    };

    const sections = sectionConfigs[viewType] || sectionConfigs.home;

    // Check sessionStorage for cached view (Home/Cinema only to keep it fresh)
    if (viewType === 'home' || viewType === 'cinema') {
        const cachedHTML = sessionStorage.getItem(`view_cache_${viewType}`);
        if (cachedHTML) {
            elements.videoGrid.innerHTML = cachedHTML;
            showLoading(false);
            if (elements.heroContainer) elements.heroContainer.style.display = '';
            if (elements.videoGrid.children.length > 0) return;
        }
    }

    // Lazy loading configuration
    const EAGER_LOAD_COUNT = 3; // Load first 3 sections immediately

    try {
        let firstAvailableMovies = null;

        // Render eager sections immediately
        for (let i = 0; i < Math.min(EAGER_LOAD_COUNT, sections.length); i++) {
            const sectionConfig = sections[i];
            const movies = await fetchSectionMovies(sectionConfig);
            if (movies && movies.length > 0) {
                if (!firstAvailableMovies) {
                    firstAvailableMovies = movies;
                }

                // Set featured video for hero banner from first valid section
                if (sectionConfig.isHeroSource && (!state.heroMovies || state.heroMovies.length === 0) && movies.length > 0) {
                    state.heroMovies = movies.slice(0, 10);
                    state.featuredVideo = movies[0];
                    state.videos = movies;
                    state.currentHeroIndex = 0;
                    renderHero(state.heroMovies[0]);
                    startHeroCarousel();
                }

                const sliderSection = createSliderSection(sectionConfig.title, movies, sectionConfig.cardType || 'poster');
                elements.videoGrid.appendChild(sliderSection);
            }
        }

        // Cache the eager sections
        if (viewType === 'home' || viewType === 'cinema') {
            sessionStorage.setItem(`view_cache_${viewType}`, elements.videoGrid.innerHTML);
        }

        // Create lazy-load placeholders for remaining sections
        const lazyObserver = new IntersectionObserver(async (entries, observer) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const placeholder = entry.target;
                    const configIndex = parseInt(placeholder.dataset.configIndex);
                    const sectionConfig = sections[configIndex];

                    observer.unobserve(placeholder);

                    // Show loading indicator
                    placeholder.innerHTML = '<div class="flex justify-center py-8"><div class="loading-spinner"></div></div>';

                    const movies = await fetchSectionMovies(sectionConfig);
                    if (movies && movies.length > 0) {
                        const sliderSection = createSliderSection(sectionConfig.title, movies, sectionConfig.cardType || 'poster');
                        placeholder.replaceWith(sliderSection);

                        // Update cache as we load more
                        if (viewType === 'home' || viewType === 'cinema') {
                            sessionStorage.setItem(`view_cache_${viewType}`, elements.videoGrid.innerHTML);
                        }
                    } else {
                        placeholder.remove();
                    }
                }
            }
        }, { rootMargin: '800px' });

        // Add placeholders for lazy sections
        for (let i = EAGER_LOAD_COUNT; i < sections.length; i++) {
            const placeholder = document.createElement('div');
            placeholder.className = 'lazy-section-placeholder h-32 mb-12';
            placeholder.dataset.configIndex = i;
            placeholder.innerHTML = `<h2 class="text-xl md:text-2xl font-bold text-white/30 px-4 md:px-12">${sections[i].title}</h2>`;
            elements.videoGrid.appendChild(placeholder);
            lazyObserver.observe(placeholder);
        }

        // Fallback: If hero is still empty, use first available content

        if (!state.featuredVideo) {
            if (firstAvailableMovies && firstAvailableMovies.length > 0) {
                state.featuredVideo = firstAvailableMovies[0];
                state.videos = firstAvailableMovies;
                renderHero();
            } else {
                // Absolute final fallback: Demo content to prevent broken UI
                try {
                    const demo = getDemoContent();
                    if (demo && demo.length > 0) {
                        state.featuredVideo = demo[0];
                        state.videos = demo;
                        renderHero();
                    }
                } catch (e) { console.warn('Demo content fallback failed', e); }
            }
        }

        // If no sections were rendered, show a message
        if (elements.videoGrid.children.length === 0) {
            elements.videoGrid.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                    <span class="material-symbols-outlined text-6xl mb-4 opacity-30">movie</span>
                    <p>No content available for this category</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error rendering category view:', error);
        elements.videoGrid.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-gray-400">
                <span class="material-symbols-outlined text-6xl mb-4 opacity-30">error</span>
                <p>Failed to load content. Please try again.</p>
            </div>
        `;
    }

    showLoading(false);
}

/**
 * Fetch movies for a specific section configuration
 * @param {Object} config - Section configuration
 * @returns {Array} Array of movies
 */
async function fetchSectionMovies(config) {
    try {
        // Handle history section (Continue Watching)
        if (config.type === 'history') {
            if (window.historyService) {
                const history = window.historyService.getHistory();
                return history.slice(0, config.limit).map(m => ({
                    id: m.slug || m.id,
                    title: m.title,
                    thumbnail: m.thumbnail || m.poster_url,
                    slug: m.slug,
                    year: m.year,
                    quality: m.quality || 'HD',
                    view_progress: m.view_progress || 0 // Ensure progress
                }));
            }
            return [];
        }

        // Build Base API request parameters
        const baseParams = {
            category: config.category || null,
            limit: config.limit || 40,
            sort: config.sort || 'year'
        };

        if (config.country) baseParams.country = config.country;
        if (config.genre) baseParams.genre = config.genre;

        // Strategy: Aggressive Fetching (Pages 1-8)
        // Some categories with specific sorts (like year) might have broken pagination or limited data.
        // We fetch many pages to maximize chance of filling the grid.
        const fetchPages = async (params) => {
            const promises = [1, 2, 3, 4, 5, 6, 7, 8].map(page =>
                api.getRophimCatalog({ ...params, page })
                    .catch(e => ({ movies: [] }))
            );
            const res = await Promise.all(promises);
            return res.flatMap(r => r.movies || []);
        };

        let rawMovies = await fetchPages(baseParams);

        // Fallback Strategy: If specific sort yielded too few results (< 20),
        // try fetching with default sort ('modified') to fill the grid.
        if (rawMovies.length < 20 && config.sort && config.sort !== 'modified') {
            const fallbackMovies = await fetchPages({ ...baseParams, sort: 'modified' });
            rawMovies = [...rawMovies, ...fallbackMovies];
        }

        // Deduplicate and Format
        const allMovies = [];
        const seenIds = new Set();

        for (const m of rawMovies) {
            if (!m) continue;
            const id = m.slug || m.id;
            if (!seenIds.has(id)) {
                seenIds.add(id);
                allMovies.push({
                    id: m.id || m.slug,
                    title: m.title,
                    thumbnail: m.thumbnail,
                    poster_url: m.poster_url || m.thumbnail,
                    backdrop: m.backdrop || m.poster_url || m.thumbnail,
                    slug: m.slug,
                    year: m.year,
                    quality: m.quality || 'HD',
                    rating: m.rating,
                    category: m.category
                });
            }
        }

        // Return up to limit (ensure we don't return too many if we over-fetched)
        // But also return enough to fill 6 rows if possible!
        const limit = Math.max(config.limit || 40, 48);
        return allMovies.slice(0, limit);
    } catch (error) {
        console.error(`Error fetching section "${config.title}":`, error);
        return [];
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
/**
 * Get high-fidelity demo content for Netflix 2025 layout
 */
/**
 * Get high-fidelity demo content for Netflix 2025 layout
 */
/**
 * Get high-fidelity demo content for Netflix 2025 layout
 */
/**
 * Get high-fidelity demo content for Netflix 2025 layout
 */
function getDemoContent() {
    const SAMPLE_MP4 = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    // Unsplash Thematic Placeholders for Offline Mode
    const IMAGES = {
        VENOM: 'https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg', // TMDB Verified
        SQUID: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop', // Red/Triangles
        ARCANE: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop', // Neon/Cyberpunk
        PENGUIN: 'https://images.unsplash.com/photo-1478720568477-152d9b164e63?w=800&auto=format&fit=crop', // Rainy City
        GLADIATOR: 'https://images.unsplash.com/photo-1565060416-522204c35613?w=800&auto=format&fit=crop', // Colosseum
        MOANA: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop', // Ocean
        WICKED: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop', // Green/Magic
        DBZ: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop' // Anime/Fire
    };

    return [
        {
            id: 'd1',
            title: 'Venom: The Last Dance',
            thumbnail: IMAGES.VENOM,
            backdrop: 'https://image.tmdb.org/t/p/original/3V4kLQg0kSqPLctI5ziYWabAZYF.jpg',
            preview_url: SAMPLE_MP4,
            duration: 7200,
            resolution: '4K',
            category: 'action',
            year: 2024,
            matchScore: 98,
            director: 'Kelly Marcel',
            country: 'USA',
            cast: ['Tom Hardy', 'Chiwetel Ejiofor', 'Juno Temple'],
            description: 'Eddie and Venom are on the run. Hunted by both of their worlds and with the net closing in, the duo are forced into a devastating decision.',
            episodes: []
        },
        {
            id: 'd2',
            title: 'Squid Game Season 2',
            thumbnail: IMAGES.SQUID,
            backdrop: IMAGES.SQUID,
            preview_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: 3600,
            resolution: 'HD',
            category: 'series',
            year: 2024,
            matchScore: 99,
            director: 'Hwang Dong-hyuk',
            country: 'Korea',
            cast: ['Lee Jung-jae', 'Lee Byung-hun', 'Wi Ha-jun'],
            description: 'Gi-hun returns to the death games after three years with a new resolution: to find the people behind and to put an end to the sport.',
            episodes: [
                { number: 1, title: 'Red Light, Green Light', url: SAMPLE_MP4 },
                { number: 2, title: 'The Man with the Umbrella', url: SAMPLE_MP4 },
                { number: 3, title: 'Stick to the Team', url: SAMPLE_MP4 }
            ]
        },
        {
            id: 'd3',
            title: 'Arcane Season 2',
            thumbnail: IMAGES.ARCANE,
            backdrop: IMAGES.ARCANE, // Use high-res version normally
            preview_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: 2400,
            resolution: '4K',
            category: 'anime',
            year: 2024,
            matchScore: 97,
            director: 'Christian Linke',
            country: 'USA, France',
            cast: ['Hailee Steinfeld', 'Ella Purnell', 'Katie Leung'],
            description: 'As conflict between Piltover and Zaun reaches a boiling point, Jinx and Vi must decide what kind of future they are fighting for.',
            episodes: [
                { number: 1, title: 'Heavy Is the Crown', url: SAMPLE_MP4 },
                { number: 2, title: 'Watch It All Burn', url: SAMPLE_MP4 },
                { number: 3, title: 'Finally Got It Right', url: SAMPLE_MP4 }
            ]
        },
        {
            id: 'd4',
            title: 'The Penguin',
            thumbnail: IMAGES.PENGUIN,
            backdrop: IMAGES.PENGUIN,
            preview_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: 3600,
            resolution: 'HD',
            category: 'series',
            year: 2024,
            matchScore: 95,
            director: 'Craig Zobel',
            country: 'USA',
            cast: ['Colin Farrell', 'Cristin Milioti', 'Rhenzy Feliz'],
            description: 'Following the events of The Batman, Oz Cobb makes a play for power in the underworld of Gotham City.',
            episodes: []
        },
        {
            id: 'd5',
            title: 'Gladiator II',
            thumbnail: IMAGES.GLADIATOR,
            backdrop: IMAGES.GLADIATOR,
            preview_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            duration: 8400,
            resolution: '4K',
            category: 'action',
            year: 2024,
            matchScore: 96,
            director: 'Ridley Scott',
            country: 'USA, UK',
            cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington'],
            description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius is forced to enter the Colosseum.',
            episodes: []
        },
        {
            id: 'd6',
            title: 'Moana 2',
            thumbnail: IMAGES.MOANA,
            backdrop: IMAGES.MOANA,
            preview_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            duration: 6000,
            resolution: 'HD',
            category: 'theater',
            year: 2024,
            matchScore: 94,
            director: 'David G. Derrick Jr.',
            country: 'USA',
            cast: ['Auliʻi Cravalho', 'Dwayne Johnson', 'Alan Tudyk'],
            description: 'After receiving an unexpected call from her wayfinding ancestors, Moana must journey to the far seas of Oceania.',
            episodes: []
        },
        {
            id: 'd7',
            title: 'Wicked',
            thumbnail: IMAGES.WICKED,
            backdrop: IMAGES.WICKED,
            preview_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            duration: 9000,
            resolution: '4K',
            category: 'theater',
            year: 2024,
            matchScore: 93,
            director: 'Jon M. Chu',
            country: 'USA',
            cast: ['Cynthia Erivo', 'Ariana Grande', 'Jeff Goldblum'],
            description: 'Elphaba, a misunderstood young woman with green skin, and Glinda, a popular blonde, forge an unlikely friendship.',
            episodes: []
        },
        {
            id: 'd8',
            title: 'Dragon Ball Daima',
            thumbnail: IMAGES.DBZ,
            backdrop: IMAGES.DBZ,
            preview_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            duration: 1440,
            resolution: 'HD',
            category: 'anime',
            year: 2024,
            matchScore: 98,
            director: 'Yoshitaka Yashima',
            country: 'Japan',
            cast: ['Masako Nozawa', 'Ryō Horikawa'],
            description: 'Goku and his friends are turned small due to a conspiracy. To fix things, they head off to a new world.',
            episodes: [
                { number: 1, title: 'Conspiracy', url: SAMPLE_MP4 }
            ]
        }
    ];
}

/**
 * Render Category Shortcuts (Horizontal Slider of Cards)
 */
function renderCategoryShortcuts() {
    const shortcuts = [
        { title: 'Phim Hot', sub: '(Movies)', tag: 'Phim Hot' },
        { title: 'Phim Bộ Mới', sub: '(Series)', tag: 'Phim Bộ Mới' },
        { title: 'Hoạt Hình & Anime', sub: '(Animation)', tag: 'Hoạt Hình' },
        { title: 'Phim Việt Nam', sub: '(Local)', tag: 'Phim Việt Nam' }
    ];

    const section = document.createElement('section');
    section.className = 'category-shortcuts-section scrollbar-hide';
    // Style handled in CSS

    const track = document.createElement('div');
    track.className = 'category-shortcuts-track';

    shortcuts.forEach(item => {
        const card = document.createElement('div');
        card.className = 'shortcut-card';
        card.innerHTML = `
            <h3>${item.title}</h3>
            <span>${item.sub}</span>
            <div class="shortcut-icon">›</div>
        `;

        card.addEventListener('click', () => {
            // Scroll to section logic
            const titles = Array.from(document.querySelectorAll('.section-title-apple, .section-banner__title'));
            const target = titles.find(t => t.textContent.includes(item.tag));
            if (target) {
                target.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                console.warn("Section not found:", item.tag);
            }
        });
        track.appendChild(card);
    });

    section.appendChild(track);
    return section;
}
/**
 * Render Profile View - Mobile first profile screen
 */
function renderProfileView() {
    // Show standard header and hero section
    if (elements.mainHeader) elements.mainHeader.style.display = '';
    const heroContainer = document.getElementById('heroContainer');
    if (heroContainer) {
        heroContainer.style.display = '';
        renderHero();
    }

    // Update bottom nav active state (profile is not in nav, so none will be active)
    setMobileNavActive('profile');

    // Clear content
    elements.videoGrid.innerHTML = '';
    elements.videoGrid.className = 'profile-view pb-24 bg-background-light dark:bg-background-dark min-h-screen';

    // HTML Structure based on user example
    const profileHTML = `
        <!-- Sticky Top Bar (at offset) -->
        <div class="sticky top-[60px] md:top-[80px] z-40 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 justify-between border-b border-gray-200 dark:border-white/10">
            <button class="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors" onclick="renderHome()">
                <span class="material-symbols-outlined text-slate-900 dark:text-white" style="font-size: 24px;">arrow_back</span>
            </button>
            <h2 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Profile</h2>
            <button class="flex w-12 items-center justify-center rounded text-sm font-semibold text-primary hover:text-red-500 transition-colors">Edit</button>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar">
            <!-- Profile Header -->
            <div class="flex flex-col items-center pt-6 pb-6 px-4">
                <div class="relative group cursor-pointer">
                    <div class="bg-center bg-no-repeat bg-cover rounded-lg w-28 h-28 shadow-lg ring-2 ring-transparent group-hover:ring-primary transition-all duration-300" 
                         style='background-image: url("https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg");'>
                    </div>
                    <div class="absolute -bottom-2 -right-2 bg-surface-dark p-1.5 rounded-full border border-gray-700 shadow-md">
                        <span class="material-symbols-outlined text-white text-xs block">edit</span>
                    </div>
                </div>
                <h3 class="mt-4 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Isabella Hall</h3>
                <button class="mt-2 text-sm font-medium text-secondary-text hover:text-white transition-colors flex items-center gap-1">
                    Manage Profiles <span class="material-symbols-outlined text-sm">chevron_right</span>
                </button>
            </div>

            <!-- Profile Stats -->
            <div class="grid grid-cols-3 gap-3 px-4 mb-8">
                <div class="flex flex-col gap-1 rounded-lg bg-white dark:bg-[#1E1E1E] p-3 items-center text-center shadow-sm border border-gray-100 dark:border-white/5">
                    <p class="text-primary text-xl font-bold leading-tight">42</p>
                    <p class="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-medium uppercase tracking-wider">Movies</p>
                </div>
                <div class="flex flex-col gap-1 rounded-lg bg-white dark:bg-[#1E1E1E] p-3 items-center text-center shadow-sm border border-gray-100 dark:border-white/5">
                    <p class="text-primary text-xl font-bold leading-tight">128h</p>
                    <p class="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-medium uppercase tracking-wider">Streamed</p>
                </div>
                <div class="flex flex-col gap-1 rounded-lg bg-white dark:bg-[#1E1E1E] p-3 items-center text-center shadow-sm border border-gray-100 dark:border-white/5">
                    <p class="text-primary text-xl font-bold leading-tight">15</p>
                    <p class="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-medium uppercase tracking-wider">Reviews</p>
                </div>
            </div>

            <!-- Continue Watching Container -->
            <div id="profileHistoryContainer" class="mb-8"></div>

            <!-- Menu List -->
            <div class="flex flex-col px-4 gap-2 mb-8">
                <a class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group border border-gray-100 dark:border-white/5 cursor-pointer" onclick="renderHistoryView('mylist'); return false;">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">checklist</span>
                        </div>
                        <span class="text-base font-medium text-slate-900 dark:text-white">My List</span>
                    </div>
                    <span class="material-symbols-outlined text-secondary-text text-xl">chevron_right</span>
                </a>
                <a class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group border border-gray-100 dark:border-white/5 cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">settings</span>
                        </div>
                        <span class="text-base font-medium text-slate-900 dark:text-white">App Settings</span>
                    </div>
                    <span class="material-symbols-outlined text-secondary-text text-xl">chevron_right</span>
                </a>
                <a class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group border border-gray-100 dark:border-white/5 cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">person</span>
                        </div>
                        <span class="text-base font-medium text-slate-900 dark:text-white">Account</span>
                    </div>
                    <span class="material-symbols-outlined text-secondary-text text-xl">chevron_right</span>
                </a>
                <a class="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-[#1E1E1E] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group border border-gray-100 dark:border-white/5 cursor-pointer">
                    <div class="flex items-center gap-4">
                        <div class="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white group-hover:text-primary transition-colors">
                            <span class="material-symbols-outlined">help</span>
                        </div>
                        <span class="text-base font-medium text-slate-900 dark:text-white">Help</span>
                    </div>
                    <span class="material-symbols-outlined text-secondary-text text-xl">chevron_right</span>
                </a>
            </div>

            <!-- Footer Actions -->
            <div class="px-4 pb-8 flex flex-col items-center gap-4">
                <button class="w-full py-3.5 px-4 rounded-lg bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 text-slate-900 dark:text-white font-semibold text-base hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-gray-500 transition-all">
                    Sign Out
                </button>
                <p class="text-xs text-secondary-text">Version 4.12.0</p>
            </div>
        </div>
    `;

    elements.videoGrid.innerHTML = profileHTML;

    // Inject history
    if (window.historyService) {
        const historyItems = window.historyService.getHistory().slice(0, 10);
        if (historyItems.length > 0) {
            const historyContainer = document.getElementById('profileHistoryContainer');
            // Re-use createSliderSection. Note: it has padding baked in from previous task.
            // We might want to ensure it looks good here.
            const slider = createSliderSection('Continue Watching', historyItems, 'landscape');
            historyContainer.appendChild(slider);
        }
    }
}

/**
 * Render Home View Wrapper
 */
async function renderHome() {
    if (elements.mainHeader) elements.mainHeader.style.display = '';

    // Show hero section
    const heroContainer = document.getElementById('heroContainer');
    if (heroContainer) heroContainer.style.display = '';

    // Update bottom nav
    setMobileNavActive('home');

    // Hide footer on mobile
    if (window.innerWidth < 768) {
        document.querySelectorAll('footer').forEach(f => f.style.display = 'none');
        const searchModal = document.getElementById('searchModal');
        if (searchModal) searchModal.classList.remove('active');
    } else {
        document.querySelectorAll('footer').forEach(f => f.style.display = '');
    }

    await renderCategoryView('home');
}

/**
 * Render Mobile Search View
 */
async function renderMobileSearch() {
    // Show standard header and hero section
    if (elements.mainHeader) elements.mainHeader.style.display = '';
    const heroContainer = document.getElementById('heroContainer');
    if (heroContainer) {
        heroContainer.style.display = '';
        renderHero(); // Ensure hero is populated
    }

    // Hide all footers on mobile
    document.querySelectorAll('footer').forEach(f => f.style.display = 'none');

    // Explicitly hide search modal/popup if it somehow triggered
    const searchModal = document.getElementById('searchModal');
    if (searchModal) searchModal.classList.remove('active');

    // Update bottom nav
    setMobileNavActive('search');

    // Clear content - leave room for fixed bottom nav (80px = nav height + safe area)
    elements.videoGrid.innerHTML = '';
    elements.videoGrid.className = 'mobile-search-view bg-background-light dark:bg-background-dark';

    // HTML Structure based on user example
    const searchHTML = `
        <!-- Search Header (Sticky below main header) -->
        <div class="shrink-0 bg-background-dark/80 backdrop-blur-md pt-4 z-50 px-4 py-2 sticky top-[60px] md:top-[80px] w-full border-b border-white/5">
            <div class="flex items-center gap-3">
                <div class="relative flex-1">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-[#cc8f92]">
                        <span class="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <input autofocus class="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg text-sm bg-gray-100 dark:bg-[#361618] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#cc8f92]/70 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" placeholder="Search for shows, movies, genres..." type="text" id="mobileSearchInput">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 dark:text-[#cc8f92]">
                        <span class="material-symbols-outlined text-[20px]">mic</span>
                    </div>
            </div>
                <button class="text-sm font-medium text-slate-500 dark:text-white/80 active:text-white" id="mobileSearchCancel">Cancel</button>
            </div>
            <!-- Filter Chips -->
            <div id="searchFilterChips" class="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button class="search-chip active flex h-8 shrink-0 items-center justify-center rounded-full bg-white text-black px-4" data-genre="trending">
                    <p class="text-xs font-bold leading-normal">Top Searches</p>
                </button>
                <button class="search-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark border border-transparent dark:border-white/10 px-4" data-genre="hanh-dong">
                    <p class="text-slate-700 dark:text-gray-300 text-xs font-medium leading-normal">Action</p>
                </button>
                <button class="search-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark border border-transparent dark:border-white/10 px-4" data-genre="hoat-hinh">
                    <p class="text-slate-700 dark:text-gray-300 text-xs font-medium leading-normal">Anime</p>
                </button>
                <button class="search-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark border border-transparent dark:border-white/10 px-4" data-genre="vien-tuong">
                    <p class="text-slate-700 dark:text-gray-300 text-xs font-medium leading-normal">Sci-Fi</p>
                </button>
                <button class="search-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark border border-transparent dark:border-white/10 px-4" data-genre="hai-huoc">
                    <p class="text-slate-700 dark:text-gray-300 text-xs font-medium leading-normal">Comedy</p>
                </button>
            </div>
        </div>
        
        <!-- Results/Content Area with bottom padding for nav bar -->
        <div id="mobileSearchResults" class="flex-1 overflow-y-auto no-scrollbar pt-4 pb-24">
             <div class="mb-3">
                <h2 class="text-slate-900 dark:text-white text-lg font-bold px-4">Top Searches</h2>
             </div>
             <div id="topSearchesList" class="flex flex-col gap-1"></div>
             
             <div class="pt-8 px-4">
                <h2 class="text-slate-900 dark:text-white text-lg font-bold mb-4">Recommended for You</h2>
                <div id="recommendedGrid" class="grid grid-cols-3 gap-3"></div>
             </div>
        </div>
    `;

    elements.videoGrid.innerHTML = searchHTML;

    // Wire up mobile search input with proper API search
    const mobileInput = document.getElementById('mobileSearchInput');
    const resultsContainer = document.getElementById('mobileSearchResults');
    let searchTimeout = null;

    if (mobileInput && resultsContainer) {
        mobileInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();

            searchTimeout = setTimeout(async () => {
                if (query.length < 2) {
                    // Show default content (top searches, recommended)
                    return;
                }

                // Show loading
                resultsContainer.innerHTML = '<div class="flex justify-center py-12"><div class="loading-spinner"></div></div>';

                try {
                    const response = await api.searchRophim(query);

                    if (response && response.movies && response.movies.length > 0) {
                        resultsContainer.innerHTML = `
                            <h2 class="text-white text-sm font-bold px-4 mb-3">Results for "${query}"</h2>
                            <div class="grid grid-cols-3 gap-3 px-4"></div>
                        `;
                        const grid = resultsContainer.querySelector('.grid');
                        response.movies.forEach(movie => {
                            const card = document.createElement('div');
                            card.className = 'relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer';
                            card.innerHTML = `
                                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${movie.thumbnail}");'></div>
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div class="absolute bottom-0 left-0 right-0 p-2">
                                        <p class="text-white text-[10px] font-bold line-clamp-1">${movie.title}</p>
                                    </div>
                                </div>
                            `;
                            card.addEventListener('click', () => handleVideoPlay(movie));
                            grid.appendChild(card);
                        });
                    } else {
                        resultsContainer.innerHTML = `
                            <div class="text-center py-12">
                                <span class="material-symbols-outlined text-4xl text-white/30 mb-2">search_off</span>
                                <p class="text-white/50">No results for "${query}"</p>
                            </div>
                        `;
                    }
                } catch (error) {
                    console.error('Mobile search failed:', error);
                    resultsContainer.innerHTML = '<div class="text-center py-12 text-white/50">Search failed. Try again.</div>';
                }
            }, 300);
        });

        // Focus input automatically
        mobileInput.focus();
    }

    // Cancel button clears search and restores default content
    const cancelBtn = document.getElementById('mobileSearchCancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const input = document.getElementById('mobileSearchInput');
            if (input) {
                input.value = '';
                input.focus();
            }
            // Re-render the mobile search view to restore default content
            renderMobileSearch();
        });
    }
    // Populate Top Searches (Trending)
    try {
        const trending = await api.getRophimCatalog({ category: 'trending', limit: 5 });
        if (trending && trending.movies) {
            const container = document.getElementById('topSearchesList');
            trending.movies.forEach(movie => {
                const el = document.createElement('div');
                el.className = 'group flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors';
                el.innerHTML = `
                    <div class="shrink-0 relative">
                        <div class="bg-center bg-cover rounded-lg h-16 w-28 shadow-sm" style='background-image: url("${movie.thumbnail}");'></div>
                    </div>
                    <div class="flex flex-col justify-center flex-1 min-w-0">
                        <p class="text-slate-900 dark:text-white text-sm font-semibold leading-normal truncate group-hover:text-primary transition-colors">${movie.title}</p>
                        <p class="text-slate-500 dark:text-[#cc8f92] text-xs font-normal leading-normal truncate">${movie.year || '2024'}</p>
                    </div>
                    <div class="shrink-0">
                        <span class="material-symbols-outlined text-slate-400 dark:text-white text-[28px] group-hover:text-primary">play_circle</span>
                    </div>
                `;
                el.addEventListener('click', () => handleVideoPlay(movie));
                container.appendChild(el);
            });
        }

        // Populate Recommended
        const recommended = await api.getRophimCatalog({ category: 'phim-le', limit: 9 });
        if (recommended && recommended.movies) {
            const grid = document.getElementById('recommendedGrid');
            recommended.movies.forEach(movie => {
                const card = document.createElement('div');
                card.className = 'relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer';
                card.innerHTML = `
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${movie.thumbnail}");'></div>
                 `;
                card.addEventListener('click', () => handleVideoPlay(movie));
                grid.appendChild(card);
            });
        }

    } catch (e) {
        console.error('Failed to load mobile search content', e);
    }

    // Set up genre filter chip click handlers
    const filterChips = document.querySelectorAll('.search-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', async () => {
            const genre = chip.dataset.genre;
            if (!genre) return;

            // Update active chip styling
            filterChips.forEach(c => {
                c.classList.remove('active', 'bg-white', 'text-black');
                c.classList.add('bg-gray-200', 'dark:bg-surface-dark');
                const p = c.querySelector('p');
                if (p) {
                    p.classList.remove('font-bold');
                    p.classList.add('font-medium', 'text-slate-700', 'dark:text-gray-300');
                }
            });
            chip.classList.add('active', 'bg-white', 'text-black');
            chip.classList.remove('bg-gray-200', 'dark:bg-surface-dark');
            const chipP = chip.querySelector('p');
            if (chipP) {
                chipP.classList.add('font-bold');
                chipP.classList.remove('font-medium', 'text-slate-700', 'dark:text-gray-300');
            }

            // Fetch and display genre content
            const resultsContainer = document.getElementById('mobileSearchResults');
            if (resultsContainer) {
                resultsContainer.innerHTML = '<div class="flex justify-center py-12"><div class="loading-spinner"></div></div>';

                try {
                    const response = await api.getRophimCatalog({ category: genre, limit: 12 });
                    if (response && response.movies && response.movies.length > 0) {
                        const chipName = chip.querySelector('p')?.textContent || genre;
                        resultsContainer.innerHTML = `
                            <h2 class="text-white text-lg font-bold px-4 mb-4">${chipName}</h2>
                            <div class="grid grid-cols-3 gap-3 px-4"></div>
                        `;
                        const grid = resultsContainer.querySelector('.grid');
                        response.movies.forEach(movie => {
                            const card = document.createElement('div');
                            card.className = 'relative group aspect-[2/3] overflow-hidden rounded-lg cursor-pointer';
                            card.innerHTML = `
                                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style='background-image: url("${movie.thumbnail}");'></div>
                            `;
                            card.addEventListener('click', () => handleVideoPlay(movie));
                            grid.appendChild(card);
                        });
                    } else {
                        resultsContainer.innerHTML = '<p class="text-center text-gray-400 py-12">No results found</p>';
                    }
                } catch (e) {
                    console.error('Genre filter error:', e);
                    resultsContainer.innerHTML = '<p class="text-center text-gray-400 py-12">Failed to load content</p>';
                }
            }
        });
    });
}

/**
 * Render Mobile My List View - Netflix-style grid layout
 */
async function renderMobileMyList() {
    // Show standard header and hero
    if (elements.mainHeader) elements.mainHeader.style.display = '';
    const heroContainer = document.getElementById('heroContainer');
    if (heroContainer) {
        heroContainer.style.display = '';
        renderHero();
    }

    // Hide all footers on mobile
    document.querySelectorAll('footer').forEach(f => f.style.display = 'none');

    // Explicitly hide search modal/popup
    const searchModal = document.getElementById('searchModal');
    if (searchModal) searchModal.classList.remove('active');

    // Update nav active state
    setMobileNavActive('mylist');

    // Get saved items
    const items = window.historyService ? window.historyService.getFavorites() : [];

    elements.videoGrid.innerHTML = '';
    elements.videoGrid.className = 'mobile-mylist-view min-h-screen bg-background-dark pb-24';

    const mylistHTML = `
        <!-- Sticky Header (Using sticky at an offset to allow scrolling past hero and main header) -->
        <header class="sticky top-[60px] md:top-[80px] left-0 right-0 z-[100] flex flex-col bg-background-dark/90 backdrop-blur-md pt-4 border-b border-white/5">
            <div class="flex items-center justify-between px-4 pb-2">
                <h1 class="text-2xl font-bold tracking-tight text-white">My List</h1>
                <button class="flex h-10 w-10 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors">
                    <span class="material-symbols-outlined text-[24px]">edit</span>
                </button>
            </div>
            <!-- Filter Chips -->
            <div id="mylistFilterChips" class="flex w-full gap-3 overflow-x-auto px-4 pb-4 pt-2 no-scrollbar">
                <button class="mylist-chip active flex h-8 shrink-0 items-center justify-center rounded-full bg-white px-4 shadow-lg shadow-white/10" data-filter="all" data-category="trending">
                    <p class="text-xs font-bold text-black">All</p>
                </button>
                <button class="mylist-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-surface-dark border border-white/20 px-4 hover:bg-white/10" data-filter="movies" data-category="phim-le">
                    <p class="text-xs font-medium text-gray-200">Movies</p>
                </button>
                <button class="mylist-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-surface-dark border border-white/20 px-4 hover:bg-white/10" data-filter="tvshows" data-category="phim-bo">
                    <p class="text-xs font-medium text-gray-200">TV Shows</p>
                </button>
                <button class="mylist-chip flex h-8 shrink-0 items-center justify-center rounded-full bg-surface-dark border border-white/20 px-4 hover:bg-white/10" data-filter="anime" data-category="hoat-hinh">
                    <p class="text-xs font-medium text-gray-200">Anime</p>
                </button>
            </div>
        </header>

        <!-- Grid Container -->
        <main class="px-4 pt-4 pb-24">
            <div id="mylistGrid" class="grid grid-cols-3 gap-3"></div>
        </main>
    `;

    elements.videoGrid.innerHTML = mylistHTML;

    // Populate grid with saved items or fallback content
    const grid = document.getElementById('mylistGrid');

    if (items.length > 0) {
        items.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'group relative flex flex-col gap-2 cursor-pointer';
            card.innerHTML = `
                <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                         style='background-image: url("${movie.thumbnail || movie.poster_url}");'></div>
                    <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                </div>
            `;
            card.addEventListener('click', () => handleVideoPlay(movie));
            grid.appendChild(card);
        });
    } else {
        // Load trending as placeholder
        try {
            const trending = await api.getRophimCatalog({ category: 'trending', limit: 12 });
            if (trending && trending.movies) {
                trending.movies.forEach((movie, index) => {
                    const card = document.createElement('div');
                    card.className = 'group relative flex flex-col gap-2 cursor-pointer';
                    card.innerHTML = `
                        <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                                 style='background-image: url("${movie.thumbnail}");'></div>
                            ${index === 0 ? '<div class="absolute top-0 right-0 rounded-bl-md bg-primary px-1.5 py-0.5"><span class="text-[10px] font-bold uppercase text-white tracking-wider">New</span></div>' : ''}
                            <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                        </div>
                    `;
                    card.addEventListener('click', () => handleVideoPlay(movie));
                    grid.appendChild(card);
                });
            }
        } catch (e) {
            console.error('Failed to load my list content', e);
        }
    }

    // Set up My List filter chip click handlers
    const mylistChips = document.querySelectorAll('.mylist-chip');
    mylistChips.forEach(chip => {
        chip.addEventListener('click', async () => {
            const filter = chip.dataset.filter;
            const category = chip.dataset.category;
            if (!filter || !category) return;

            // Update active chip styling
            mylistChips.forEach(c => {
                c.classList.remove('active', 'bg-white');
                c.classList.add('bg-surface-dark');
                const p = c.querySelector('p');
                if (p) {
                    p.classList.remove('font-bold', 'text-black');
                    p.classList.add('font-medium', 'text-gray-200');
                }
            });
            chip.classList.add('active', 'bg-white');
            chip.classList.remove('bg-surface-dark');
            const chipP = chip.querySelector('p');
            if (chipP) {
                chipP.classList.add('font-bold', 'text-black');
                chipP.classList.remove('font-medium', 'text-gray-200');
            }

            // Fetch and display filtered content
            const grid = document.getElementById('mylistGrid');
            if (grid) {
                grid.innerHTML = '<div class="col-span-3 flex justify-center py-12"><div class="loading-spinner"></div></div>';

                try {
                    const response = await api.getRophimCatalog({ category: category, limit: 12 });
                    grid.innerHTML = '';
                    if (response && response.movies && response.movies.length > 0) {
                        response.movies.forEach((movie, index) => {
                            const card = document.createElement('div');
                            card.className = 'group relative flex flex-col gap-2 cursor-pointer';
                            card.innerHTML = `
                                <div class="relative w-full overflow-hidden rounded-md bg-surface-dark shadow-md aspect-[2/3]">
                                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                                         style='background-image: url("${movie.thumbnail}");'></div>
                                    ${index === 0 ? '<div class="absolute top-0 right-0 rounded-bl-md bg-primary px-1.5 py-0.5"><span class="text-[10px] font-bold uppercase text-white tracking-wider">New</span></div>' : ''}
                                    <div class="absolute inset-0 bg-black/0 transition-colors group-active:bg-black/20"></div>
                                </div>
                            `;
                            card.addEventListener('click', () => handleVideoPlay(movie));
                            grid.appendChild(card);
                        });
                    } else {
                        grid.innerHTML = '<p class="col-span-3 text-center text-gray-400 py-12">No content found</p>';
                    }
                } catch (e) {
                    console.error('Filter error:', e);
                    grid.innerHTML = '<p class="col-span-3 text-center text-gray-400 py-12">Failed to load content</p>';
                }
            }
        });
    });
}
