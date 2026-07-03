class IsoTileRenderer {
    constructor(ctx, isoMath, tileWidth, tileHeight) {
        this.ctx = ctx;
        this.isoMath = isoMath;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.defaultFillStyle = 'rgba(210, 214, 220, 0.08)';
        this.strokeStyle = 'rgba(0, 0, 0, 0.75)';
    }

    drawTile(tileX, tileY, viewport, fillStyle) {
        const screenPos = this.isoMath.getTileScreenPosition(tileX, tileY, viewport.offsetX, viewport.offsetY);

        if (!this.isTileNearViewport(screenPos, viewport.width, viewport.height)) {
            return;
        }

        const corners = this.getTileCorners(screenPos);

        this.ctx.beginPath();
        this.ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) {
            this.ctx.lineTo(corners[i].x, corners[i].y);
        }
        this.ctx.closePath();

        this.ctx.fillStyle = fillStyle || this.defaultFillStyle;
        this.ctx.fill();
        this.ctx.strokeStyle = this.strokeStyle;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    isTileNearViewport(screenPos, viewportWidth, viewportHeight) {
        return screenPos.x > -this.tileWidth &&
            screenPos.x < viewportWidth + this.tileWidth &&
            screenPos.y > -this.tileHeight &&
            screenPos.y < viewportHeight + this.tileHeight;
    }

    getTileCorners(screenPos) {
        return [
            { x: screenPos.x, y: screenPos.y - this.tileHeight / 2 },
            { x: screenPos.x + this.tileWidth / 2, y: screenPos.y },
            { x: screenPos.x, y: screenPos.y + this.tileHeight / 2 },
            { x: screenPos.x - this.tileWidth / 2, y: screenPos.y }
        ];
    }
}

if (typeof module !== 'undefined') {
    module.exports = IsoTileRenderer;
}
