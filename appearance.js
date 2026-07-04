const AppAppearance = (() => {
    const legacyStorageKey = 'emd-sim-gym-theme';
    const storageKey = 'home-core-theme';
    const preferences = ['system', 'light', 'dark'];
    const themeTokens = window.CanvasThemeTokens;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    if (!themeTokens) {
        throw new Error('CanvasThemeTokens must load before AppAppearance');
    }

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
        return themeTokens[getResolvedTheme()];
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
