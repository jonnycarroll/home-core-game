const CanvasThemeTokens = {
    dark: {
        canvasBackground: '#050607',
        tileStroke: 'rgba(0, 0, 0, 0.75)',
        tileDefault: 'rgba(210, 214, 220, 0.08)',
        tileUnrevealed: { r: 10, g: 12, b: 13, a: 0.88 },
        tileHome: { r: 38, g: 170, b: 218, a: 0.92 },
        tileClaimed: { r: 38, g: 170, b: 218, a: 0.72 },
        tileFrontier: { r: 22, g: 116, b: 178, a: 0.48 },
        tileRevealed: { r: 105, g: 116, b: 122, a: 0.36 },
        hoverFallback: 'rgba(255, 255, 255, ',
        homeMarkerFill: 'rgba(0, 160, 255, 0.95)',
        homeMarkerStroke: 'rgba(220, 245, 255, 0.9)',
        levelUpMarkerFill: '#ffd45c',
        levelUpMarkerStroke: '#5c3a00',
        levelUpMarkerGlow: 'rgba(255, 196, 66, 0.34)',
        shadowClaimed: 'rgba(0, 0, 0, 0.34)',
        shadowOpen: 'rgba(0, 0, 0, 0.2)',
        energyClaimed: '#7dffae',
        energyOpen: '#24f076',
        energyStroke: '#041f13',
        energyHighlight: 'rgba(245, 255, 247, 0.68)',
        researchClaimed: '#78dcff',
        researchOpen: '#26aada',
        researchCoreClaimed: '#d8f7ff',
        researchCoreOpen: '#70d8ff',
        researchStroke: '#08344a',
        energyPipClaimed: '#c8ffd8',
        energyPipOpen: '#86eeb0',
        researchPipClaimed: '#b9efff',
        researchPipOpen: '#70d8ff',
        pipStroke: 'rgba(4, 8, 9, 0.84)',
        materials: {
            blueBlock: {
                top: 'rgba(70, 190, 255, 0.96)',
                right: 'rgba(0, 125, 210, 0.96)',
                left: 'rgba(0, 85, 165, 0.96)',
                separator: 'rgba(190, 235, 255, 0.32)'
            }
        }
    },
    light: {
        canvasBackground: '#e7edf0',
        tileStroke: 'rgba(66, 85, 92, 0.34)',
        tileDefault: 'rgba(60, 79, 86, 0.1)',
        tileUnrevealed: { r: 118, g: 130, b: 136, a: 0.62 },
        tileHome: { r: 22, g: 136, b: 190, a: 0.84 },
        tileClaimed: { r: 22, g: 136, b: 190, a: 0.66 },
        tileFrontier: { r: 36, g: 128, b: 184, a: 0.38 },
        tileRevealed: { r: 112, g: 128, b: 132, a: 0.16 },
        hoverFallback: 'rgba(22, 36, 42, ',
        homeMarkerFill: 'rgba(0, 122, 192, 0.94)',
        homeMarkerStroke: 'rgba(248, 253, 255, 0.96)',
        levelUpMarkerFill: '#d58a00',
        levelUpMarkerStroke: '#fff0bc',
        levelUpMarkerGlow: 'rgba(213, 138, 0, 0.28)',
        shadowClaimed: 'rgba(30, 43, 48, 0.28)',
        shadowOpen: 'rgba(30, 43, 48, 0.16)',
        energyClaimed: '#00a85e',
        energyOpen: '#00c96f',
        energyStroke: '#073724',
        energyHighlight: 'rgba(233, 255, 242, 0.72)',
        researchClaimed: '#117ab8',
        researchOpen: '#1688be',
        researchCoreClaimed: '#d7f5ff',
        researchCoreOpen: '#5abde8',
        researchStroke: '#073a54',
        energyPipClaimed: '#065f39',
        energyPipOpen: '#087848',
        researchPipClaimed: '#0e6fa8',
        researchPipOpen: '#117ab8',
        pipStroke: 'rgba(255, 255, 255, 0.94)',
        materials: {
            blueBlock: {
                top: 'rgba(45, 155, 215, 0.95)',
                right: 'rgba(12, 112, 175, 0.95)',
                left: 'rgba(18, 84, 142, 0.95)',
                separator: 'rgba(244, 252, 255, 0.46)'
            }
        }
    }
};

if (typeof window !== 'undefined') {
    window.CanvasThemeTokens = CanvasThemeTokens;
}

if (typeof module !== 'undefined') {
    module.exports = CanvasThemeTokens;
}
