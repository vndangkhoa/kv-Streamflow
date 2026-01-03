/**
 * Category System for PhimMoiChill Themed Sections
 * Provides functionality to load and render categorized content
 */

/**
 * Load themed category sections from PhimMoiChill
 */
async function loadCategories() {
    try {
        console.log('📂 Loading themed categories...');
        const response = await fetch('/api/rophim/categories/all');
        const data = await response.json();

        if (data && data.categories) {
            console.log(`✓ Loaded ${Object.keys(data.categories).length} category sections`);
            return data.categories;
        }
        return null;
    } catch (error) {
        console.error('Error loading categories:', error);
        return null;
    }
}

/**
 * Create ranking badge for Top 10
 */
function createRankingBadge(rank) {
    const badge = document.createElement('div');
    badge.className = 'video-card__ranking';

    // Add specific class for top 3 (gold, silver, bronze)
    if (rank <= 3) {
        badge.classList.add(`video-card__ranking--${rank}`);
    }

    badge.textContent = `#${rank}`;
    return badge;
}

/**
 * Create quality/category badge (NEW, HOT, CINEMA, etc.)
 */
function createQualityBadge(badgeText) {
    if (!badgeText) return null;

    const badge = document.createElement('div');
    badge.className = 'video-card__badge';

    // Determine badge style based on text
    const text = badgeText.toUpperCase();
    if (text.includes('HOT')) {
        badge.classList.add('video-card__badge--hot');
    } else if (text.includes('NEW')) {
        badge.classList.add('video-card__badge--new');
    } else if (text.includes('CINEMA')) {
        badge.classList.add('video-card__badge--cinema');
    } else if (text.includes('FULL')) {
        badge.classList.add('video-card__badge--full');
    }

    badge.textContent = text;
    return badge;
}

/**
 * Enhance video card with badges
 */
function enhanceVideoCardWithBadges(card, video) {
    if (!card) return card;

    const container = card.querySelector('.video-card__container');
    if (!container) return card;

    // Add quality badge if present
    if (video.badge) {
        const badge = createQualityBadge(video.badge);
        if (badge) {
            container.appendChild(badge);
        }
    }

    // Add ranking badge if present (for Top 10)
    if (video.ranking) {
        const rankBadge = createRankingBadge(video.ranking);
        container.appendChild(rankBadge);
    }

    return card;
}

// Export functions for use in main.js
if (typeof window !== 'undefined') {
    window.categorySystem = {
        loadCategories,
        createRankingBadge,
        createQualityBadge,
        enhanceVideoCardWithBadges
    };
}
