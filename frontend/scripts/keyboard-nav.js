/**
 * TV-Style Keyboard Navigation
 * Handles Arrow keys to navigate horizontally through sliders and vertically between rows.
 * Optimized for Android TV D-pad remote control navigation.
 */

export class KeyboardNavigation {
    constructor() {
        this.currentFocus = null;
        this.isEnabled = false;
        this.isTVMode = this.detectTVMode();
        this.focusInitialized = false;

        // Selectors for focusable items (in priority order)
        this.selectors = [
            '.video-card',
            '.hero__btn',
            '.slider-btn',
            '#topSearchBtn',
            '.nav-item',
            '.nav-link',
            '.category-card',
            '.tab-btn',
            '.episode-row',
            '.recommendation-card',
            'button:not([disabled])',
            'a[href]'
        ];
    }

    /**
     * Detect if running on Android TV or similar leanback device
     * Uses multiple detection methods for reliability
     */
    detectTVMode() {
        const ua = navigator.userAgent.toLowerCase();

        // Check UA for known TV strings
        const tvPatterns = [
            'tv', 'aftm', 'aftt', 'aft', 'shield', 'googletv',
            'chromecast', 'firetv', 'bravia', 'philipstv', 'samsungtv',
            'lgtv', 'webos', 'tizen', 'vizio', 'roku', 'appletv'
        ];
        const isAndroid = ua.includes('android');
        const hasTV = tvPatterns.some(p => ua.includes(p));

        // Fallback: No fine pointer (mouse) likely means D-pad/remote
        const noMouse = window.matchMedia && !window.matchMedia('(pointer: fine)').matches;

        // Fallback: Large screen without touch is likely TV
        const isBigScreen = window.innerWidth >= 1280 && window.innerHeight >= 720;
        const noTouch = !('ontouchstart' in window);

        const detected = (isAndroid && hasTV) || (isAndroid && noMouse) || (isBigScreen && noTouch && noMouse);

        if (detected) {
            console.log('[KeyboardNav] TV Mode detected');
            document.body.classList.add('tv-mode');
        }

        return detected;
    }

    init() {
        this.isEnabled = true;
        document.addEventListener('keydown', this.handleKey.bind(this));

        // Only add mouse handler on non-TV devices
        if (!this.isTVMode) {
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        }

        // Add tabindex to all focusable elements for D-pad navigation
        this.ensureTabIndexes();

        // Auto-focus first card for TV mode (helps D-pad users start navigating)
        if (this.isTVMode) {
            this.waitForFocusableElement();
        }

        // Re-apply tabindex when DOM changes (e.g., new content loaded)
        this.observeDOM();
    }

    /**
     * Ensure all interactive elements have tabindex for focus
     */
    ensureTabIndexes() {
        const elements = document.querySelectorAll(this.selectors.join(','));
        elements.forEach(el => {
            if (!el.hasAttribute('tabindex')) {
                el.setAttribute('tabindex', '0');
            }
        });
    }

    /**
     * Observe DOM for new elements and add tabindex
     */
    observeDOM() {
        const observer = new MutationObserver((mutations) => {
            let needsUpdate = false;
            for (const mutation of mutations) {
                if (mutation.addedNodes.length > 0) {
                    needsUpdate = true;
                    break;
                }
            }
            if (needsUpdate) {
                // Debounce updates
                clearTimeout(this._tabindexTimeout);
                this._tabindexTimeout = setTimeout(() => {
                    this.ensureTabIndexes();
                    // Try to focus if not yet focused
                    if (this.isTVMode && !this.focusInitialized) {
                        this.focusFirstVisible();
                    }
                }, 100);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Wait for focusable elements to appear, then focus the first one
     */
    waitForFocusableElement() {
        const tryFocus = (attempt = 0) => {
            const candidates = document.querySelectorAll('.video-card');
            if (candidates.length > 0) {
                this.setFocus(candidates[0]);
                this.focusInitialized = true;
                console.log('[KeyboardNav] Initial focus set');
            } else if (attempt < 10) {
                // Retry with exponential backoff (100ms, 200ms, 400ms, ...)
                setTimeout(() => tryFocus(attempt + 1), 100 * Math.pow(2, attempt));
            }
        };

        // Initial delay to let page settle
        setTimeout(() => tryFocus(0), 300);
    }

    handleMouseMove() {
        // If mouse moves, likely user is using mouse.
        if (this.currentFocus) {
            this.currentFocus.blur();
            this.currentFocus.classList.remove('keyboard-focused');
            this.currentFocus = null;
        }
    }

    handleKey(e) {
        // Handle navigation keys
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault(); // Prevent default page scroll

            if (!this.currentFocus) {
                this.focusFirstVisible();
                return;
            }

            let nextTarget = null;

            switch (e.key) {
                case 'ArrowRight':
                    nextTarget = this.moveHorizontal(1);
                    break;
                case 'ArrowLeft':
                    nextTarget = this.moveHorizontal(-1);
                    break;
                case 'ArrowUp':
                    nextTarget = this.moveVertical(-1);
                    break;
                case 'ArrowDown':
                    nextTarget = this.moveVertical(1);
                    break;
            }

            if (nextTarget) {
                this.setFocus(nextTarget);
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            // Select/activate focused element
            if (this.currentFocus) {
                e.preventDefault();
                this.currentFocus.click();
            }
        } else if (e.key === 'Backspace' || e.key === 'Escape' || e.key === 'XF86Back') {
            // Back button handling for Android TV
            this.handleBack(e);
        }
    }

    /**
     * Handle back button for Android TV
     */
    handleBack(e) {
        // Check for open modals/overlays first
        const searchModal = document.getElementById('searchModal');
        const playerModal = document.getElementById('playerModal');
        const infoModal = document.querySelector('.info-modal.active, .info-modal:not(.hidden)');
        const videoPlayerContainer = document.getElementById('videoPlayerContainer');

        // Close modals in priority order
        if (searchModal?.classList.contains('active')) {
            e.preventDefault();
            searchModal.classList.remove('active');
            return;
        }

        if (infoModal) {
            e.preventDefault();
            infoModal.classList.add('hidden');
            infoModal.classList.remove('active');
            return;
        }

        if (videoPlayerContainer && !videoPlayerContainer.classList.contains('hidden')) {
            e.preventDefault();
            // Trigger close player - the page's own handler should catch this
            const closeBtn = document.getElementById('closePlayer') || document.getElementById('playerBackButton');
            if (closeBtn) closeBtn.click();
            return;
        }

        if (playerModal?.classList.contains('active')) {
            e.preventDefault();
            const closePlayerBtn = document.getElementById('closePlayer');
            if (closePlayerBtn) closePlayerBtn.click();
            return;
        }

        // If no modal is open, let default back behavior happen
        // (e.g., browser back or Capacitor's back handling)
    }

    focusFirstVisible() {
        // Find first video card in viewport
        const candidates = document.querySelectorAll('.video-card');
        if (candidates.length > 0) {
            this.setFocus(candidates[0]);
            this.focusInitialized = true;
        }
    }

    setFocus(el) {
        if (!el) return;

        if (this.currentFocus) {
            this.currentFocus.classList.remove('keyboard-focused');
        }

        this.currentFocus = el;
        el.classList.add('keyboard-focused');
        el.focus({ preventScroll: true }); // Native focus

        // Smooth scroll into view
        el.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }

    /**
     * Get the row container of an element
     */
    getRowContainer(el) {
        return el.closest('.video-row, .slider-row, .row-content, .grid, .episodes-grid, .recommendations-container');
    }

    /**
     * Get all focusable elements within a container (or document)
     */
    getFocusableInContainer(container) {
        const selector = this.selectors.slice(0, 10).join(','); // Primary interactive elements
        return container
            ? Array.from(container.querySelectorAll(selector))
            : Array.from(document.querySelectorAll(selector));
    }

    moveHorizontal(direction) {
        if (!this.currentFocus) return null;

        // Try to stay within the same row/container
        const row = this.getRowContainer(this.currentFocus);

        if (row) {
            // Get siblings in the same row
            const siblings = this.getFocusableInContainer(row);
            const currentIndex = siblings.indexOf(this.currentFocus);

            if (currentIndex !== -1) {
                const nextIndex = currentIndex + direction;
                if (nextIndex >= 0 && nextIndex < siblings.length) {
                    return siblings[nextIndex];
                }
            }
            // At edge of row - don't wrap to next row on horizontal nav
            return null;
        }

        // Fallback: flat DOM order navigation
        const allFocusable = Array.from(document.querySelectorAll(this.selectors.join(',')));
        const currentIndex = allFocusable.indexOf(this.currentFocus);

        if (currentIndex === -1) return null;

        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < allFocusable.length) {
            const currentRect = this.currentFocus.getBoundingClientRect();
            const nextEl = allFocusable[nextIndex];
            const nextRect = nextEl.getBoundingClientRect();

            // Don't jump to next row on horizontal nav
            const verticalDist = Math.abs(currentRect.top - nextRect.top);
            if (verticalDist > currentRect.height * 0.5) {
                return null; // Would jump to different row
            }
            return nextEl;
        }
        return null;
    }

    moveVertical(direction) {
        // Find closest element in the visual direction
        if (!this.currentFocus) return null;

        const currentRect = this.currentFocus.getBoundingClientRect();
        const centerX = currentRect.left + currentRect.width / 2;
        const allFocusable = Array.from(document.querySelectorAll(this.selectors.join(',')));

        // Filter elements that are strictly Above/Below
        const candidates = allFocusable.filter(el => {
            if (el === this.currentFocus) return false;
            const rect = el.getBoundingClientRect();

            if (direction === 1) { // Down
                return rect.top >= currentRect.bottom - (currentRect.height * 0.3);
            } else { // Up
                return rect.bottom <= currentRect.top + (currentRect.height * 0.3);
            }
        });

        if (candidates.length === 0) return null;

        // Find the one with minimum distance, prioritizing horizontal alignment
        let bestCandidate = null;
        let minDistance = Infinity;

        candidates.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elCenterX = rect.left + rect.width / 2;

            // Vertical distance (primary)
            const vDist = Math.abs(rect.top - currentRect.top);

            // Horizontal alignment penalty (prefer elements at similar X position)
            const hDist = Math.abs(elCenterX - centerX);

            // Weight: prefer closer rows, then prefer horizontal alignment
            // Vertical distance matters more for row-based navigation
            const dist = vDist * 2 + hDist;

            if (dist < minDistance) {
                minDistance = dist;
                bestCandidate = el;
            }
        });

        return bestCandidate;
    }
}
