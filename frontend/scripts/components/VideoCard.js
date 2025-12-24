import { api } from '../api.js';
import { imageCache } from '../services/imageCache.js';

/**
 * Detect if movie is newly released (within last 30 days or current year)
 */
function isNewRelease(video) {
    const currentYear = new Date().getFullYear();
    // Check if released this year
    if (video.year === currentYear) return true;

    // Check quality badge for "Mới" or "New" indicators
    const quality = (video.quality || '').toLowerCase();
    if (quality.includes('mới') || quality.includes('new')) return true;

    // Check if movie was recently added (within 7 days)
    if (video.modified?.time) {
        const modifiedDate = new Date(video.modified.time);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (modifiedDate > sevenDaysAgo) return true;
    }

    return false;
}

/**
 * Detect movie type based on episode count and quality
 */
function getMovieType(video) {
    const quality = (video.quality || '').toLowerCase();
    const episodeCount = video.episodes?.length || 0;
    const category = (video.category || video.type || '').toLowerCase();

    // Check for trailer
    if (quality.includes('trailer') || category.includes('trailer')) {
        return 'trailer';
    }

    // Check for series (has episodes or is marked as series)
    if (episodeCount > 1 || category.includes('series') || category.includes('phim-bo') ||
        quality.includes('tập') || quality.includes('ep')) {
        return 'series';
    }

    // Check for animation
    if (category.includes('hoathinh') || category.includes('animation') || category.includes('anime')) {
        return 'animation';
    }

    // Default to full movie
    return 'movie';
}

/**
 * Get episode count text
 */
function getEpisodeText(video) {
    const quality = video.quality || '';
    // Check if quality contains episode info like "Tập 12" or "12/24"
    const epMatch = quality.match(/(?:tập\s*)?(\d+)(?:\s*\/\s*(\d+))?/i);
    if (epMatch) {
        return quality; // Return as-is, it already contains episode info
    }

    const episodeCount = video.episodes?.length || 0;
    if (episodeCount > 1) {
        return `${episodeCount} Tập`;
    }
    return null;
}

/**
 * Create a video card element - PhimMoi Style
 * @param {Object} video - Video data
 * @param {function} onPlay - Callback when play is clicked
 * @param {function} onInfo - Callback when more info is clicked
 * @returns {HTMLElement} Video card element
 */
export function createVideoCard(video, onPlay, onInfo) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.dataset.videoId = video.id;

    // PERFORMANCE: Use backend image proxy for faster loading (WebP + Resized)
    // Use optimized sizes for mobile/desktop balance (quality vs speed)
    const isMobile = window.innerWidth < 768;
    const imageWidth = isMobile ? 180 : 200;
    const originalThumbnail = video.thumbnail || '';
    const thumbnail = api.getProxyUrl(originalThumbnail, imageWidth);
    const year = video.year || new Date().getFullYear();

    // Smart badge detection
    const isNew = isNewRelease(video);
    const movieType = getMovieType(video);
    const episodeText = getEpisodeText(video);

    // Quality badge (HD, FHD, 4K, CAM, etc.)
    let qualityBadge = video.quality || 'HD';
    // Clean up quality text - remove episode info if it exists
    qualityBadge = qualityBadge.replace(/(?:tập\s*)?\d+(?:\s*\/\s*\d+)?/gi, '').trim() || 'HD';
    if (qualityBadge.length > 6) qualityBadge = 'HD'; // Fallback if too long

    // Numeric rating badge
    const rating = parseFloat(video.rating || 0);
    const isFresh = rating >= 7.0;
    const ratingPercent = Math.round(rating * 10);

    let numericRatingHTML = '';
    if (rating > 0) {
        numericRatingHTML = `
            <div class="numeric-rating">
                <span class="numeric-rating__score">${rating.toFixed(1)}</span>
            </div>
        `;
    }

    // Build rating badge HTML (Rotten Tomatoes style)
    let tomatoBadgeHTML = '';
    if (rating > 0) {
        const tomatoIcon = isFresh ? '🍅' : '🥀';
        tomatoBadgeHTML = `
            <div class="tomato-badge ${isFresh ? 'tomato-badge--fresh' : 'tomato-badge--rotten'}">
                <span class="tomato-badge__icon">${tomatoIcon}</span>
                <span class="tomato-badge__score">${ratingPercent}%</span>
            </div>
        `;
    }

    // Placeholder for loading state
    const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"%3E%3Crect width="300" height="450" fill="%2314141c"/%3E%3C/svg%3E';

    // Build tags HTML
    let tagsHTML = '';

    // NEW tag (top left)
    if (isNew) {
        tagsHTML += `<span class="video-tag video-tag--new">MỚI</span>`;
    }

    // Type tag (SERIES / PHIM LẺ)
    if (movieType === 'trailer') {
        tagsHTML += `<span class="video-tag video-tag--trailer">TRAILER</span>`;
    } else if (movieType === 'series') {
        tagsHTML += `<span class="video-tag video-tag--series">PHIM BỘ</span>`;
    } else if (movieType === 'animation') {
        tagsHTML += `<span class="video-tag video-tag--animation">HOẠT HÌNH</span>`;
    }

    card.innerHTML = `
        <div class="video-card__container">
            <div class="video-card__poster">
                <img src="${placeholderSvg}" data-src="${thumbnail}" alt="${escapeHtml(video.title)}" loading="lazy" referrerpolicy="no-referrer" class="video-card__img" onerror="this.onerror=null;this.src='https://placehold.co/400x600/14141c/e5c07b?text=Movie'">
                
                <!-- Top Left Tags -->
                <div class="video-tags">
                    ${tagsHTML}
                </div>
                
                <!-- Bottom Right Info (Ratings & Quality) -->
                <div class="card-meta-bottom-right">
                    ${tomatoBadgeHTML}
                    ${numericRatingHTML}
                    <span class="poster-badge">${qualityBadge}</span>
                </div>
                
                <!-- Bottom Left Info (Year & Episodes) -->
                <div class="card-meta-bottom-left">
                    <span class="year-badge">${year}</span>
                    ${episodeText ? `<span class="episode-badge">${episodeText}</span>` : ''}
                </div>
                
                <!-- Watch Progress Bar -->
                ${video.progress && video.progress.percentage > 0 ? `
                <div class="video-card__progress">
                    <div class="video-card__progress-fill" style="width: ${video.progress.percentage}%"></div>
                </div>
                ` : ''}
                
                <!-- Play overlay on hover -->
                <div class="video-card__overlay">
                    <button class="video-card__play-btn" data-action="play" aria-label="Play">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Movie Title -->
        <div class="video-card__title">
            <span class="video-card__name">${escapeHtml(video.title)}</span>
        </div>
    `;

    // Lazy load image from cache when visible
    const img = card.querySelector('.video-card__img');
    if (img && thumbnail) {
        // Use IntersectionObserver for lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Load from cache
                    imageCache.getCachedImage(thumbnail).then(cachedUrl => {
                        img.src = cachedUrl;
                        img.classList.add('loaded');
                    }).catch(() => {
                        // Fallback to direct load
                        img.src = thumbnail;
                        img.onload = () => img.classList.add('loaded');
                        img.onerror = () => img.classList.add('loaded'); // Show placeholder if fails
                    });
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '800px', // Start loading 800px before visible
            threshold: 0
        });
        observer.observe(img);
    }

    // Event Listeners
    card.querySelector('[data-action="play"]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        onPlay?.(video);
    });

    // Default click behavior - play on any click
    card.addEventListener('click', () => {
        onPlay?.(video);
    });

    return card;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
