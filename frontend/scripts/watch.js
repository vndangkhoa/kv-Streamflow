/**
 * KV-Stream Watch Page
 * Handles video playback, episode navigation, and recommendations
 */

import { api } from './api.js';
import { showToast } from './components/Toast.js';
import { initPlayer, destroyPlayer } from './components/VideoPlayer.js';

// Page State
const state = {
    video: null,
    currentEpisode: 1,
    currentServer: 0,
    recommendations: [],
    isLoading: true
};

// Expose state for debugging
window.state = state;

// DOM Elements - Resolved at runtime for robustness
let elements = {};

function initElements() {
    elements = {
        // Video player
        videoPlayer: document.getElementById('videoPlayer'),
        videoPlayerContainer: document.getElementById('videoPlayerContainer'),
        playerLoading: document.getElementById('playerLoading'),
        closePlayer: document.getElementById('closePlayer'),

        // Hero section (Desktop)
        heroBg: document.getElementById('heroBg'),
        movieTitle: document.getElementById('movieTitleDesktop'),
        movieMatch: document.getElementById('movieMatchDesktop'),
        movieYear: document.getElementById('movieYearDesktop'),
        movieRating: document.getElementById('movieRatingDesktop'),
        movieQuality: document.getElementById('movieQualityDesktop'),
        movieDescription: document.getElementById('movieDescriptionDesktop'),
        movieTags: document.getElementById('movieTags'),

        // Mobile Elements
        movieTitleMobile: document.getElementById('movieTitleMobile'),
        movieMatchMobile: document.getElementById('movieMatchMobile'),
        movieYearMobile: document.getElementById('movieYearMobile'),
        movieRatingMobile: document.getElementById('movieRatingMobile'),
        movieDuration: document.getElementById('movieDurationDesktop'), // Added this
        movieDurationMobile: document.getElementById('movieDurationMobile'),
        movieQualityMobile: document.getElementById('movieQualityMobile'),
        movieDescriptionMobile: document.getElementById('movieDescriptionMobile'),

        // Action buttons
        playBtn: document.getElementById('playBtnDesktop'),
        addListBtn: document.getElementById('addListBtnDesktop'),
        addListIcon: document.getElementById('addListBtnDesktop')?.querySelector('.material-symbols-outlined'),
        addListText: document.getElementById('addListBtnDesktop')?.querySelector('span:last-child'),
        playBtnMobile: document.getElementById('playBtnMobile'),
        addListBtnMobile: document.getElementById('addListBtnMobile'),
        shareBtnMobile: document.getElementById('shareBtnMobile'),
        mobilePlayBtn: document.getElementById('mobilePlayBtn'),

        // Navigation
        watchHeader: document.getElementById('watchHeader'),
        tabNav: document.getElementById('tabNav'),
        watchBackBtn: document.getElementById('watchBackBtn'),

        // Panels
        episodesPanel: document.getElementById('episodesPanel'),
        trailersPanel: document.getElementById('trailersPanel'),
        detailsPanel: document.getElementById('detailsPanel'),

        // Content
        seasonSelect: document.getElementById('seasonSelect'),
        seasonSelectContainer: document.getElementById('seasonSelectContainer'),
        episodeCount: document.getElementById('episodeCount'),
        episodesGrid: document.getElementById('episodesGrid'),
        episodesLoading: document.getElementById('episodesLoading'),
        castCarousel: document.getElementById('castCarousel'),
        recommendationsContainer: document.getElementById('recommendationsContainer'),
        detailsList: document.getElementById('detailsList'),

        // Search
        searchModal: document.getElementById('searchModal'),
        searchBtn: document.getElementById('searchBtn'),
        searchInput: document.getElementById('searchInput'),
        closeSearch: document.getElementById('closeSearch')
    };
}


/**
 * Initialize watch page
 */
async function init() {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('id');
    const videoSlug = params.get('slug');
    const episode = parseInt(params.get('ep')) || 1;

    state.currentEpisode = episode;

    if (!videoId && !videoSlug) {
        showError('No video specified');
        return;
    }

    // Resolve elements once DOM is ready
    initElements();

    // Setup event listeners
    setupEventListeners();

    // Load video data
    await loadVideoData(videoId, videoSlug);

    // Load recommendations
    await loadRecommendations();
}

/**
 * Setup event listeners (StreamFlix Tailwind Design)
 */
function setupEventListeners() {
    // Scroll listener for header background
    window.addEventListener('scroll', () => {
        if (elements.watchHeader) {
            if (window.scrollY > 50) {
                elements.watchHeader.style.backgroundColor = 'rgba(20,20,20,0.95)';
            } else {
                elements.watchHeader.style.backgroundColor = 'transparent';
            }
        }
    });

    // Back Button Logic (Robust Close)
    if (elements.watchBackBtn) {
        elements.watchBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (elements.videoPlayerContainer && (elements.videoPlayerContainer.style.display !== 'none' || !elements.videoPlayerContainer.classList.contains('hidden'))) {
                closeVideoPlayer();
            } else if (document.referrer && document.referrer.includes(window.location.host)) {
                window.history.back();
            } else {
                window.location.href = '/index.html';
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close video player
            if (elements.videoPlayerContainer && !elements.videoPlayerContainer.classList.contains('hidden')) {
                closeVideoPlayer();
            }
            // Close search modal
            if (elements.searchModal && !elements.searchModal.classList.contains('hidden')) {
                elements.searchModal.classList.add('hidden');
            }
        }
    });

    [elements.playBtn, elements.playBtnMobile, elements.mobilePlayBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (elements.videoPlayerContainer) {
                    elements.videoPlayerContainer.classList.remove('hidden');
                    elements.videoPlayerContainer.style.display = 'block'; // Ensure visible
                }
                if (elements.videoPlayer) {
                    elements.videoPlayer.style.display = 'block';
                }
                playCurrentEpisode();
            });
        }
    });

    // Close player button
    if (elements.closePlayer) {
        elements.closePlayer.addEventListener('click', () => {
            closeVideoPlayer();
        });
    }

    // Search button - open search modal
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', () => {
            if (elements.searchModal) {
                elements.searchModal.classList.remove('hidden');
                setTimeout(() => elements.searchInput?.focus(), 100);
            }
        });
    }

    // Close search button
    if (elements.closeSearch) {
        elements.closeSearch.addEventListener('click', () => {
            if (elements.searchModal) {
                elements.searchModal.classList.add('hidden');
            }
        });
    }

    // Add to List button
    [elements.addListBtn, elements.addListBtnMobile].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (!state.video) return;

                const added = window.historyService?.toggleFavorite(state.video);
                updateAddListUI(added);

                if (added) {
                    showToast('Added to My List', 'success');
                } else {
                    showToast('Removed from My List', 'info');
                }
            });
        }
    });

    // Share button
    if (elements.shareBtnMobile) {
        elements.shareBtnMobile.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: state.video?.title || 'StreamFlix',
                    url: window.location.href
                });
            } else {
                // Fallback: Copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard', 'success');
            }
        });
    }

    // Tab Navigation (Tailwind design)
    if (elements.tabNav) {
        const tabs = elements.tabNav.querySelectorAll('.tab-btn');
        const panels = {
            episodes: elements.episodesPanel,
            details: elements.detailsPanel
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetPanel = tab.dataset.tab;

                // Update active tab styling
                tabs.forEach(t => {
                    t.classList.remove('text-white', 'font-bold', 'border-b-4', 'border-primary');
                    t.classList.add('text-gray-400', 'font-medium');
                });
                tab.classList.remove('text-gray-400', 'font-medium');
                tab.classList.add('text-white', 'font-bold', 'border-b-4', 'border-primary');

                // Show/hide panels
                Object.entries(panels).forEach(([key, panel]) => {
                    if (panel) {
                        if (key === targetPanel) {
                            panel.classList.remove('hidden');
                        } else {
                            panel.classList.add('hidden');
                        }
                    }
                });
            });
        });
    }
    // Mobile Bottom Navigation Handlers
    const mobileNavButtons = document.querySelectorAll('#mobileBottomNav .nav-item');
    mobileNavButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const view = btn.dataset.view;
            if (view) {
                // Redirect to home with view parameter
                window.location.href = `/index.html?view=${view}`;
            }
        });
    });
}


/**
 * Close Video Player (Robust Cleanup)
 */
function closeVideoPlayer() {
    // Re-resolve just in case
    const container = elements.videoPlayerContainer || document.getElementById('videoPlayerContainer');
    const player = elements.videoPlayer || document.getElementById('videoPlayer');
    const loader = elements.playerLoading || document.getElementById('playerLoading');

    if (container) {
        container.classList.add('hidden');
        container.style.display = 'none'; // Forced hide
    }

    // Destroy ArtPlayer instance
    destroyPlayer();

    if (player) {
        player.innerHTML = '';
        player.style.display = 'none';
    }

    if (loader) {
        loader.style.display = 'none';
    }
}

/**
 * Update Add to List UI buttons
 */
function updateAddListUI(isAdded) {
    const icon = isAdded ? 'check' : 'add';
    const text = isAdded ? 'In List' : 'My List';

    // Update Desktop
    if (elements.addListBtn) {
        const iconEl = elements.addListBtn.querySelector('.material-symbols-outlined');
        const textEl = elements.addListBtn.querySelector('span:last-child');
        if (iconEl) iconEl.textContent = icon;
        if (textEl) textEl.textContent = text;
        if (isAdded) elements.addListBtn.classList.add('bg-white/20');
        else elements.addListBtn.classList.remove('bg-white/20');
    }

    // Update Mobile
    if (elements.addListBtnMobile) {
        const iconEl = elements.addListBtnMobile.querySelector('.material-symbols-outlined');
        const textEl = elements.addListBtnMobile.querySelector('span:last-child');
        if (iconEl) iconEl.textContent = icon;
        if (textEl) textEl.textContent = text;
        if (isAdded) {
            elements.addListBtnMobile.classList.add('bg-white/10');
            elements.addListBtnMobile.classList.remove('bg-[#2b2b2b]');
        } else {
            elements.addListBtnMobile.classList.remove('bg-white/10');
            elements.addListBtnMobile.classList.add('bg-[#2b2b2b]');
        }
    }
}

/**
 * Load video data from API or stored state
 */
async function loadVideoData(videoId, videoSlug) {
    try {
        state.isLoading = true;

        let video = null;
        const slug = videoSlug || videoId;

        // Fetch fresh movie details from API
        if (slug) {
            try {
                const movieDetails = await api.getRophimMovie(slug);

                // API returns flat object, not nested under 'movie'
                if (movieDetails) {
                    const movie = movieDetails.movie || movieDetails; // Support both structures
                    const episodes = movieDetails.episodes || [];

                    video = {
                        id: movie.slug || slug,
                        slug: movie.slug || slug,
                        title: movie.name || movie.title || slug,
                        original_title: movie.origin_name || movie.original_title || '',
                        description: movie.content || movie.description || '',
                        thumbnail: movie.poster_url || movie.thumb_url || movie.thumbnail || '',
                        year: movie.year,
                        rating: movie.tmdb?.vote_average || movie.rating || 'N/A',
                        quality: movie.quality || 'HD',
                        duration: movie.time || movie.duration || '',

                        genres: (() => {
                            if (Array.isArray(movie.category)) return movie.category.map(c => c.name || c);
                            if (Array.isArray(movie.genres)) return movie.genres;
                            if (typeof movie.genre === 'string') return movie.genre.split(',').map(g => g.trim());
                            return [];
                        })(),
                        country: movie.country?.[0]?.name || movie.country || '',
                        country: movie.country?.[0]?.name || movie.country || '',
                        cast: movie.actor || movie.cast || [],
                        director: movie.director?.[0] || movie.director || '',
                        source_url: `https://phimmoichill.network/phim/${slug}`,
                        episodes: parseEpisodes(episodes)
                    };
                }
            } catch (apiError) {
                console.warn('API fetch failed:', apiError);
            }
        }

        if (!video) {
            throw new Error('Video data not found');
        }

        state.video = video;

        // Save to watch history
        if (window.historyService) {
            window.historyService.addToHistory(video, {
                episode: state.currentEpisode
            });
        }

        // Render video info
        renderVideoInfo(video);

        // Update Favorite Status
        if (window.historyService) {
            updateAddListUI(window.historyService.isFavorite(video.slug));
        }

        // Video is ready, but wait for user interaction to play
        // await playCurrentEpisode(); // Disabled auto-play per user request

    } catch (error) {
        console.error('Failed to load video:', error);
        showError('Failed to load video data');
    } finally {
        state.isLoading = false;
    }
}

/**
 * Parse episodes
 */
function parseEpisodes(episodesData) {
    if (!episodesData || !Array.isArray(episodesData) || episodesData.length === 0) {
        return [];
    }
    const server = episodesData[0];
    const serverData = server?.server_data || [];

    return serverData.map((ep, index) => ({
        number: index + 1,
        name: ep.name || `Episode ${index + 1}`,
        title: ep.filename || `Episode ${index + 1}`,
        slug: ep.slug || '',
        link_embed: ep.link_embed || '',
        link_m3u8: ep.link_m3u8 || ''
    }));
}

/**
 * Render video information (StreamFlix Tailwind Design)
 */
function renderVideoInfo(video) {
    // Hero Background Image
    if (elements.heroBg) {
        const backdrop = video.backdrop || video.poster_url || video.thumb_url || video.thumbnail || '';
        if (backdrop) {
            elements.heroBg.style.backgroundImage = `url('${backdrop}')`;
        }
    }

    // Title
    if (elements.movieTitle) elements.movieTitle.textContent = video.title;

    // Meta Data
    if (elements.movieYear) elements.movieYear.textContent = video.year || '';
    if (elements.movieDuration) {
        if (video.runtime_minutes) {
            const hours = Math.floor(video.runtime_minutes / 60);
            const mins = video.runtime_minutes % 60;
            elements.movieDuration.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        } else if (video.duration) {
            elements.movieDuration.textContent = video.duration;
        }
    }
    if (elements.movieQuality) elements.movieQuality.textContent = video.quality || 'HD';

    // Rating (show as PG-13 style or numeric)
    if (elements.movieRating) {
        const rating = video.rating || video.tmdb_rating;
        if (rating && rating !== 'N/A') {
            elements.movieRating.textContent = typeof rating === 'number' ? `${rating.toFixed(1)} ★` : rating;
        } else {
            elements.movieRating.textContent = 'TV-MA';
        }
    }

    // Match percentage (fake Netflix-style)
    if (elements.movieMatch) {
        const matchPercent = Math.floor(85 + Math.random() * 14); // 85-98%
        elements.movieMatch.textContent = `${matchPercent}% Match`;
    }

    // Description
    if (elements.movieDescription) {
        const description = video.tmdb_description || video.description || 'No description available.';
        // Use innerHTML to render any HTML tags provided by the API (e.g. <p>, <br>)
        elements.movieDescription.innerHTML = description;
        if (elements.movieDescriptionMobile) elements.movieDescriptionMobile.innerHTML = description;
    }

    // Mobile Data Population
    if (elements.movieTitleMobile) elements.movieTitleMobile.textContent = video.title;
    if (elements.movieYearMobile) elements.movieYearMobile.textContent = video.year || '';
    if (elements.movieRatingMobile) {
        const rating = video.rating || video.tmdb_rating;
        elements.movieRatingMobile.textContent = (rating && rating !== 'N/A') ? (typeof rating === 'number' ? rating.toFixed(1) : rating) : 'TV-MA';
    }
    if (elements.movieDurationMobile) elements.movieDurationMobile.textContent = elements.movieDuration ? elements.movieDuration.textContent : (video.duration || '');
    if (elements.movieQualityMobile) elements.movieQualityMobile.textContent = video.quality || 'HD';
    if (elements.movieMatchMobile && elements.movieMatch) elements.movieMatchMobile.textContent = elements.movieMatch.textContent;

    // Genre Tags
    if (elements.movieTags) {
        const genres = video.genres || [];
        const director = video.director;
        const country = video.country;

        let tagsHTML = '';
        if (genres.length > 0) {
            tagsHTML += `<div><span class="text-white/50">Genres:</span> <span class="text-white">${genres.join(', ')}</span></div>`;
        }
        if (director && director !== 'Unknown') {
            tagsHTML += `<div><span class="text-white/50">Director:</span> <span class="text-white">${director}</span></div>`;
        }
        if (country && country !== 'Unknown') {
            tagsHTML += `<div><span class="text-white/50">Country:</span> <span class="text-white">${country}</span></div>`;
        }

        elements.movieTags.innerHTML = tagsHTML;
    }

    // Update page title
    document.title = `${video.title} - StreamFlix`;

    // Update Add to List button state
    if (window.historyService && video.slug) {
        updateAddListUI(window.historyService.isFavorite(video.slug));
    }

    // Render episodes
    renderEpisodes(video);

    // Render cast
    if (video.tmdb_cast && video.tmdb_cast.length > 0) {
        renderCast(video.tmdb_cast, true);
    } else if (video.cast && video.cast.length > 0) {
        renderCast(video.cast, false);
    }

    // Render additional details
    renderDetails(video);
}

/**
 * Render episodes grid (StreamFlix Tailwind Design)
 */
function renderEpisodes(video) {
    if (!elements.episodesPanel) return;

    // Get episodes from the API response format
    let episodes = [];
    if (Array.isArray(video.episodes) && video.episodes.length > 0) {
        if (video.episodes[0].server_data) {
            episodes = video.episodes[0].server_data;
        } else {
            episodes = video.episodes;
        }
    }

    // Hide episodes section for single-episode movies
    if (episodes.length <= 1) {
        if (elements.seasonSelectContainer) elements.seasonSelectContainer.style.display = 'none';
        if (elements.episodesLoading) elements.episodesLoading.style.display = 'none';

        // Show "Play Movie" message instead
        if (elements.episodesGrid) {
            elements.episodesGrid.innerHTML = `
                <div class="flex items-center gap-4 p-4 bg-surface-dark rounded-lg border border-white/5">
                    <span class="material-symbols-outlined text-3xl text-primary">play_circle</span>
                    <div>
                        <p class="text-white font-medium">Full Movie</p>
                        <p class="text-gray-400 text-sm">Click Play to watch</p>
                    </div>
                </div>
            `;
        }
        return;
    }

    // Update episode count
    if (elements.episodeCount) elements.episodeCount.textContent = `${episodes.length} Episodes`;
    if (elements.episodesLoading) elements.episodesLoading.style.display = 'none';

    // Render episode cards
    if (elements.episodesGrid) {
        const INITIAL_LIMIT = 10;
        const totalEp = episodes.length;
        const showAll = totalEp <= (INITIAL_LIMIT + 5); // If only a few more, just show all

        const renderBatch = (limit) => {
            elements.episodesGrid.innerHTML = episodes.slice(0, limit).map((ep, index) => {
                const epNumber = index + 1;
                const isActive = epNumber === state.currentEpisode;
                const epName = ep.name || `Episode ${epNumber}`;
                const epTitle = ep.title || ep.filename || '';

                return `
                    <div class="flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors hover:bg-surface-dark border border-transparent hover:border-white/10 ${isActive ? 'bg-surface-dark border-primary/40' : ''}" onclick="window.selectEpisode(${epNumber})">
                        <div class="flex-none text-2xl font-bold text-gray-500 w-8 text-center">${epNumber}</div>
                        <div class="flex-1">
                            <h4 class="text-white font-medium ${isActive ? 'text-primary' : ''}">${epName}</h4>
                            ${epTitle ? `<p class="text-gray-400 text-sm mt-1 line-clamp-2">${epTitle}</p>` : ''}
                        </div>
                        ${isActive ? '<span class="material-symbols-outlined text-primary">play_circle</span>' : ''}
                    </div>
                `;
            }).join('');

            if (limit < totalEp) {
                const seeMoreBtn = document.createElement('button');
                seeMoreBtn.className = 'w-full py-4 text-gray-400 hover:text-white font-medium flex items-center justify-center gap-2 border-t border-white/5 mt-2 transition-colors';
                seeMoreBtn.innerHTML = `
                    <span>See more episodes (${totalEp - limit} remaining)</span>
                    <span class="material-symbols-outlined">expand_more</span>
                `;
                seeMoreBtn.onclick = () => renderBatch(totalEp);
                elements.episodesGrid.appendChild(seeMoreBtn);
            }
        };

        renderBatch(showAll ? totalEp : INITIAL_LIMIT);
    }
}

/**
 * Render additional details (About section)
 */
function renderDetails(video) {
    if (!elements.detailsList) return;

    const details = [];

    if (video.original_title) details.push({ label: 'Original Title', value: video.original_title });
    if (video.director && video.director !== 'Unknown') details.push({ label: 'Director', value: video.director });
    if (video.country && video.country !== 'Unknown') details.push({ label: 'Country', value: video.country });
    if (video.year) details.push({ label: 'Release Year', value: video.year });
    if (video.quality) details.push({ label: 'Quality', value: video.quality });
    if (video.duration) details.push({ label: 'Duration', value: video.duration });
    if (video.genres && video.genres.length > 0) details.push({ label: 'Genres', value: video.genres.join(', ') });

    // Clear existing
    elements.detailsList.innerHTML = '';

    details.forEach(d => {
        const row = document.createElement('div');
        row.className = 'flex gap-4';

        const label = document.createElement('span');
        label.className = 'text-white/50 min-w-[100px] font-medium';
        label.textContent = `${d.label}:`;

        const value = document.createElement('span');
        value.className = 'text-white font-medium';
        value.textContent = d.value;

        row.appendChild(label);
        row.appendChild(value);
        elements.detailsList.appendChild(row);
    });
}

// Global scope for onclick
window.selectEpisode = (episodeNumber) => {
    state.currentEpisode = episodeNumber;

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('ep', episodeNumber);
    window.history.replaceState({}, '', url);

    // Re-render to update active state
    renderEpisodes(state.video);

    // Play
    playCurrentEpisode();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Play current episode
 */
async function playCurrentEpisode() {
    if (!state.video) return;

    if (elements.playerLoading) elements.playerLoading.style.display = 'flex';

    try {
        let streamUrl = null;
        let poster = state.video.thumbnail;

        // Get episodes from the API response format (ophim format has server_data)
        let episodes = [];
        if (Array.isArray(state.video.episodes) && state.video.episodes.length > 0) {
            if (state.video.episodes[0].server_data) {
                episodes = state.video.episodes[0].server_data;
            } else {
                episodes = state.video.episodes;
            }
        }

        const currentEp = episodes[state.currentEpisode - 1];

        // Save to history
        if (window.historyService) {
            window.historyService.addToHistory(state.video, {
                episode: state.currentEpisode,
                timestamp: Date.now()
            });
        }

        // Try to get stream URL from episode data (ophim provides direct links)
        if (currentEp) {
            // Prefer m3u8 for native playback, fallback to embed
            if (currentEp.link_m3u8) {
                streamUrl = currentEp.link_m3u8;
            } else if (currentEp.link_embed) {
                streamUrl = currentEp.link_embed;
            }
        }

        // If still no stream, try getting it via the getRophimStream method
        if (!streamUrl && state.video.slug) {
            try {
                const streamData = await api.getRophimStream(state.video.slug, state.currentEpisode);
                if (streamData?.stream_url) streamUrl = streamData.stream_url;
            } catch (e) {
                console.warn('Stream API fallback also failed', e);
            }
        }

        if (elements.playerLoading) elements.playerLoading.style.display = 'none';

        if (streamUrl) {
            renderPlayer(streamUrl, poster, state.video.title);
            const epLabel = episodes.length > 1 ? `Episode ${state.currentEpisode} ` : 'Movie';
            showToast(`Playing ${epLabel} `, 'success');
        } else {
            // Show watch externally option
            const episodeStr = state.currentEpisode === 1 ? 'full' : state.currentEpisode;
            const externalUrl = `https://phimmoichill.network/xem-phim/${state.video.slug}/tap-${episodeStr}-sv-0`;
            showExternalPlayerOption(externalUrl);
        }
    } catch (error) {
        console.error(error);
        showPlaybackError(error.message);
    }
}

function showExternalPlayerOption(externalUrl) {
    elements.videoPlayer.innerHTML = `
        <div style="display:flex;height:100%;align-items:center;justify-content:center;flex-direction:column;gap:20px;padding:40px;text-align:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64" style="color:#ff4d4d; opacity: 0.8;">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <h3 style="color:#fff;margin:0;font-size:1.5rem;">It cannot load</h3>
            <p style="color:#aaa;margin:0;max-width:400px;opacity:0.7;">This stream is currently unavailable. Please try again later or choose another source.</p>
        </div>
    `;
}

/**
 * Render player
 */
function renderPlayer(streamUrl, poster, title) {
    // Check if embed (add simple check for common embed domains)
    const isEmbed = streamUrl.includes('embed') || !streamUrl.match(/\.(mp4|m3u8)$/i);

    if (isEmbed) {
        elements.videoPlayer.innerHTML = `
            <iframe src="${streamUrl}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
        `;
    } else {
        const art = initPlayer(elements.videoPlayer, {
            url: streamUrl,
            poster: poster,
            title: title + ` - Ep ${state.currentEpisode}`,
            autoplay: true
        });

        // Track progress
        if (art && window.historyService) {
            art.on('video:timeupdate', () => {
                const currentTime = art.currentTime;
                const duration = art.duration;
                if (currentTime > 0 && duration > 0) {
                    // Save every 5 seconds to avoid excessive writes
                    if (Math.floor(currentTime) % 5 === 0) {
                        window.historyService.addToHistory(state.video, {
                            currentTime,
                            duration,
                            percentage: (currentTime / duration) * 100,
                            episode: state.currentEpisode
                        });
                    }
                }
            });

            // Resume from last position if available
            const history = window.historyService.getHistory();
            const entry = history.find(item => item.slug === state.video.slug);
            if (entry && entry.progress && entry.progress.episode === state.currentEpisode) {
                if (entry.progress.currentTime > 0 && entry.progress.percentage < 95) {
                    art.once('video:canplay', () => {
                        art.currentTime = entry.progress.currentTime;
                    });
                }
            }
        }
    }
}

function showPlaybackError(msg) {
    elements.videoPlayer.innerHTML = `
        <div class="video-theater__loading">
            <p>Error loading video: ${msg}</p>
            <button class="action-btn action-btn--primary" onclick="location.reload()">Retry</button>
        </div>
    `;
}

/**
 * Render Cast (StreamFlix Tailwind Design - circular avatars)
 */
function renderCast(cast, isTMDB = false) {
    if (!elements.castCarousel) return;

    const displayCast = cast.slice(0, 10);

    if (isTMDB) {
        elements.castCarousel.innerHTML = displayCast.map(person => {
            const hasPhoto = person.profile_photo && !person.profile_photo.includes('ui-avatars.com');
            const photoUrl = person.profile_photo || '';
            const searchUrl = `/?search=${encodeURIComponent(person.name)}`;
            const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            return `
                <a href="${searchUrl}" class="flex-none w-28 group text-center snap-start">
                    <div class="size-20 mx-auto rounded-full overflow-hidden bg-surface-dark border-2 border-transparent group-hover:border-primary transition-all">
                        ${hasPhoto
                    ? `<img src="${photoUrl}" alt="${person.name}" class="w-full h-full object-cover" loading="lazy">`
                    : `<div class="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">${initials}</div>`
                }
                    </div>
                    <p class="text-white text-sm font-medium mt-2 truncate group-hover:text-primary transition-colors">${person.name}</p>
                    <p class="text-gray-400 text-xs truncate">${person.character || 'Actor'}</p>
                </a>
            `;
        }).join('');
    } else {
        elements.castCarousel.innerHTML = displayCast.map(actor => {
            const searchUrl = `/?search=${encodeURIComponent(actor)}`;
            const initials = actor.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

            return `
                <a href="${searchUrl}" class="flex-none w-28 group text-center snap-start">
                    <div class="size-20 mx-auto rounded-full overflow-hidden bg-surface-dark border-2 border-transparent group-hover:border-primary transition-all flex items-center justify-center">
                        <span class="text-2xl font-bold text-gray-400">${initials}</span>
                    </div>
                    <p class="text-white text-sm font-medium mt-2 truncate group-hover:text-primary transition-colors">${actor}</p>
                    <p class="text-gray-400 text-xs truncate">Actor</p>
                </a>
            `;
        }).join('');
    }
}

/**
 * Load Recommendations (StreamFlix Tailwind Design)
 */
/**
 * Load Recommendations (Expanded: Genre, Country, Year)
 */
async function loadRecommendations() {
    const container = elements.recommendationsContainer;
    if (!container) return;

    try {
        container.innerHTML = '<div class="flex justify-center py-12"><div class="loading-spinner"></div></div>';

        const video = state.video;
        if (!video) return;

        const currentSlug = video.slug;
        const usedSlugs = new Set([currentSlug]);

        // 1. Prepare Categories
        const genres = video.category ? Object.values(video.category) : (video.genres || []);
        const countries = video.country ? Object.values(video.country) : (video.countries || []);
        const year = video.year;

        const requests = [];

        // Category 1: Similar (Genre)
        if (genres.length > 0) {
            let genreSlug = '';
            // Handle both object {id: name} and string array
            if (typeof genres[0] === 'object' && genres[0].slug) {
                genreSlug = genres[0].slug;
            } else if (typeof genres[0] === 'string') {
                genreSlug = genres[0].toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd').replace(/\s+/g, '-');
            }

            // Adjust slug logic if needed based on API
            // For RoPhim it's often 'the-loai/<slug>'
            if (genreSlug) {
                requests.push(
                    api.getRophimCatalog({ page: 1, limit: 24, category: `the-loai/${genreSlug}` })
                        .then(res => ({ title: "More Like This", movies: res.movies || [] }))
                        .catch(() => null)
                );
            }
        }

        // Category 2: Same Country
        if (countries.length > 0) {
            let countrySlug = '';
            if (typeof countries[0] === 'object' && countries[0].slug) {
                countrySlug = countries[0].slug;
            } else if (typeof countries[0] === 'string') {
                countrySlug = countries[0].toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd').replace(/\s+/g, '-');
            }

            if (countrySlug) {
                requests.push(
                    api.getRophimCatalog({ page: 1, limit: 24, category: `quoc-gia/${countrySlug}` })
                        .then(res => ({ title: `Movies from ${countries[0].name || countries[0]}`, movies: res.movies || [] }))
                        .catch(() => null)
                );
            }
        }

        // Category 3: Same Year
        if (year) {
            requests.push(
                api.getRophimCatalog({ page: 1, limit: 24, category: `nam-phat-hanh/${year}` })
                    .then(res => ({ title: `Released in ${year}`, movies: res.movies || [] }))
                    .catch(() => null)
            );
        }

        // Execute all requests
        const results = await Promise.all(requests);

        container.innerHTML = ''; // Clear loading

        const renderedTitles = new Set();
        let hasContent = false;

        results.forEach(section => {
            if (!section || !section.movies || section.movies.length === 0) return;

            // Deduplicate Titles (Prevent multiple 'More Like This')
            if (section.title && renderedTitles.has(section.title)) return;
            if (section.title) renderedTitles.add(section.title);

            // Filter duplicates
            const uniqueMovies = section.movies.filter(m => !usedSlugs.has(m.slug));
            uniqueMovies.forEach(m => usedSlugs.add(m.slug));

            if (uniqueMovies.length === 0) return;

            hasContent = true;

            const sectionHtml = `
                <div class="space-y-4">
                    ${section.title ? `<h4 class="text-md font-bold text-gray-300 pl-4 md:pl-0 border-l-2 border-primary md:border-none md:pl-0 leading-none h-5 flex items-center md:block">${section.title}</h4>` : ''}
                    <div class="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        ${uniqueMovies.map(v => createCardHtml(v)).join('')}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', sectionHtml);
        });

        if (!hasContent) {
            container.innerHTML = '<p class="text-gray-400 text-center py-8">No specific recommendations found.</p>';
        }

    } catch (error) {
        console.error('Failed to load recommendations:', error);
        container.innerHTML = '<p class="text-gray-400 text-center py-8">Failed to load recommendations</p>';
    }
}

/**
 * Helper to create card HTML (Smaller for Recommendations)
 */
function createCardHtml(v) {
    const poster = v.poster_url || v.thumbnail || v.thumb_url || '';
    const title = v.name || v.title || 'Untitled';
    const year = v.year || '';
    const quality = v.quality || 'HD';
    const match = v.matchScore || Math.floor(Math.random() * (99 - 85 + 1) + 85);
    const tmdb = v.tmdb_rating || 0;
    const rtScore = Math.round(tmdb * 10);
    const slug = v.slug || v.id || '';

    // Smaller card dimensions for "More Like This"
    return `
        <div class="flex-none w-full cursor-pointer group relative transition-all duration-300 hover:z-30 hover:scale-105" onclick="window.location.href='/watch.html?id=${slug}'">
            <div class="relative aspect-[2/3] rounded-md overflow-hidden bg-surface-dark shadow-sm group-hover:shadow-lg ring-0 group-hover:ring-2 group-hover:ring-white/20">
                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('${poster}');"></div>
                
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <!-- Badges -->
                <div class="absolute top-2 left-2 flex flex-col gap-1 z-20">
                     ${year == new Date().getFullYear() ? `<span class="bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">NEW</span>` : ''}
                     <span class="bg-black/60 backdrop-blur-md text-white text-[8px] font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase">${quality.replace('FHD', 'HD')}</span>
                </div>

                <!-- Content Overlay -->
                <div class="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 pointer-events-none">
                    <div class="flex items-center gap-1 mb-1 pointer-events-auto">
                        <button class="bg-white text-black size-6 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                            <span class="material-symbols-outlined text-[16px]">play_arrow</span>
                        </button>
                        <button class="bg-black/60 border border-gray-400 text-white size-6 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-transform">
                            <span class="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    </div>
                    
                    <h3 class="text-xs font-bold text-white line-clamp-1 mb-0.5 drop-shadow-md">${title}</h3>
                    <div class="flex items-center gap-1.5 text-[9px] text-gray-300 font-medium">
                        <span class="text-[#46d369] font-bold">${match}% Match</span>
                        <div class="flex items-center gap-1">
                            <span class="bg-[#FA320A] text-white px-1 rounded flex items-center gap-0.5 h-3">
                                <span class="material-symbols-outlined text-[8px]">local_pizza</span> ${rtScore}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}



function showError(msg) {
    document.body.innerHTML = `
        <div class="min-h-screen flex flex-col items-center justify-center text-white gap-6 p-4">
            <span class="material-symbols-outlined text-6xl text-primary">error</span>
            <h1 class="text-2xl font-bold">${msg}</h1>
            <a href="/" class="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition-colors">Go Home</a>
        </div>
    `;
}

// Init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
