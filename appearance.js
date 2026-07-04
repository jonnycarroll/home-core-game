const AppAppearance = (() => {
    const legacyStorageKey = 'emd-sim-gym-theme';
    const storageKey = 'home-core-theme';
    const preferences = ['system', 'light', 'dark'];
    const darkTokens = {
        canvasBackground: '#050607',
        tileStroke: 'rgba(0, 0, 0, 0.75)',
        tileDefault: 'rgba(210, 214, 220, 0.08)',
        tileUnrevealed: { r: 10, g: 12, b: 13, a: 0.88 },
        tileHome: { r: 38, g: 170, b: 218, a: 0.92 },
        tileClaimed: { r: 45, g: 121, b: 98, a: 0.66 },
        tileFrontier: { r: 182, g: 142, b: 62, a: 0.52 },
        tileRevealed: { r: 105, g: 116, b: 122, a: 0.36 },
        hoverFallback: 'rgba(255, 255, 255, ',
        homeMarkerFill: 'rgba(0, 160, 255, 0.95)',
        homeMarkerStroke: 'rgba(220, 245, 255, 0.9)',
        shadowClaimed: 'rgba(0, 0, 0, 0.34)',
        shadowOpen: 'rgba(0, 0, 0, 0.2)',
        energyClaimed: '#9df7bd',
        energyOpen: '#5ede91',
        energyStroke: '#041f13',
        energyHighlight: 'rgba(245, 255, 247, 0.68)',
        researchClaimed: '#f2cf67',
        researchOpen: '#d8a944',
        researchCoreClaimed: '#fff0a6',
        researchCoreOpen: '#e2c15d',
        researchStroke: '#32250a',
        energyPipClaimed: '#c8ffd8',
        energyPipOpen: '#86eeb0',
        researchPipClaimed: '#fff0a6',
        researchPipOpen: '#e0c16a',
        pipStroke: 'rgba(4, 8, 9, 0.84)',
        materials: {
            blueBlock: {
                top: 'rgba(70, 190, 255, 0.96)',
                right: 'rgba(0, 125, 210, 0.96)',
                left: 'rgba(0, 85, 165, 0.96)',
                separator: 'rgba(190, 235, 255, 0.32)'
            }
        }
    };
    const lightTokens = {
        canvasBackground: '#e7edf0',
        tileStroke: 'rgba(66, 85, 92, 0.34)',
        tileDefault: 'rgba(60, 79, 86, 0.1)',
        tileUnrevealed: { r: 118, g: 130, b: 136, a: 0.62 },
        tileHome: { r: 22, g: 136, b: 190, a: 0.84 },
        tileClaimed: { r: 50, g: 143, b: 106, a: 0.56 },
        tileFrontier: { r: 205, g: 148, b: 45, a: 0.5 },
        tileRevealed: { r: 112, g: 128, b: 132, a: 0.16 },
        hoverFallback: 'rgba(22, 36, 42, ',
        homeMarkerFill: 'rgba(0, 122, 192, 0.94)',
        homeMarkerStroke: 'rgba(248, 253, 255, 0.96)',
        shadowClaimed: 'rgba(30, 43, 48, 0.28)',
        shadowOpen: 'rgba(30, 43, 48, 0.16)',
        energyClaimed: '#158a55',
        energyOpen: '#23a667',
        energyStroke: '#edfdf4',
        energyHighlight: 'rgba(255, 255, 255, 0.58)',
        researchClaimed: '#9a6a07',
        researchOpen: '#b98112',
        researchCoreClaimed: '#ffe18a',
        researchCoreOpen: '#d19721',
        researchStroke: '#fff4ca',
        energyPipClaimed: '#0d7849',
        energyPipOpen: '#17985c',
        researchPipClaimed: '#9a6a07',
        researchPipOpen: '#b98112',
        pipStroke: 'rgba(255, 255, 255, 0.88)',
        materials: {
            blueBlock: {
                top: 'rgba(45, 155, 215, 0.95)',
                right: 'rgba(12, 112, 175, 0.95)',
                left: 'rgba(18, 84, 142, 0.95)',
                separator: 'rgba(244, 252, 255, 0.46)'
            }
        }
    };
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function getStoredPreference() {
        if (!localStorage.getItem(storageKey) && localStorage.getItem(legacyStorageKey)) {
            localStorage.setItem(storageKey, localStorage.getItem(legacyStorageKey));
        }

        const stored = localStorage.getItem(storageKey);
        return preferences.includes(stored) ? stored : 'system';
    }

    function getResolvedTheme(preference = getStoredPreference()) {
        return preference === 'system'
            ? (mediaQuery.matches ? 'dark' : 'light')
            : preference;
    }

    function getCanvasTokens() {
        return getResolvedTheme() === 'dark' ? darkTokens : lightTokens;
    }

    function apply(preference = getStoredPreference()) {
        const resolvedTheme = getResolvedTheme(preference);
        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.dataset.themePreference = preference;
        document.documentElement.style.colorScheme = resolvedTheme;

        window.dispatchEvent(new CustomEvent('appearancechange', {
            detail: {
                preference,
                resolvedTheme,
                tokens: getCanvasTokens()
            }
        }));
    }

    function setPreference(preference) {
        if (!preferences.includes(preference)) {
            return;
        }

        localStorage.setItem(storageKey, preference);
        apply(preference);
    }

    function getNextPreference(preference = getStoredPreference()) {
        const currentIndex = preferences.indexOf(preference);
        return preferences[(currentIndex + 1) % preferences.length];
    }

    function updateToggleLabel(button, preference = getStoredPreference()) {
        const label = `Theme: ${preference[0].toUpperCase()}${preference.slice(1)}`;
        button.setAttribute('aria-label', label);
        button.title = label;
    }

    function initControls() {
        const button = document.getElementById('theme-toggle');
        if (!button) {
            return;
        }

        updateToggleLabel(button);
        button.addEventListener('click', () => setPreference(getNextPreference()));
        window.addEventListener('appearancechange', (event) => {
            updateToggleLabel(button, event.detail.preference);
        });
    }

    mediaQuery.addEventListener('change', () => {
        if (getStoredPreference() === 'system') {
            apply('system');
        }
    });

    return {
        apply,
        getCanvasTokens,
        getPreference: getStoredPreference,
        initControls,
        setPreference
    };
})();

AppAppearance.apply();

if (typeof window !== 'undefined') {
    window.AppAppearance = AppAppearance;
}
