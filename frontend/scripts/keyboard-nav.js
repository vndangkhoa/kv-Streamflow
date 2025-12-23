/**
 * TV-Style Keyboard Navigation
 * Handles Arrow keys to navigate horizontally through sliders and vertically between rows.
 */

export class KeyboardNavigation {
    constructor() {
        this.currentFocus = null;
        this.isEnabled = false;

        // Selectors for focusable items
        this.selectors = [
            '.video-card',
            '.hero__btn',
            '.slider-btn',
            '#topSearchBtn'
        ];
    }

    init() {
        this.isEnabled = true;
        document.addEventListener('keydown', this.handleKey.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Initial focus?
        // Usually wait for user to press a key to enter "Keyboard Mode"
        // so we don't show focus rings to mouse users.
    }

    handleMouseMove() {
        // If mouse moves, likely user is using mouse.
        // Optional: clear focus to avoid conflict?
        // For now, let's keep them separate or just let hover take precedence.
        if (this.currentFocus) {
            this.currentFocus.blur();
            this.currentFocus.classList.remove('keyboard-focused');
            this.currentFocus = null;
        }
    }

    handleKey(e) {
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
        } else if (e.key === 'Enter') {
            if (this.currentFocus) {
                this.currentFocus.click();
            }
        }
    }

    focusFirstVisible() {
        // Find first video card in viewport
        const candidates = document.querySelectorAll('.video-card');
        if (candidates.length > 0) {
            this.setFocus(candidates[0]);
        }
    }

    setFocus(el) {
        if (this.currentFocus) {
            this.currentFocus.classList.remove('keyboard-focused');
            // Trigger mouseleave logic if needed to reset z-index?
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

    moveHorizontal(direction) {
        // 1. Try siblings first (if in a list)
        // If direction is 1 (Right), look for nextElementSibling
        if (!this.currentFocus) return null;

        const allFocusable = Array.from(document.querySelectorAll(this.selectors.join(',')));
        const currentIndex = allFocusable.indexOf(this.currentFocus);

        if (currentIndex === -1) return null;

        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < allFocusable.length) {
            // Simple DOM order check
            // BUT for sliders, DOM order matches visual order usually.
            // Check if they are in the same container?
            // If dragging across rows, Horizontal arrow shouldn't jump rows if possible?
            // But flattening functionality is easier: just go to next DOM element.

            // Refinement: If next element is in a DIFFERENT slider row, only jump if it's logically close?
            // Ideally Right Arrow should stay in row.

            const currentRect = this.currentFocus.getBoundingClientRect();
            const nextEl = allFocusable[nextIndex];
            const nextRect = nextEl.getBoundingClientRect();

            // Heuristic: If vertical distance is large, it's a new row.
            // If delta Y > height/2, maybe block horizontal nav?
            const verticalDist = Math.abs(currentRect.top - nextRect.top);
            if (verticalDist > currentRect.height * 0.5) {
                // New row. Should arrow keys wrap? 
                // User said "scrollable to the right". Usually means stay in row or wrap.
                // Let's allow wrapping for now, or strict row logic?
                // Strict Row Logic is better for TV.
                // If I am at end of row, right arrow does nothing or goes to "Next" button?

                // Let's rely on simple DOM order for now as "good enough" for v1
                // except if the user specifically requested "scrollable right".
                // If I press Right at end of row, and it jumps to next row, that's okay.
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
                return rect.top >= currentRect.bottom - (currentRect.height * 0.2); // permit slight overlap
            } else { // Up
                return rect.bottom <= currentRect.top + (currentRect.height * 0.2);
            }
        });

        if (candidates.length === 0) return null;

        // Find the one with minimum distance
        // Distance = Vertical Diff + Horizontal Diff penalty
        let bestCandidate = null;
        let minDistance = Infinity;

        candidates.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elCenterX = rect.left + rect.width / 2;
            const elCenterY = rect.top + rect.height / 2;

            // Vertical distance (primary)
            const vDist = Math.abs(rect.top - currentRect.top);

            // Horizontal alignment penalty
            const hDist = Math.abs(elCenterX - centerX);

            // Weighted distance: Vertical matter, but horizontally closest is best within that band.
            // Actually, we usually want the "row immediately below".
            // So sort by Vertical distance first.

            // Simple Euclidean distance?
            const dist = Math.sqrt(Math.pow(vDist, 2) + Math.pow(hDist, 2));

            if (dist < minDistance) {
                minDistance = dist;
                bestCandidate = el;
            }
        });

        return bestCandidate;
    }
}
