/**
 * StreamFlow - Video Player Component
 * ArtPlayer.js integration with custom skin
 * Includes Screen Wake Lock API to prevent screen sleep during playback
 */

import Artplayer from 'artplayer';

// Player instance reference
let currentPlayer = null;

// Wake lock instance for preventing screen sleep
let wakeLock = null;

/**
 * Request screen wake lock to prevent display from sleeping
 */
async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake lock acquired');

            // Handle wake lock release (e.g., when tab loses visibility)
            wakeLock.addEventListener('release', () => {
                console.log('Wake lock released');
            });
        } catch (err) {
            console.log('Wake lock request failed:', err.message);
        }
    }
}

/**
 * Release screen wake lock
 */
async function releaseWakeLock() {
    if (wakeLock !== null) {
        try {
            await wakeLock.release();
            wakeLock = null;
            console.log('Wake lock released');
        } catch (err) {
            console.log('Wake lock release failed:', err.message);
        }
    }
}

/**
 * Handle visibility change to re-acquire wake lock when tab becomes visible
 */
function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && currentPlayer && !currentPlayer.paused) {
        requestWakeLock();
    }
}

// Register visibility change listener
document.addEventListener('visibilitychange', handleVisibilityChange);

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Initialize video player
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Player options
 * @returns {Artplayer} Player instance
 */
export function initPlayer(container, options = {}) {
    // Destroy existing player if any
    destroyPlayer();

    const {
        url,
        poster,
        title,
        autoplay = false,
        qualities = []
    } = options;

    // Build player config with enhanced buffering
    const playerConfig = {
        container,
        url,
        poster,
        title,
        volume: 0.7,
        autoplay,
        autoSize: false,
        autoMini: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        screenshot: true,
        setting: true,
        hotkey: true,
        pip: true,
        mutex: true,
        fullscreen: true,
        fullscreenWeb: true,
        miniProgressBar: true,
        playsInline: true,
        autoPlayback: true,
        theme: '#f5c518', // Golden-yellow accent
        lang: 'en',
        moreVideoAttr: {
            // crossOrigin: 'anonymous',
            preload: 'auto',
        },
        airplay: true,
        // HLS custom configuration for better buffering
        customType: {
            m3u8: function playM3u8(video, url, art) {
                // Check if Android - prefer native HLS to avoid CORS/hls.js issues
                const isAndroid = /Android/i.test(navigator.userAgent);

                if (isAndroid && video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                    return;
                }

                if (Hls.isSupported()) {
                    if (art.hls) {
                        art.hls.destroy();
                    }
                    const hls = new Hls({
                        // Buffer configuration for faster start
                        maxBufferLength: 30,             // Max buffer in seconds
                        maxMaxBufferLength: 60,          // Max buffer ceiling
                        maxBufferSize: 60 * 1000 * 1000, // Max buffer size (60MB)
                        maxBufferHole: 0.5,              // Max gap in buffer
                        lowLatencyMode: false,           // Disable low latency for stability
                        startLevel: -1,                  // Auto select quality
                        // Faster loading
                        enableWorker: true,
                        startFragPrefetch: true,         // Prefetch next fragment
                        testBandwidth: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    art.hls = hls;
                    art.on('destroy', () => hls.destroy());

                    // Handle HLS errors
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        if (data.fatal) {
                            switch (data.type) {
                                case Hls.ErrorTypes.NETWORK_ERROR:
                                    console.warn('HLS network error, trying to recover...');
                                    hls.startLoad();
                                    break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    console.warn('HLS media error, trying to recover...');
                                    hls.recoverMediaError();
                                    break;
                                default:
                                    console.error('Fatal HLS error');
                                    break;
                            }
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    // Native HLS support (Safari)
                    video.src = url;
                }
            }
        },
        settings: [
            {
                html: 'Speed',
                selector: [
                    { html: '0.5x', value: 0.5 },
                    { html: '0.75x', value: 0.75 },
                    { html: 'Normal', value: 1, default: true },
                    { html: '1.25x', value: 1.25 },
                    { html: '1.5x', value: 1.5 },
                    { html: '2x', value: 2 }
                ],
                onSelect(item) {
                    if (currentPlayer) {
                        currentPlayer.playbackRate = item.value;
                    }
                    return item.html;
                }
            }
        ],
        icons: {
            loading: `<div class="loading__spinner"></div>`,
            state: `<svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M8 5v14l11-7z"/></svg>`
        },
        cssVar: {
            '--art-theme': '#f5c518',
            '--art-background-color': '#0f0f0f',
            '--art-progress-color': '#f5c518',
            '--art-control-background-color': 'rgba(0, 0, 0, 0.8)',
            '--art-control-height': '48px',
            '--art-bottom-gap': '12px'
        }
    };

    // Only add quality if available (ArtPlayer requires array, not undefined)
    if (qualities.length > 0) {
        playerConfig.quality = qualities.map((q, i) => ({
            default: i === 0,
            html: q,
            url: url
        }));
    }

    // Initialize ArtPlayer
    currentPlayer = new Artplayer(playerConfig);

    // Event handling
    currentPlayer.on('ready', () => {
        console.log('Player ready');
        if (currentPlayer.video) {
            currentPlayer.video.preload = 'auto';
        }
    });

    currentPlayer.on('video:waiting', () => {
        console.log('Buffering...');
    });

    currentPlayer.on('video:canplay', () => {
        console.log('Can play');
    });

    currentPlayer.on('error', (error) => {
        console.error('Player error:', error);
    });

    // Wake lock events - keep screen on during playback
    currentPlayer.on('play', () => {
        requestWakeLock();
    });

    currentPlayer.on('pause', () => {
        releaseWakeLock();
    });

    return currentPlayer;
}

/**
 * Destroy current player instance
 */
export function destroyPlayer() {
    if (currentPlayer) {
        currentPlayer.destroy();
        currentPlayer = null;
    }
    // Release wake lock when player is destroyed
    releaseWakeLock();
}

/**
 * Get current player instance
 * @returns {Artplayer|null} Current player or null
 */
export function getPlayer() {
    return currentPlayer;
}

/**
 * Create a lazy-load placeholder with play button
 * @param {Object} options - Placeholder options
 * @returns {HTMLElement} Placeholder element
 */
export function createPlayerPlaceholder(options = {}) {
    const { poster, onClick } = options;

    const placeholder = document.createElement('div');
    placeholder.className = 'player-skeleton';

    if (poster) {
        placeholder.style.backgroundImage = `url(${poster})`;
        placeholder.style.backgroundSize = 'cover';
        placeholder.style.backgroundPosition = 'center';
    }

    placeholder.innerHTML = `
        <div class="player-skeleton__play">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
        </div>
    `;

    if (onClick) {
        placeholder.addEventListener('click', onClick);
    }

    return placeholder;
}
