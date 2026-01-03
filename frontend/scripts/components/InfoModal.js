/**
 * Netflix 2025 Info Modal Component
 * Premium, cinematic modal with video preview and rich metadata
 */
import { hapticLight, hapticMedium } from '../haptics.js';

export function createInfoModal(video, onClose, onPlay, recommendations = []) {
    const modal = document.createElement('div');
    modal.className = 'modal modal--info active';
    modal.id = `modal-${video.id}`;

    const backdropUrl = video.backdrop || video.thumbnail;
    const isSeries = video.type === 'series' || video.category?.toLowerCase() === 'series';

    modal.innerHTML = `
        <div class="modal__backdrop"></div>
        <div class="modal__container">
            <button class="modal__close" aria-label="Close">
                <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            
            <div class="modal__header">
                <div class="modal__header-video">
                    <img src="${backdropUrl}" alt="${video.title}" class="modal__header-img">
                    ${video.preview_url ? `
                        <video class="modal__header-preview" muted playsinline loop>
                            <source src="${video.preview_url}" type="video/mp4">
                        </video>
                    ` : ''}
                </div>
                <div class="modal__header-vignette"></div>
                <div class="modal__header-content">
                    <h2 class="modal__title">${video.title}</h2>
                    <div class="modal__actions">
                        <button class="modal__btn modal__btn--primary" data-action="play">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M8 5v14l11-7z"/></svg>
                            <span>Play</span>
                        </button>
                        <button class="modal__btn modal__btn--round" data-action="add" title="Add to My List">
                            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" width="24" height="24"><path d="M12 5v14m-7-7h14" stroke-width="2" stroke-linecap="round"/></svg>
                        </button>
                        <button class="modal__btn modal__btn--round" data-action="like" title="I like this">
                            <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" width="24" height="24"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke-width="2" stroke-linecap="round"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <div class="modal__body">
                <div class="modal__info-grid">
                    <div class="modal__info-main">
                        <div class="modal__metadata">
                            <span class="modal__match">${video.matchScore || 95}% Match</span>
                            <span class="modal__year">${video.releaseYear || video.year || 2024}</span>
                            <span class="modal__age">${video.maturityRating || '13+'}</span>
                            <span class="modal__duration">${video.duration ? Math.floor(video.duration / 3600) + 'h ' + Math.floor((video.duration % 3600) / 60) + 'm' : '2h 15m'}</span>
                            <span class="modal__quality">${video.quality || 'HD'}</span>
                        </div>
                        <p class="modal__description">${video.description || 'No description available for this title.'}</p>
                    </div>
                    <div class="modal__info-side">
                        ${video.cast && video.cast.length && video.cast[0] !== 'Unknown' ? `
                            <div class="modal__tags">
                                <span class="modal__label">Cast:</span>
                                <span class="modal__value">${video.cast.join(', ')}</span>
                            </div>
                        ` : ''}
                        
                        <div class="modal__tags">
                            <span class="modal__label">Genres:</span>
                            <span class="modal__value">${video.genres ? video.genres.join(', ') : video.category || 'Movies'}</span>
                        </div>
                        
                        ${video.director && video.director !== 'Unknown' ? `
                            <div class="modal__tags">
                                <span class="modal__label">Director:</span>
                                <span class="modal__value">${video.director}</span>
                            </div>
                        ` : ''}
                        
                        ${video.country && video.country !== 'International' ? `
                            <div class="modal__tags">
                                <span class="modal__label">Country:</span>
                                <span class="modal__value">${video.country}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${isSeries && video.episodes && video.episodes.length > 0 ? `
                    <div class="modal__episodes">
                        <div class="modal__section-header">
                            <h3 class="modal__section-title">Episodes</h3>
                            <span class="modal__episode-count">${video.episodes.length} Episodes</span>
                        </div>
                        <div class="modal__episodes-list">
                            ${video.episodes.map(ep => `
                                <div class="episode-row" data-episode-url="${ep.url}">
                                    <div class="episode-row__number">${ep.number}</div>
                                    <div class="episode-row__img">
                                        <img src="${video.backdrop || video.thumbnail}" alt="Episode ${ep.number}">
                                        <div class="episode-row__play-icon">
                                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    </div>
                                    <div class="episode-row__info">
                                        <div class="episode-row__header">
                                            <span class="episode-row__title">${ep.title || `Episode ${ep.number}`}</span>
                                            <span class="episode-row__duration">${Math.floor(Math.random() * 20 + 40)}m</span>
                                        </div>
                                        <p class="episode-row__desc">${ep.description || (video.description || '').substring(0, 60)}...</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${recommendations.length > 0 ? `
                    <div class="modal__recommendations">
                        <h3 class="modal__section-title">More Like This</h3>
                        <div class="recommendations-grid">
                            ${recommendations.map(rec => `
                                <div class="recommendation-card" data-video-id="${rec.id}">
                                    <div class="recommendation-card__img-wrapper">
                                        <img src="${rec.thumbnail}" alt="${rec.title}">
                                        <div class="recommendation-card__play">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M8 5v14l11-7z"/></svg>
                                        </div>
                                    </div>
                                    <div class="recommendation-card__content">
                                        <h4 class="recommendation-card__title">${rec.title}</h4>
                                        <div class="recommendation-card__meta">
                                            <span class="modal__match">${rec.matchScore || 90}% Match</span>
                                            <span class="modal__age">${rec.maturityRating || '13+'}</span>
                                            <span class="modal__year">${rec.year || 2024}</span>
                                        </div>
                                        <p class="recommendation-card__desc">${(rec.description || 'No description').substring(0, 80)}${rec.description && rec.description.length > 80 ? '...' : ''}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    // Event Listeners
    modal.querySelector('.modal__close').addEventListener('click', () => {
        hapticLight();
        onClose(modal);
    });
    modal.querySelector('.modal__backdrop').addEventListener('click', () => {
        onClose(modal);
    });
    modal.querySelector('[data-action="play"]').addEventListener('click', () => {
        hapticMedium();
        onPlay(video);
    });

    // Autoplay header video
    const headerVideo = modal.querySelector('.modal__header-preview');
    const headerImg = modal.querySelector('.modal__header-img');
    if (headerVideo) {
        setTimeout(() => {
            headerVideo.play().then(() => {
                headerImg.style.opacity = '0';
                headerVideo.style.opacity = '1';
            }).catch(e => console.log('Autoplay failed', e));
        }, 1000);
    }

    // Recommendation card clicks
    modal.querySelectorAll('.recommendation-card').forEach(card => {
        card.addEventListener('click', () => {
            const vidId = card.dataset.videoId;
            const targetVid = recommendations.find(r => r.id == vidId);
            if (targetVid) {
                // In a real app, we might navigate or open another modal
                onPlay(targetVid);
            }
        });
    });

    // Episode row clicks
    modal.querySelectorAll('.episode-row').forEach(row => {
        row.addEventListener('click', () => {
            const url = row.dataset.episodeUrl;
            if (url) {
                // Create a temporary video object for the episode
                const episodeTitle = row.querySelector('.episode-row__title').textContent;
                const episodeVideo = {
                    ...video,
                    source_url: url,
                    title: `${video.title}: ${episodeTitle}`,
                    isEpisode: true
                };
                onPlay(episodeVideo);
            }
        });
    });

    return modal;
}
