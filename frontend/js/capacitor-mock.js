// Mock Capacitor Plugins for Browser/Dev Mode
export const StatusBar = {
    setStyle: async () => { },
    setBackgroundColor: async () => { },
    show: async () => { },
    hide: async () => { },
    Style: { Dark: 'DARK', Light: 'LIGHT' }
};

export const Style = { Dark: 'DARK', Light: 'LIGHT' };

export const Haptics = {
    impact: async () => { },
    vibrate: async () => { },
    notification: async () => { },
    selectionStart: async () => { },
    selectionChanged: async () => { },
    selectionEnd: async () => { }
};

export const ImpactStyle = {
    Heavy: 'HEAVY',
    Medium: 'MEDIUM',
    Light: 'LIGHT'
};
