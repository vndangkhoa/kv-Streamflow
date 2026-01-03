import { api } from '../api.js';

/**
 * Netflix 2025 "New & Hot" Feed Component
 * Optimized for mobile vertical scrolling
 */
export function createNewAndHotItem(video) {
    const item = document.createElement('div');
    item.className = 'new-hot-item';

    // Random date for demo
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[Math.floor(Math.random() * 12)];
    const day = Math.floor(Math.random() * 28) + 1;

    // Use image proxy for performance (width 400 for better quality on larger cards)
    const imgUrl = api.getProxyUrl(video.backdrop || video.thumbnail, 400);

    item.innerHTML = `
        <div class="new-hot-item__sidebar">
            <span class="new-hot-item__month">${month}</span>
            <span class="new-hot-item__day">${day}</span>
        </div>
        <div class="new-hot-item__content">
            <div class="new-hot-item__card">
                <div class="new-hot-item__img-wrapper">
                    <img src="${imgUrl}" alt="${video.title}">
                    <div class="new-hot-item__play">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>
                <div class="new-hot-item__details">
                    <div class="new-hot-item__header">
                        <h2 class="new-hot-item__title">${video.title}</h2>
                        <div class="new-hot-item__actions">
                            <button class="new-hot-item__btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24"><path d="M15 10l5 5-5 5M4 4v7a4 4 0 0 0 4 4h12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                <span>Remind Me</span>
                            </button>
                            <button class="new-hot-item__btn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24"><path d="M12 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" stroke-width="1"/></svg>
                                <span>Info</span>
                            </button>
                        </div>
                    </div>
                    <p class="new-hot-item__desc">${video.description || 'Watch now on Netflix.'}</p>
                    <div class="new-hot-item__tags">
                        ${(video.genres || ['Exciting', 'Action', 'Netflix Original']).map(t => `<span class="new-hot-item__tag">${t}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;

    return item;
}

export function renderNewAndHotView(container, videos) {
    container.innerHTML = `
        <div class="new-hot-view">
            <div class="new-hot-header">
                <div class="new-hot-tabs">
                    <button class="new-hot-tab active">🍿 Coming Soon</button>
                    <button class="new-hot-tab">🔥 Everyone's Watching</button>
                </div>
            </div>
            <div class="new-hot-feed">
                <!-- Items will be injected here -->
            </div>
        </div>
    `;

    const feed = container.querySelector('.new-hot-feed');
    videos.forEach(video => {
        feed.appendChild(createNewAndHotItem(video));
    });
}
