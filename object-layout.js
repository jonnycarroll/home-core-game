const IsoObjectLayout = {
    getStackHeight(object) {
        const height = object.height || 0;
        const levels = object.levels || 1;

        return height * levels;
    },

    getSortKey(object) {
        return object.x + object.y;
    },

    sortObjects(objects) {
        return [...objects].sort((a, b) => this.getSortKey(a) - this.getSortKey(b));
    },

    isNearViewport(object, screenPos, viewportWidth, viewportHeight, tileWidth, tileHeight) {
        const totalHeight = this.getStackHeight(object);

        return screenPos.x > -tileWidth &&
            screenPos.x < viewportWidth + tileWidth &&
            screenPos.y > -tileHeight - totalHeight &&
            screenPos.y < viewportHeight + tileHeight;
    }
};

if (typeof module !== 'undefined') {
    module.exports = IsoObjectLayout;
}
