// Isometric Grid System for Isometric Grid Explorer

class IsoGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelRatio = 1;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        this.tileWidth = 60;
        this.tileHeight = 30;
        this.objects = [
            {
                type: 'cuboid',
                x: 0,
                y: 0,
                height: this.getTileEdgeLength() / 2,
                colors: {
                    top: 'rgba(70, 190, 255, 0.96)',
                    right: 'rgba(0, 125, 210, 0.96)',
                    left: 'rgba(0, 85, 165, 0.96)',
                    stroke: 'rgba(180, 230, 255, 0.45)'
                }
            }
        ];
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.hoveredTile = null;
        this.hoverAnimations = [];
        this.hoverFadeDuration = 140;
        this.centerAnimation = null;
        this.animationFrame = null;
        this.lastAnimationTime = 0;
        
        // Set canvas size to full window
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Center the view on the grid's center point
        this.centerView(false);
        
        // Start rendering
        this.render();
    }
    
    resizeCanvas() {
        this.pixelRatio = window.devicePixelRatio || 1;
        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;
        this.canvas.width = Math.round(this.viewportWidth * this.pixelRatio);
        this.canvas.height = Math.round(this.viewportHeight * this.pixelRatio);
        this.canvas.style.width = `${this.viewportWidth}px`;
        this.canvas.style.height = `${this.viewportHeight}px`;
        this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        this.render();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Center button event listener
        document.getElementById('center-button').addEventListener('click', () => this.centerView());
    }
    
    handleMouseDown(e) {
        this.stopCenterAnimation();
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }
    
    handleMouseMove(e) {
        if (this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            const deltaX = currentX - this.lastX;
            const deltaY = currentY - this.lastY;
            
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            
            this.lastX = currentX;
            this.lastY = currentY;
            
            this.render();
        } else {
            // Check for hover
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            this.updateHoveredTile(this.getTileAtPosition(mouseX, mouseY));
        }
    }
    
    handleMouseUp() {
        this.isDragging = false;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.stopCenterAnimation();
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.touches[0].clientX - rect.left;
        this.lastY = e.touches[0].clientY - rect.top;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.touches[0].clientX - rect.left;
            const currentY = e.touches[0].clientY - rect.top;
            
            const deltaX = currentX - this.lastX;
            const deltaY = currentY - this.lastY;
            
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            
            this.lastX = currentX;
            this.lastY = currentY;
            
            this.render();
        }
    }
    
    handleTouchEnd() {
        this.isDragging = false;
    }
    
    centerView(animate = true) {
        const targetX = this.viewportWidth / 2;
        const targetY = this.viewportHeight / 2;

        if (!animate) {
            this.stopCenterAnimation();
            this.offsetX = targetX;
            this.offsetY = targetY;
            this.render();
            return;
        }

        this.centerAnimation = {
            startX: this.offsetX,
            startY: this.offsetY,
            targetX,
            targetY,
            startTime: 0,
            duration: 600
        };
        this.startAnimationLoop();
    }
    
    getVisibleTiles() {
        const corners = [
            this.getGridCoordsFromScreen(-this.tileWidth, -this.tileHeight),
            this.getGridCoordsFromScreen(this.viewportWidth + this.tileWidth, -this.tileHeight),
            this.getGridCoordsFromScreen(-this.tileWidth, this.viewportHeight + this.tileHeight),
            this.getGridCoordsFromScreen(this.viewportWidth + this.tileWidth, this.viewportHeight + this.tileHeight)
        ];
        const padding = 2;
        const xs = corners.map((corner) => corner.x);
        const ys = corners.map((corner) => corner.y);

        return {
            startX: Math.floor(Math.min(...xs)) - padding,
            endX: Math.ceil(Math.max(...xs)) + padding,
            startY: Math.floor(Math.min(...ys)) - padding,
            endY: Math.ceil(Math.max(...ys)) + padding
        };
    }
    
    getTileScreenPosition(tileX, tileY) {
        return {
            x: (tileX - tileY) * (this.tileWidth / 2) + this.offsetX,
            y: (tileX + tileY) * (this.tileHeight / 2) + this.offsetY
        };
    }

    getTileEdgeLength() {
        return Math.hypot(this.tileWidth / 2, this.tileHeight / 2);
    }

    getGridCoordsFromScreen(screenX, screenY) {
        const localX = screenX - this.offsetX;
        const localY = screenY - this.offsetY;
        const normalizedX = localX / (this.tileWidth / 2);
        const normalizedY = localY / (this.tileHeight / 2);

        return {
            x: (normalizedX + normalizedY) / 2,
            y: (normalizedY - normalizedX) / 2
        };
    }

    isPointInDiamond(px, py, tileX, tileY) {
        const screenPos = this.getTileScreenPosition(tileX, tileY);
        const normalizedX = Math.abs(px - screenPos.x) / (this.tileWidth / 2);
        const normalizedY = Math.abs(py - screenPos.y) / (this.tileHeight / 2);

        return normalizedX + normalizedY <= 1;
    }

    getTileAtPosition(x, y) {
        const approx = this.getGridCoordsFromScreen(x, y);
        const baseX = Math.floor(approx.x);
        const baseY = Math.floor(approx.y);
        const candidates = [
            { x: baseX, y: baseY },
            { x: baseX + 1, y: baseY },
            { x: baseX, y: baseY + 1 },
            { x: baseX + 1, y: baseY + 1 }
        ];

        for (const candidate of candidates) {
            if (this.isPointInDiamond(x, y, candidate.x, candidate.y)) {
                return candidate;
            }
        }

        return {
            x: Math.round(approx.x),
            y: Math.round(approx.y)
        };
    }

    updateHoveredTile(tile) {
        if (this.isSameTile(this.hoveredTile, tile)) {
            return;
        }

        this.hoveredTile = tile;
        this.setHoverAnimationTarget(tile, 1);

        for (const animation of this.hoverAnimations) {
            if (!this.isSameTile(animation.tile, tile)) {
                animation.targetAlpha = 0;
            }
        }

        this.startAnimationLoop();
    }

    setHoverAnimationTarget(tile, targetAlpha) {
        if (!tile) {
            return;
        }

        const existingAnimation = this.hoverAnimations.find((animation) => this.isSameTile(animation.tile, tile));
        if (existingAnimation) {
            existingAnimation.targetAlpha = targetAlpha;
            return;
        }

        this.hoverAnimations.push({
            tile: { x: tile.x, y: tile.y },
            alpha: 0,
            targetAlpha
        });
    }

    isSameTile(a, b) {
        return !!a && !!b && a.x === b.x && a.y === b.y;
    }

    getHoverAlphaForTile(x, y) {
        const animation = this.hoverAnimations.find((entry) => entry.tile.x === x && entry.tile.y === y);
        return animation ? animation.alpha : 0;
    }

    stopCenterAnimation() {
        this.centerAnimation = null;
    }

    startAnimationLoop() {
        if (this.animationFrame !== null) {
            return;
        }

        this.animationFrame = requestAnimationFrame((timestamp) => this.animate(timestamp));
    }

    animate(timestamp) {
        this.animationFrame = null;
        const deltaMs = this.lastAnimationTime === 0 ? 16 : Math.min(timestamp - this.lastAnimationTime, 64);
        this.lastAnimationTime = timestamp;
        const stillAnimating = this.stepAnimations(timestamp, deltaMs);

        this.render();

        if (stillAnimating) {
            this.startAnimationLoop();
            return;
        }

        this.lastAnimationTime = 0;
    }

    stepAnimations(timestamp, deltaMs) {
        let stillAnimating = false;

        if (this.centerAnimation) {
            if (this.centerAnimation.startTime === 0) {
                this.centerAnimation.startTime = timestamp;
            }

            const elapsed = timestamp - this.centerAnimation.startTime;
            const progress = Math.min(elapsed / this.centerAnimation.duration, 1);
            const eased = this.easeOutSmoothExpo(progress);

            this.offsetX = this.centerAnimation.startX + (this.centerAnimation.targetX - this.centerAnimation.startX) * eased;
            this.offsetY = this.centerAnimation.startY + (this.centerAnimation.targetY - this.centerAnimation.startY) * eased;

            if (progress >= 1) {
                this.offsetX = this.centerAnimation.targetX;
                this.offsetY = this.centerAnimation.targetY;
                this.centerAnimation = null;
            } else {
                stillAnimating = true;
            }
        }

        const hoverStep = deltaMs / this.hoverFadeDuration;
        for (const animation of this.hoverAnimations) {
            const delta = animation.targetAlpha - animation.alpha;
            if (Math.abs(delta) <= 0.01) {
                animation.alpha = animation.targetAlpha;
            } else {
                animation.alpha += Math.sign(delta) * Math.min(Math.abs(delta), hoverStep);
                stillAnimating = true;
            }
        }

        this.hoverAnimations = this.hoverAnimations.filter((animation) => animation.alpha > 0 || animation.targetAlpha > 0);

        return stillAnimating;
    }

    easeOutSmoothExpo(t) {
        if (t === 0) {
            return 0;
        }

        if (t === 1) {
            return 1;
        }

        // Fast initial release with a long, smooth settle and no end overshoot.
        return 1 - Math.pow(2, -10 * t);
    }
    
    render() {
        // Clear canvas behind the tiled surface.
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
        
        const { startX, endX, startY, endY } = this.getVisibleTiles();
        
        // Render grid tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                this.drawTile(x, y);
            }
        }

        this.drawObjects();
        this.drawCenterDirectionMarker();
    }

    drawCenterDirectionMarker() {
        const centerPoint = this.getTileScreenPosition(0, 0);

        if (this.isPointInViewport(centerPoint)) {
            return;
        }

        const viewportCenter = {
            x: this.viewportWidth / 2,
            y: this.viewportHeight / 2
        };
        const markerPoint = this.getViewportEdgePoint(viewportCenter, centerPoint, 28);

        if (!markerPoint) {
            return;
        }

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 160, 255, 0.95)';
        this.ctx.strokeStyle = 'rgba(220, 245, 255, 0.9)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(markerPoint.x, markerPoint.y, 7, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    isPointInViewport(point) {
        return point.x >= 0 &&
            point.x <= this.viewportWidth &&
            point.y >= 0 &&
            point.y <= this.viewportHeight;
    }

    getViewportEdgePoint(from, to, padding) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        if (dx === 0 && dy === 0) {
            return null;
        }

        const minX = padding;
        const maxX = this.viewportWidth - padding;
        const minY = padding;
        const maxY = this.viewportHeight - padding;
        let scale = Infinity;

        if (dx > 0) {
            scale = Math.min(scale, (maxX - from.x) / dx);
        } else if (dx < 0) {
            scale = Math.min(scale, (minX - from.x) / dx);
        }

        if (dy > 0) {
            scale = Math.min(scale, (maxY - from.y) / dy);
        } else if (dy < 0) {
            scale = Math.min(scale, (minY - from.y) / dy);
        }

        if (!Number.isFinite(scale)) {
            return null;
        }

        return {
            x: from.x + dx * scale,
            y: from.y + dy * scale
        };
    }

    getTileBaseColor(x, y) {
        return null;
    }

    getBaseFillStyle(baseColor) {
        if (!baseColor) {
            return null;
        }

        return `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${baseColor.a})`;
    }

    getHoverFillStyle(baseColor, hoverAlpha) {
        if (baseColor) {
            const lightenAmount = 0.18 + hoverAlpha * 0.22;
            const r = Math.round(baseColor.r + (255 - baseColor.r) * lightenAmount);
            const g = Math.round(baseColor.g + (255 - baseColor.g) * lightenAmount);
            const b = Math.round(baseColor.b + (255 - baseColor.b) * lightenAmount);
            const a = Math.min(1, baseColor.a + hoverAlpha * 0.05);

            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }

        return `rgba(255, 255, 255, ${hoverAlpha * 0.7})`;
    }
    
    drawTile(x, y) {
        // Calculate screen position of tile
        const screenPos = this.getTileScreenPosition(x, y);
        const screenX = screenPos.x;
        const screenY = screenPos.y;
        
        // Draw tile with faint grid lines (only if tile is visible)
        if (screenX > -this.tileWidth && screenX < this.viewportWidth + this.tileWidth &&
            screenY > -this.tileHeight && screenY < this.viewportHeight + this.tileHeight) {
            
            // Calculate the four corners of the diamond-shaped tile
            const corners = [
                { x: screenX, y: screenY - this.tileHeight / 2 },
                { x: screenX + this.tileWidth / 2, y: screenY },
                { x: screenX, y: screenY + this.tileHeight / 2 },
                { x: screenX - this.tileWidth / 2, y: screenY }
            ];
            
            // Draw tile outline with faint lines
            this.ctx.beginPath();
            this.ctx.moveTo(corners[0].x, corners[0].y);
            for (let i = 1; i < corners.length; i++) {
                this.ctx.lineTo(corners[i].x, corners[i].y);
            }
            this.ctx.closePath();
            
            const baseColor = this.getTileBaseColor(x, y);
            const hoverAlpha = this.getHoverAlphaForTile(x, y);
            const fillStyle = hoverAlpha > 0
                ? this.getHoverFillStyle(baseColor, hoverAlpha)
                : this.getBaseFillStyle(baseColor);

            this.ctx.fillStyle = fillStyle || 'rgba(210, 214, 220, 0.08)';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    drawObjects() {
        const visibleObjects = this.objects
            .filter((object) => this.isObjectNearViewport(object))
            .sort((a, b) => (a.x + a.y) - (b.x + b.y));

        for (const object of visibleObjects) {
            if (object.type === 'cuboid') {
                this.drawCuboid(object);
            }
        }
    }

    isObjectNearViewport(object) {
        const screenPos = this.getTileScreenPosition(object.x, object.y);
        const height = object.height || 0;

        return screenPos.x > -this.tileWidth &&
            screenPos.x < this.viewportWidth + this.tileWidth &&
            screenPos.y > -this.tileHeight - height &&
            screenPos.y < this.viewportHeight + this.tileHeight;
    }

    drawCuboid(object) {
        const screenPos = this.getTileScreenPosition(object.x, object.y);
        const height = object.height || 24;
        const colors = object.colors;
        const top = [
            { x: screenPos.x, y: screenPos.y - this.tileHeight / 2 - height },
            { x: screenPos.x + this.tileWidth / 2, y: screenPos.y - height },
            { x: screenPos.x, y: screenPos.y + this.tileHeight / 2 - height },
            { x: screenPos.x - this.tileWidth / 2, y: screenPos.y - height }
        ];
        const bottom = [
            { x: screenPos.x, y: screenPos.y - this.tileHeight / 2 },
            { x: screenPos.x + this.tileWidth / 2, y: screenPos.y },
            { x: screenPos.x, y: screenPos.y + this.tileHeight / 2 },
            { x: screenPos.x - this.tileWidth / 2, y: screenPos.y }
        ];

        this.ctx.save();
        this.drawPolygon([top[1], bottom[1], bottom[2], top[2]], colors.right, colors.stroke);
        this.drawPolygon([top[2], bottom[2], bottom[3], top[3]], colors.left, colors.stroke);
        this.drawPolygon(top, colors.top, colors.stroke);
        this.ctx.restore();
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
}

// Initialize grid when page loads
let isoGrid;

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    isoGrid = new IsoGrid(canvas);
});
