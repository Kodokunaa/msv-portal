import { useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

function forceLightMode() {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    localStorage.setItem('appearance', 'light');
}

export function initializeTheme() {
    forceLightMode();
}

export function useAppearance() {
    const [appearance] = useState<Appearance>('light');
    const updateAppearance = (mode: Appearance) => {
        void mode;
        forceLightMode();
    };
    return { appearance, updateAppearance };
}
