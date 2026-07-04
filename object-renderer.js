const IsoObjectLayoutDependency = typeof require !== 'undefined'
    ? require('./object-layout')
    : IsoObjectLayout;

class IsoObjectRenderer {
    constructor(ctx, isoMath, materials, tileWidth, tileHeight) {
        this.ctx = ctx;
        this.isoMath = isoMath;
        this.materials = materials;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    drawObjects(objects, viewport) {
        const visibleObjects = IsoObjectLayoutDependency.sortObjects(objects)
            .filter((object) => this.isObjectNearViewport(object, viewport));

        for (const object of visibleObjects) {
            this.drawObject(object, viewport.offsetX, viewport.offsetY);
        }
    }

    drawObject(object, offsetX, offsetY) {
        if (object.type === 'cuboid') {
            this.drawCuboid(object, offsetX, offsetY);
        }
    }

    isObjectNearViewport(object, viewport) {
        const screenPos = this.isoMath.getTileScreenPosition(object.x, object.y, viewport.offsetX, viewport.offsetY);

        return IsoObjectLayoutDependency.isNearViewport(
            object,
            screenPos,
            viewport.width,
            viewport.height,
            this.tileWidth,
            this.tileHeight
        );
    }

    drawCuboid(object, offsetX, offsetY) {
        const height = object.height || 24;
        const levels = object.levels || 1;

        this.ctx.save();
        for (let level = 0; level < levels; level++) {
            this.drawCuboidLevel(object, level * height, height, offsetX, offsetY);
        }
        this.ctx.restore();
    }

    drawCuboidLevel(object, baseOffset, height, offsetX, offsetY) {
        const screenPos = this.isoMath.getTileScreenPosition(object.x, object.y, offsetX, offsetY);
        const baseY = screenPos.y - baseOffset;
        const colors = this.getObjectMaterial(object);
        const top = [
            { x: screenPos.x, y: baseY - this.tileHeight / 2 - height },
            { x: screenPos.x + this.tileWidth / 2, y: baseY - height },
            { x: screenPos.x, y: baseY + this.tileHeight / 2 - height },
            { x: screenPos.x - this.tileWidth / 2, y: baseY - height }
        ];
        const bottom = [
            { x: screenPos.x, y: baseY - this.tileHeight / 2 },
            { x: screenPos.x + this.tileWidth / 2, y: baseY },
            { x: screenPos.x, y: baseY + this.tileHeight / 2 },
            { x: screenPos.x - this.tileWidth / 2, y: baseY }
        ];

        this.drawPolygon([top[1], bottom[1], bottom[2], top[2]], colors.right);
        this.drawPolygon([top[2], bottom[2], bottom[3], top[3]], colors.left);
        this.drawPolygon(top, colors.top);
        this.drawLevelSeparator(bottom, colors.separator);
    }

    getObjectMaterial(object) {
        return this.materials[object.material] || this.materials.blueBlock;
    }

    drawPolygon(points, fillStyle, strokeStyle) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }

        this.ctx.closePath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.fill();

        if (strokeStyle) {
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    drawLevelSeparator(points, strokeStyle) {
        if (!strokeStyle) {
            return;
        }

        this.ctx.beginPath();
        this.ctx.moveTo(points[1].x, points[1].y);
        this.ctx.lineTo(points[2].x, points[2].y);
        this.ctx.lineTo(points[3].x, points[3].y);
        this.ctx.strokeStyle = strokeStyle;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
}

if (typeof module !== 'undefined') {
    module.exports = IsoObjectRenderer;
}
