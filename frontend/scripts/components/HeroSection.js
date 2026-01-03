/**
 * KV-Stream - Hero Billboard Component
 * Modern Apple TV+ / Netflix inspired hero section
 */

/**
 * Create a modern hero section with featured content
 * @param {Object|Array<Object>} featuredItems - Featured video object or array
 * @param {Function} onPlay - Callback when play is clicked
 * @param {Function} onInfo - Callback when more info is clicked
 * @param {string} modifier - Optional CSS class for variants
 * @returns {HTMLElement} Hero section element
 */
export function createHeroSection(featuredItems, onPlay, onInfo, modifier = '') {
    const hero = document.createElement('section');
    hero.className = `hero-billboard ${modifier}`;
    hero.id = 'heroSection';

    // Normalize input to array
    const items = Array.isArray(featuredItems) ? featuredItems : [featuredItems];

    if (items.length === 0 || !items[0]) {
        return hero;
    }

    // Get first featured item for display
    const featured = items[0];
    const backdropUrl = featured.backdrop || featured.thumbnail || featured.poster_url || '';
    const year = featured.year || new Date().getFullYear();
    const rating = featured.rating ? `${featured.rating}★` : '';
    const quality = featured.resolution || featured.quality || 'HD';
    const genre = featured.genre || featured.category || '';
    const duration = featured.duration || '';

    // Build meta items
    const metaItems = [quality, year, genre, duration, rating].filter(Boolean);

    hero.innerHTML = `
        <div class="hero-billboard__backdrop">
            <img src="${backdropUrl}" alt="${featured.title}" loading="eager" />
            <div class="hero-billboard__gradient"></div>
        </div>
        
        <div class="hero-billboard__content">
            <div class="hero-billboard__info">
                <h1 class="hero-billboard__title">${featured.title}</h1>
                
                <div class="hero-billboard__meta">
                    ${metaItems.map((item, i) => `
                        <span class="hero-billboard__meta-item">${item}</span>
                        ${i < metaItems.length - 1 ? '<span class="hero-billboard__meta-dot">•</span>' : ''}
                    `).join('')}
                </div>
                
                <p class="hero-billboard__description">${featured.description || ''}</p>
                
                <div class="hero-billboard__actions">
                    <button class="hero-billboard__btn hero-billboard__btn--primary" data-action="play" data-id="${featured.id}">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                        <span>Watch Now</span>
                    </button>
                    <button class="hero-billboard__btn hero-billboard__btn--secondary" data-action="info" data-id="${featured.id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 16v-4"></path>
                            <path d="M12 8h.01"></path>
                        </svg>
                        <span>More Info</span>
                    </button>
                </div>
            </div>
        </div>
        
        ${items.length > 1 ? createSliderDots(items) : ''}
    `;

    // Add styles
    addHeroStyles();

    // Setup slider if multiple items
    if (items.length > 1) {
        setupSlider(hero, items, onPlay, onInfo);
    } else {
        // Single item events
        setupSingleItemEvents(hero, featured, onPlay, onInfo);
    }

    return hero;
}

function createSliderDots(items) {
    return `
        <div class="hero-billboard__dots">
            ${items.map((_, i) => `
                <button class="hero-billboard__dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>
            `).join('')}
        </div>
    `;
}

function setupSingleItemEvents(hero, featured, onPlay, onInfo) {
    const playBtn = hero.querySelector('[data-action="play"]');
    const infoBtn = hero.querySelector('[data-action="info"]');

    if (playBtn) {
        playBtn.addEventListener('click', () => onPlay && onPlay(featured));
    }
    if (infoBtn) {
        infoBtn.addEventListener('click', () => onInfo && onInfo(featured));
    }
}

function setupSlider(hero, items, onPlay, onInfo) {
    let currentIndex = 0;
    let interval;
    const dots = hero.querySelectorAll('.hero-billboard__dot');

    const showSlide = (index) => {
        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;
        currentIndex = index;

        const featured = items[index];
        const backdropUrl = featured.backdrop || featured.thumbnail || featured.poster_url || '';

        // Update content
        const backdrop = hero.querySelector('.hero-billboard__backdrop img');
        const title = hero.querySelector('.hero-billboard__title');
        const description = hero.querySelector('.hero-billboard__description');
        const playBtn = hero.querySelector('[data-action="play"]');
        const infoBtn = hero.querySelector('[data-action="info"]');

        if (backdrop) backdrop.src = backdropUrl;
        if (title) title.textContent = featured.title;
        if (description) description.textContent = featured.description || '';
        if (playBtn) playBtn.dataset.id = featured.id;
        if (infoBtn) infoBtn.dataset.id = featured.id;

        // Update dots
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };

    const startAutoPlay = () => {
        if (interval) clearInterval(interval);
        interval = setInterval(() => showSlide(currentIndex + 1), 8000);
    };

    startAutoPlay();

    // Dot click events
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.dataset.index);
            showSlide(idx);
            startAutoPlay();
        });
    });

    // Button events
    hero.addEventListener('click', (e) => {
        const playBtn = e.target.closest('[data-action="play"]');
        const infoBtn = e.target.closest('[data-action="info"]');

        if (playBtn && onPlay) {
            onPlay(items[currentIndex]);
        } else if (infoBtn && onInfo) {
            onInfo(items[currentIndex]);
        }
    });
}

function addHeroStyles() {
    if (document.getElementById('hero-billboard-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'hero-billboard-styles';
    styles.textContent = `
        .hero-billboard {
            position: relative;
            width: 100%;
            /* Fluid height: scales with viewport, min 300px, max 85vh */
            height: clamp(300px, 60vh, 85vh);
            overflow: hidden;
            margin-bottom: clamp(10px, 2vw, 30px);
        }
        
        .hero-billboard__backdrop {
            position: absolute;
            inset: 0;
        }
        
        .hero-billboard__backdrop img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 20%;
        }
        
        .hero-billboard__gradient {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to right,
                rgba(0, 0, 0, 0.95) 0%,
                rgba(0, 0, 0, 0.7) 25%,
                rgba(0, 0, 0, 0.3) 50%,
                transparent 75%
            ),
            linear-gradient(
                to top,
                rgba(0, 0, 0, 1) 0%,
                rgba(0, 0, 0, 0.6) 15%,
                transparent 50%
            );
        }
        
        .hero-billboard__content {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            /* Fluid padding: scales with viewport */
            padding: 0 clamp(20px, 5vw, 80px);
        }
        
        .hero-billboard__info {
            /* Fluid max-width: scales between 280px and 600px based on viewport */
            max-width: clamp(280px, 40vw, 600px);
            z-index: 2;
        }
        
        .hero-billboard__title {
            /* Fluid font-size: scales dynamically with screen */
            font-size: clamp(1.5rem, 4vw, 3.5rem);
            font-weight: 700;
            color: #fff;
            margin: 0 0 clamp(8px, 1.5vw, 20px) 0;
            line-height: 1.15;
            text-shadow: 0 2px 10px rgba(0,0,0,0.6);
        }
        
        .hero-billboard__meta {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: clamp(4px, 0.8vw, 10px);
            margin-bottom: clamp(8px, 1.5vw, 20px);
        }
        
        .hero-billboard__meta-item {
            font-size: clamp(0.7rem, 1vw, 1rem);
            color: rgba(255,255,255,0.9);
            font-weight: 500;
        }
        
        .hero-billboard__meta-item:first-child {
            background: #0071e3;
            padding: clamp(2px, 0.4vw, 6px) clamp(6px, 0.8vw, 12px);
            border-radius: 4px;
            font-size: clamp(0.65rem, 0.9vw, 0.85rem);
            font-weight: 600;
        }
        
        .hero-billboard__meta-dot {
            color: rgba(255,255,255,0.5);
            font-size: clamp(0.6rem, 0.8vw, 0.85rem);
        }
        
        .hero-billboard__description {
            font-size: clamp(0.85rem, 1.1vw, 1.1rem);
            color: rgba(255,255,255,0.8);
            line-height: 1.5;
            margin: 0 0 clamp(12px, 2vw, 28px) 0;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        
        .hero-billboard__actions {
            display: flex;
            gap: clamp(8px, 1vw, 14px);
            flex-wrap: wrap;
        }
        
        .hero-billboard__btn {
            display: inline-flex;
            align-items: center;
            gap: clamp(6px, 0.6vw, 10px);
            padding: clamp(10px, 1.2vw, 16px) clamp(16px, 2vw, 32px);
            border: none;
            border-radius: clamp(6px, 0.6vw, 10px);
            font-size: clamp(0.85rem, 1vw, 1.1rem);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
        }
        
        .hero-billboard__btn--primary {
            background: #fff;
            color: #000;
        }
        
        .hero-billboard__btn--primary:hover {
            background: rgba(255,255,255,0.9);
            transform: scale(1.02);
        }
        
        .hero-billboard__btn--secondary {
            background: rgba(255,255,255,0.15);
            color: #fff;
            backdrop-filter: blur(10px);
        }
        
        .hero-billboard__btn--secondary:hover {
            background: rgba(255,255,255,0.25);
        }
        
        .hero-billboard__btn svg {
            flex-shrink: 0;
            width: clamp(18px, 1.5vw, 24px);
            height: clamp(18px, 1.5vw, 24px);
        }
        
        .hero-billboard__dots {
            position: absolute;
            bottom: clamp(15px, 3vh, 35px);
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: clamp(5px, 0.6vw, 10px);
            z-index: 10;
        }
        
        .hero-billboard__dot {
            width: clamp(6px, 0.6vw, 10px);
            height: clamp(6px, 0.6vw, 10px);
            border-radius: 50%;
            border: none;
            background: rgba(255,255,255,0.4);
            cursor: pointer;
            transition: all 0.3s ease;
            padding: 0;
        }
        
        .hero-billboard__dot.active {
            background: #fff;
            width: clamp(16px, 2vw, 28px);
            border-radius: 4px;
        }
        
        .hero-billboard__dot:hover {
            background: rgba(255,255,255,0.7);
        }
        
        /* Small variant for category pages */
        .hero-billboard.hero--small {
            height: clamp(200px, 35vh, 400px);
        }
        
        /* Mobile-specific adjustments (small screens need content at bottom) */
        @media (max-width: 600px) {
            .hero-billboard__content {
                align-items: flex-end;
                padding-bottom: clamp(50px, 10vh, 80px);
            }
            
            .hero-billboard__info {
                max-width: 100%;
            }
            
            .hero-billboard__description {
                -webkit-line-clamp: 2;
            }
            
            .hero-billboard__actions {
                width: 100%;
            }
            
            .hero-billboard__btn {
                flex: 1;
                justify-content: center;
            }
        }
    `;
    document.head.appendChild(styles);
}

export function initHeroCarousel(container, featuredVideos, onPlay, onInfo) {
    if (!featuredVideos || featuredVideos.length === 0) return;

    const hero = createHeroSection(featuredVideos, onPlay, onInfo);
    container.innerHTML = '';
    container.appendChild(hero);
}

