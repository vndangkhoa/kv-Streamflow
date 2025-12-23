
import { api } from './api.js';

// DOM Elements
const elements = {
    poster: document.getElementById('poster'),
    backdrop: document.getElementById('backdrop'),
    title: document.getElementById('title'),
    originalTitle: document.getElementById('originalTitle'),
    rating: document.getElementById('rating'),
    status: document.getElementById('status'),
    year: document.getElementById('year'),
    episodes: document.getElementById('episodes'),
    country: document.getElementById('country'),
    genre: document.getElementById('genre'),
    director: document.getElementById('director'),
    cast: document.getElementById('cast'),
    description: document.getElementById('description'),
    btnWatch: document.getElementById('btnWatch'),
    tags: document.getElementById('tags'),
    recommendations: document.getElementById('recommendations')
};

async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const slug = params.get('slug');

    if (!id && !slug) {
        window.location.href = '/';
        return;
    }

    try {
        const movieSlug = slug || id;
        const data = await api.getRophimMovie(movieSlug);

        if (data) {
            renderInfo(data.movie || data, data.episodes || []);
            loadRecommendations();
        }
    } catch (e) {
        console.error('Error loading info:', e);
        // Fallback or error state
    }
}

function renderInfo(movie, episodes) {
    document.title = `${movie.name || movie.title} - KV-Stream`;

    // Images
    const posterUrl = movie.poster_url || movie.thumb_url || movie.thumbnail || 'https://via.placeholder.com/300x450?text=No+Poster';
    const backdropUrl = movie.backdrop_url || posterUrl;

    if (elements.poster) {
        elements.poster.src = posterUrl;
        elements.poster.onerror = () => { elements.poster.src = 'https://via.placeholder.com/300x450?text=No+Poster'; };
    }
    if (elements.backdrop) elements.backdrop.style.backgroundImage = `url('${backdropUrl}')`;

    // Titles
    if (elements.title) elements.title.textContent = movie.name || movie.title;
    if (elements.originalTitle) elements.originalTitle.textContent = movie.origin_name || movie.original_title || '';

    // Metadata
    if (elements.status) {
        // Infer status
        let status = 'Đang chiếu'; // Default
        if (movie.status === 'completed' || (episodes.length > 0 && movie.episode_current === 'Full')) status = 'Hoàn tất';
        elements.status.innerHTML = `<span style="background:#2ecc71; padding:2px 8px; border-radius:4px; font-size:0.9em; color:#000; font-weight:bold;">${status}</span>`;
    }

    if (elements.year) elements.year.textContent = movie.year || 'N/A';

    // Episodes Count
    if (elements.episodes) {
        const epCount = episodes[0]?.server_data?.length || 1;
        const currentEp = movie.episode_current || epCount;
        const totalEp = movie.episode_total || '?';
        elements.episodes.textContent = `${epCount}`;
    }

    // Country
    if (elements.country) {
        const countries = Array.isArray(movie.country) ? movie.country.map(c => c.name) : [movie.country];
        elements.country.textContent = countries.filter(Boolean).join(', ') || 'Đang cập nhật';
    }

    // Genre
    if (elements.genre) {
        const genres = Array.isArray(movie.category) ? movie.category.map(c => c.name) : (movie.genre ? movie.genre.split(',') : []);
        elements.genre.textContent = genres.map(g => g.trim()).join(', ') || 'Đang cập nhật';
    }

    // Director
    if (elements.director) {
        const director = Array.isArray(movie.director) ? movie.director.join(', ') : movie.director;
        elements.director.textContent = director || 'Đang cập nhật';
    }

    // Cast
    if (elements.cast) {
        const cast = Array.isArray(movie.actor) ? movie.actor.join(', ') : (movie.cast ? (Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast) : '');
        elements.cast.textContent = cast || 'Đang cập nhật';
    }

    // Description
    if (elements.description) {
        elements.description.innerHTML = movie.content || movie.description || 'Chưa có mô tả.';
    }

    // Watch Link
    if (elements.btnWatch) {
        elements.btnWatch.href = `/watch.html?id=${movie.slug}&slug=${movie.slug}`;
    }

    // Tags (Keywords)
    if (elements.tags) {
        // Just use Title and English title as tags for now
        const tags = [movie.name, movie.origin_name].filter(Boolean);
        elements.tags.innerHTML = tags.map(t =>
            `<a href="#" class="action-btn action-btn--glass" style="font-size:0.8rem; padding:4px 12px;">${t}</a>`
        ).join('');
    }
}

async function loadRecommendations() {
    if (!elements.recommendations) return;
    try {
        const res = await api.getRophimCatalog({ page: 1, limit: 24 });
        const recs = res.movies || [];

        elements.recommendations.innerHTML = recs.map(v => `
            <a href="/info.html?id=${v.slug}&slug=${v.slug}" class="rec-card">
                <img src="${v.thumbnail}" class="rec-img" loading="lazy">
                <div style="font-weight:600; font-size:0.9rem; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${v.title}</div>
                <div style="font-size:0.8rem; color:#aaa;">${v.year || ''}</div>
            </a>
        `).join('');
    } catch (e) {
        console.warn('Failed to load recs', e);
    }
}

init();
