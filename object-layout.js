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

    getSceneItemSortKey(item) {
        return this.getSortKey(item);
    },

    sortSceneItems(items) {
        const layerOrder = {
            glyph: 0,
            object: 1
        };

        return [...items].sort((a, b) => {
            const depthDelta = this.getSceneItemSortKey(a) - this.getSceneItemSortKey(b);
            if (depthDelta !== 0) {
                return depthDelta;
            }

            return (layerOrder[a.kind] || 0) - (layerOrder[b.kind] || 0);
        });
    },

    getCuboidLevelPolygons(screenPos, tileWidth, tileHeight, height, baseOffset = 0) {
        const baseY = screenPos.y - baseOffset;
        const top = [
            { x: screenPos.x, y: baseY - tileHeight / 2 - height },
            { x: screenPos.x + tileWidth / 2, y: baseY - height },
            { x: screenPos.x, y: baseY + tileHeight / 2 - height },
            { x: screenPos.x - tileWidth / 2, y: baseY - height }
        ];
        const bottom = [
            { x: screenPos.x, y: baseY - tileHeight / 2 },
            { x: screenPos.x + tileWidth / 2, y: baseY },
            { x: screenPos.x, y: baseY + tileHeight / 2 },
            { x: screenPos.x - tileWidth / 2, y: baseY }
        ];

        return [
            [top[1], bottom[1], bottom[2], top[2]],
            [top[2], bottom[2], bottom[3], top[3]],
            top
        ];
    },

    isPointInPolygon(point, polygon) {
        let inside = false;

        for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
            const currentPoint = polygon[current];
            const previousPoint = polygon[previous];
            const crossesY = currentPoint.y > point.y !== previousPoint.y > point.y;

            if (crossesY) {
                const intersectionX = ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
                    (previousPoint.y - currentPoint.y) + currentPoint.x;
                if (point.x < intersectionX) {
                    inside = !inside;
                }
            }
        }

        return inside;
    },

    isPointInCuboid(object, screenPos, point, tileWidth, tileHeight) {
        const height = object.height || 24;
        const levels = object.levels || 1;

        for (let level = levels - 1; level >= 0; level--) {
            const polygons = this.getCuboidLevelPolygons(screenPos, tileWidth, tileHeight, height, level * height);
            if (polygons.some((polygon) => this.isPointInPolygon(point, polygon))) {
                return true;
            }
        }

        return false;
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
