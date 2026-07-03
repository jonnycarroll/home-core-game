class IsoMath {
    constructor(tileWidth, tileHeight) {
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    getTileScreenPosition(tileX, tileY, offsetX, offsetY) {
        return {
            x: (tileX - tileY) * (this.tileWidth / 2) + offsetX,
            y: (tileX + tileY) * (this.tileHeight / 2) + offsetY
        };
    }

    getTileEdgeLength() {
        return Math.hypot(this.tileWidth / 2, this.tileHeight / 2);
    }

    getGridCoordsFromScreen(screenX, screenY, offsetX, offsetY) {
        const localX = screenX - offsetX;
        const localY = screenY - offsetY;
        const normalizedX = localX / (this.tileWidth / 2);
        const normalizedY = localY / (this.tileHeight / 2);

        return {
            x: (normalizedX + normalizedY) / 2,
            y: (normalizedY - normalizedX) / 2
        };
    }

    isPointInDiamond(px, py, tileX, tileY, offsetX, offsetY) {
        const screenPos = this.getTileScreenPosition(tileX, tileY, offsetX, offsetY);
        const normalizedX = Math.abs(px - screenPos.x) / (this.tileWidth / 2);
        const normalizedY = Math.abs(py - screenPos.y) / (this.tileHeight / 2);

        return normalizedX + normalizedY <= 1;
    }
}

if (typeof module !== 'undefined') {
    module.exports = IsoMath;
}
