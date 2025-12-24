import { Haptics, ImpactStyle } from '../js/capacitor-mock.js';

/**
 * Trigger a light haptic feedback for small interactions
 */
export const hapticLight = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
        // Fail silently if not on native
    }
};

/**
 * Trigger a medium haptic feedback for major interactions
 */
export const hapticMedium = async () => {
    try {
        await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
        // Fail silently
    }
};

/**
 * Trigger a success haptic feedback
 */
export const hapticSuccess = async () => {
    try {
        await Haptics.notification({ type: 'SUCCESS' });
    } catch (e) {
        // Fail silently
    }
};
