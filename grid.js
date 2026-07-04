// Isometric grid system for Blue Core

class IsoGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pixelRatio = 1;
        this.viewportWidth = 0;
        this.viewportHeight = 0;
        this.tileWidth = 60;
        this.tileHeight = 30;
        this.isoMath = new IsoMath(this.tileWidth, this.tileHeight);
        this.materials = IsoMaterials;
        this.themeTokens = this.getThemeTokens();
        this.tileRenderer = new IsoTileRenderer(this.ctx, this.isoMath, this.tileWidth, this.tileHeight);
        this.glyphRenderer = new MapGlyphRenderer(this.themeTokens);
        this.objectRenderer = new IsoObjectRenderer(
            this.ctx,
            this.isoMath,
            this.materials,
            this.tileWidth,
            this.tileHeight
        );
        this.gameState = new IdleGameState();
        this.scene = IsoScene.createDefault();
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.pointerStart = null;
        this.dragDistance = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.hoveredTile = null;
        this.corePlacementTile = { x: 0, y: 0 };
        this.hoverAnimations = [];
        this.hoverFadeDuration = 140;
        this.centerAnimation = null;
        this.animationFrame = null;
        this.lastAnimationTime = 0;
        this.renderRequested = true;
        this.hudUpdateRequested = true;
        this.lastCanvasRenderTime = 0;
        this.lastHudUpdateTime = 0;
        this.idleCanvasRenderInterval = 500;
        this.hudUpdateInterval = 120;
        this.gameStarted = false;
        this.techTreeOpen = false;
        
        // Set canvas size to full window
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.cacheDomElements();
        this.setupAppearance();

        // Setup event listeners
        this.setupEventListeners();
        
        // Center the view on the grid's center point
        this.centerView(false);
        
        // Start rendering and production
        this.updateHud();
        this.startAnimationLoop();
    }

    cacheDomElements() {
        this.dom = {
            energyValue: document.getElementById('energy-value'),
            energyRate: document.getElementById('energy-rate'),
            researchValue: document.getElementById('research-value'),
            researchRate: document.getElementById('research-rate'),
            baseLevel: document.getElementById('base-level'),
            baseXp: document.getElementById('base-xp'),
            xpFill: document.getElementById('xp-fill'),
            tileTitle: document.getElementById('tile-title'),
            tileDetails: document.getElementById('tile-details'),
            tileAction: document.getElementById('tile-action'),
            startButton: document.getElementById('start-button'),
            welcomeScreen: document.getElementById('welcome-screen'),
            techOverlay: document.getElementById('tech-overlay'),
            techTitle: document.getElementById('tech-title'),
            techPoints: document.getElementById('tech-points'),
            techAward: document.getElementById('tech-award'),
            techButtons: Array.from(document.querySelectorAll('.tech-button')),
            techEnergy: document.getElementById('tech-energy'),
            techResearch: document.getElementById('tech-research'),
            resumeRun: document.getElementById('resume-run'),
            centerButton: document.getElementById('center-button')
        };
    }

    setupAppearance() {
        this.applyThemeTokens(this.themeTokens);

        if (window.AppAppearance) {
            window.AppAppearance.initControls();
        }

        window.addEventListener('appearancechange', (event) => {
            this.applyThemeTokens(event.detail.tokens);
            this.requestRender();
        });
    }

    getThemeTokens() {
        if (window.AppAppearance) {
            return window.AppAppearance.getCanvasTokens();
        }

        return window.CanvasThemeTokens.dark;
    }

    applyThemeTokens(tokens) {
        this.themeTokens = tokens;
        this.materials = tokens.materials;
        this.tileRenderer.defaultFillStyle = tokens.tileDefault;
        this.tileRenderer.strokeStyle = tokens.tileStroke;
        this.glyphRenderer.setTokens(tokens);
        this.objectRenderer.materials = tokens.materials;
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
        this.requestRender();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.updateHoveredTile(null);
            this.handleMouseUp();
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Center button event listener
        document.getElementById('center-button').addEventListener('click', () => this.centerView());
        this.dom.startButton.addEventListener('click', () => this.startGame());
        this.dom.tileAction.addEventListener('click', () => this.handleSelectedTileAction());
        for (const button of this.dom.techButtons) {
            button.addEventListener('click', () => {
                this.gameState.upgradeTech(button.dataset.tech);
                this.requestHudUpdate();
                this.requestRender();
            });
        }
        this.dom.resumeRun.addEventListener('click', () => this.closeTechTree());
    }

    requestRender() {
        this.renderRequested = true;
        this.startAnimationLoop();
    }

    requestHudUpdate() {
        this.hudUpdateRequested = true;
        this.startAnimationLoop();
    }

    startGame() {
        if (this.gameStarted) {
            return;
        }

        this.gameStarted = true;
        this.corePlacementTile = { x: 0, y: 0 };
        this.gameState.lastTick = 0;
        document.body.classList.remove('pre-start');
        document.body.classList.add('game-started');
        this.dom.welcomeScreen.setAttribute('aria-hidden', 'true');
        this.requestHudUpdate();
        this.requestRender();
    }

    updateCorePlacementFromEvent(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.updateCorePlacementFromPoint(event.clientX - rect.left, event.clientY - rect.top);
    }

    updateCorePlacementFromPoint(x, y) {
        this.corePlacementTile = this.getTileAtPosition(x, y);
        this.requestRender();
    }

    placeCoreFromPoint(x, y) {
        const tile = this.getTileAtPosition(x, y);
        this.corePlacementTile = tile;
        this.requestRender();

        if (this.gameState.isHomeCore(tile.x, tile.y)) {
            this.startGame();
        }
    }
    
    handleMouseDown(e) {
        if (this.techTreeOpen) {
            return;
        }

        if (!this.gameStarted) {
            const rect = this.canvas.getBoundingClientRect();
            this.placeCoreFromPoint(e.clientX - rect.left, e.clientY - rect.top);
            return;
        }

        this.stopCenterAnimation();
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        this.pointerStart = { x: this.lastX, y: this.lastY };
        this.dragDistance = 0;
    }
    
    handleMouseMove(e) {
        if (this.techTreeOpen) {
            return;
        }

        if (!this.gameStarted) {
            this.updateCorePlacementFromEvent(e);
            return;
        }

        if (this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            
            const deltaX = currentX - this.lastX;
            const deltaY = currentY - this.lastY;
            this.dragDistance += Math.hypot(deltaX, deltaY);
            
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            
            this.lastX = currentX;
            this.lastY = currentY;
            
            this.requestRender();
        } else {
            // Check for hover
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            this.updateHoveredTile(this.getTileAtPosition(mouseX, mouseY));
        }
    }
    
    handleMouseUp(e) {
        if (this.techTreeOpen) {
            return;
        }

        if (!this.gameStarted) {
            return;
        }

        if (this.isDragging && e && this.pointerStart && this.dragDistance < 5) {
            const rect = this.canvas.getBoundingClientRect();
            this.handleTileClick(e.clientX - rect.left, e.clientY - rect.top);
        }

        this.isDragging = false;
        this.pointerStart = null;
    }
    
    handleTouchStart(e) {
        if (this.techTreeOpen) {
            e.preventDefault();
            return;
        }

        if (!this.gameStarted) {
            const rect = this.canvas.getBoundingClientRect();
            this.updateCorePlacementFromPoint(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
            e.preventDefault();
            return;
        }

        e.preventDefault();
        this.stopCenterAnimation();
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.touches[0].clientX - rect.left;
        this.lastY = e.touches[0].clientY - rect.top;
        this.pointerStart = { x: this.lastX, y: this.lastY };
        this.dragDistance = 0;
    }
    
    handleTouchMove(e) {
        if (this.techTreeOpen) {
            e.preventDefault();
            return;
        }

        if (!this.gameStarted) {
            const rect = this.canvas.getBoundingClientRect();
            this.updateCorePlacementFromPoint(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
            e.preventDefault();
            return;
        }

        e.preventDefault();
        if (this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const currentX = e.touches[0].clientX - rect.left;
            const currentY = e.touches[0].clientY - rect.top;
            
            const deltaX = currentX - this.lastX;
            const deltaY = currentY - this.lastY;
            this.dragDistance += Math.hypot(deltaX, deltaY);
            
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            
            this.lastX = currentX;
            this.lastY = currentY;
            
            this.requestRender();
        }
    }
    
    handleTouchEnd(e) {
        if (this.techTreeOpen) {
            e.preventDefault();
            return;
        }

        if (!this.gameStarted) {
            if (this.corePlacementTile && this.gameState.isHomeCore(this.corePlacementTile.x, this.corePlacementTile.y)) {
                this.startGame();
            }

            if (e) {
                e.preventDefault();
            }
            return;
        }

        if (this.isDragging && this.pointerStart && this.dragDistance < 5) {
            this.handleTileClick(this.pointerStart.x, this.pointerStart.y);
        }

        this.isDragging = false;
        this.pointerStart = null;
        if (e) {
            e.preventDefault();
        }
    }

    handleTileClick(screenX, screenY) {
        const tile = this.getTileAtPosition(screenX, screenY);
        this.gameState.selectTile(tile.x, tile.y);
        this.handleInspectedTileAction(false);
    }

    handleSelectedTileAction() {
        this.handleInspectedTileAction(true);
    }

    handleInspectedTileAction(force = true) {
        if (this.techTreeOpen) {
            return;
        }

        const selected = this.getInspectedTile();
        this.gameState.selectTile(selected.x, selected.y);

        if (this.gameState.isHomeCore(selected.x, selected.y) && this.gameState.canLevelUpBase()) {
            this.levelUpBase();
        } else if (this.gameState.canClaim(selected.x, selected.y)) {
            this.gameState.claimTile(selected.x, selected.y);
        } else if (force) {
            this.gameState.selectTile(selected.x, selected.y);
        }

        this.requestHudUpdate();
        this.requestRender();
    }

    levelUpBase() {
        if (!this.gameState.levelUpBase()) {
            return;
        }

        this.hoveredTile = null;
        this.hoverAnimations = [];
        this.openTechTree();
    }

    openTechTree() {
        this.techTreeOpen = true;
        this.dom.techOverlay.hidden = false;
        this.updateTechTree();
    }

    closeTechTree() {
        this.techTreeOpen = false;
        this.dom.techOverlay.hidden = true;
        this.gameState.lastTick = 0;
        this.requestHudUpdate();
        this.requestRender();
    }
    
    centerView(animate = true) {
        const targetX = this.viewportWidth / 2;
        const targetY = this.viewportHeight / 2;

        if (!animate) {
            this.stopCenterAnimation();
            this.offsetX = targetX;
            this.offsetY = targetY;
            this.requestRender();
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
        return this.isoMath.getTileScreenPosition(tileX, tileY, this.offsetX, this.offsetY);
    }

    getTileEdgeLength() {
        return this.isoMath.getTileEdgeLength();
    }

    getGridCoordsFromScreen(screenX, screenY) {
        return this.isoMath.getGridCoordsFromScreen(screenX, screenY, this.offsetX, this.offsetY);
    }

    isPointInDiamond(px, py, tileX, tileY) {
        return this.isoMath.isPointInDiamond(px, py, tileX, tileY, this.offsetX, this.offsetY);
    }

    getTileAtPosition(x, y) {
        const objectTile = this.getObjectTileAtPosition(x, y);
        if (objectTile) {
            return objectTile;
        }

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

    getObjectTileAtPosition(x, y) {
        if (!this.gameStarted) {
            return null;
        }

        const point = { x, y };
        const viewport = {
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            width: this.viewportWidth,
            height: this.viewportHeight
        };
        const objects = IsoObjectLayout.sortObjects(this.getSceneObjects()).reverse();

        for (const object of objects) {
            if (!this.objectRenderer.isObjectNearViewport(object, viewport)) {
                continue;
            }

            const screenPos = this.getTileScreenPosition(object.x, object.y);
            if (object.type === 'cuboid' && IsoObjectLayout.isPointInCuboid(object, screenPos, point, this.tileWidth, this.tileHeight)) {
                return { x: object.x, y: object.y };
            }
        }

        return null;
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
        this.requestHudUpdate();
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
        if (this.gameStarted && !this.techTreeOpen) {
            this.gameState.tickFromTimestamp(timestamp);
        }
        const shouldAnimateLevelUpMarker = this.gameStarted && this.gameState.canLevelUpBase();

        const shouldRender = this.renderRequested ||
            stillAnimating ||
            shouldAnimateLevelUpMarker ||
            timestamp - this.lastCanvasRenderTime >= this.idleCanvasRenderInterval;
        const shouldUpdateHud = this.hudUpdateRequested ||
            timestamp - this.lastHudUpdateTime >= this.hudUpdateInterval;

        if (shouldRender) {
            this.render();
            this.renderRequested = false;
            this.lastCanvasRenderTime = timestamp;
        }

        if (shouldUpdateHud) {
            this.updateHud();
            this.hudUpdateRequested = false;
            this.lastHudUpdateTime = timestamp;
        }

        this.startAnimationLoop();
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
        this.ctx.fillStyle = this.themeTokens.canvasBackground;
        this.ctx.fillRect(0, 0, this.viewportWidth, this.viewportHeight);
        
        const { startX, endX, startY, endY } = this.getVisibleTiles();
        
        // Render grid tiles
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                this.drawTile(x, y);
            }
        }

        this.drawSceneItems(startX, endX, startY, endY);
        this.drawLevelUpMarker();
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
        this.ctx.fillStyle = this.themeTokens.homeMarkerFill;
        this.ctx.strokeStyle = this.themeTokens.homeMarkerStroke;
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
        if (!this.gameStarted) {
            return this.gameState.isHomeCore(x, y)
                ? this.themeTokens.tileHome
                : this.themeTokens.tileRevealed;
        }

        if (!this.gameState.isRevealed(x, y)) {
            return this.themeTokens.tileUnrevealed;
        }

        if (this.gameState.isHomeCore(x, y)) {
            return this.themeTokens.tileHome;
        }

        if (this.gameState.isClaimed(x, y)) {
            return this.themeTokens.tileClaimed;
        }

        if (this.gameState.canClaim(x, y)) {
            return this.themeTokens.tileFrontier;
        }

        return this.themeTokens.tileRevealed;
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

        return `${this.themeTokens.hoverFallback}${hoverAlpha * 0.7})`;
    }
    
    drawTile(x, y) {
        const baseColor = this.getTileBaseColor(x, y);
        const hoverAlpha = this.getHoverAlphaForTile(x, y);
        const fillStyle = hoverAlpha > 0
            ? this.getHoverFillStyle(baseColor, hoverAlpha)
            : this.getBaseFillStyle(baseColor);

        this.tileRenderer.drawTile(x, y, {
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            width: this.viewportWidth,
            height: this.viewportHeight
        }, fillStyle);
    }

    getSceneObjects() {
        const coreTile = this.gameStarted
            ? { x: 0, y: 0 }
            : this.corePlacementTile;

        return [{
            type: 'cuboid',
            x: coreTile.x,
            y: coreTile.y,
            height: this.getCoreLevelHeight(),
            levels: this.gameState.baseLevel,
            material: 'blueBlock'
        }];
    }

    getCoreLevelHeight() {
        return 12;
    }

    drawLevelUpMarker() {
        if (!this.gameStarted || !this.gameState.canLevelUpBase()) {
            return;
        }

        const screenPos = this.getTileScreenPosition(0, 0);
        const bob = Math.sin(this.lastAnimationTime / 260) * 3;
        const x = screenPos.x;
        const stackTopY = screenPos.y - this.gameState.baseLevel * this.getCoreLevelHeight() - this.tileHeight / 2;
        const y = stackTopY + this.tileHeight / 8 + bob;

        this.ctx.save();
        this.ctx.shadowColor = this.themeTokens.levelUpMarkerGlow;
        this.ctx.shadowBlur = 12;
        this.ctx.fillStyle = this.themeTokens.levelUpMarkerFill;
        this.ctx.strokeStyle = this.themeTokens.levelUpMarkerStroke;
        this.ctx.lineWidth = 2;
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 9, y + 5);
        this.ctx.lineTo(x, y - 6);
        this.ctx.lineTo(x + 9, y + 5);
        this.ctx.lineTo(x + 5, y + 5);
        this.ctx.lineTo(x, y - 1);
        this.ctx.lineTo(x - 5, y + 5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawSceneItems(startX, endX, startY, endY) {
        const viewport = {
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            width: this.viewportWidth,
            height: this.viewportHeight
        };
        const items = this.getSceneObjects()
            .filter((object) => this.objectRenderer.isObjectNearViewport(object, viewport))
            .map((object) => ({
                kind: 'object',
                x: object.x,
                y: object.y,
                object
            }));

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const marker = this.getResourceMarker(x, y);
                if (marker) {
                    items.push(marker);
                }
            }
        }

        for (const item of IsoObjectLayout.sortSceneItems(items)) {
            if (item.kind === 'object') {
                this.objectRenderer.drawObject(item.object, this.offsetX, this.offsetY);
            } else if (item.kind === 'glyph') {
                this.glyphRenderer.drawResourceMarker(this.ctx, item.resource, item.screenX, item.screenY, item.claimed);
            }
        }
    }

    getResourceMarker(x, y) {
        if (!this.gameStarted) {
            return null;
        }

        if (!this.gameState.isRevealed(x, y)) {
            return null;
        }

        const resource = IdleGameState.getResourceAt(x, y);
        if (!resource) {
            return null;
        }

        const screenPos = this.getTileScreenPosition(x, y);

        return {
            kind: 'glyph',
            x,
            y,
            resource,
            screenX: screenPos.x,
            screenY: screenPos.y,
            claimed: this.gameState.isClaimed(x, y)
        };
    }

    updateHud() {
        if (!this.dom) {
            return;
        }

        const rates = this.gameState.getProductionRates();
        const xpRequired = this.gameState.getBaseXpRequired();
        const selected = this.gameState.getTileDetails(this.getInspectedTile().x, this.getInspectedTile().y);

        this.dom.energyValue.textContent = this.formatNumber(this.gameState.energy);
        this.dom.energyRate.textContent = `+${this.formatRate(rates.energy)}/s`;
        this.dom.researchValue.textContent = this.formatNumber(this.gameState.research);
        this.dom.researchRate.textContent = `+${this.formatRate(rates.research)}/s`;
        this.dom.baseLevel.textContent = `Level ${this.gameState.baseLevel}`;
        this.dom.baseXp.textContent = `${this.formatNumber(this.gameState.baseXp)} / ${this.formatNumber(xpRequired)} XP`;
        this.dom.xpFill.style.width = `${Math.min(this.gameState.baseXp / xpRequired, 1) * 100}%`;
        this.dom.centerButton.classList.toggle('level-ready', this.gameStarted && this.gameState.canLevelUpBase());
        this.updateSelectedPanel(selected);
        this.updateTechTree();
    }

    getInspectedTile() {
        return this.hoveredTile || this.gameState.selectedTile;
    }

    updateSelectedPanel(selected) {
        const resourceText = selected.resource
            ? this.getResourceBenefitText(selected.resource, selected.isClaimed)
            : 'No resource node';

        this.dom.tileTitle.textContent = selected.isHomeCore
            ? 'Blue Core'
            : `Tile ${selected.x}, ${selected.y}`;

        if (!selected.isRevealed) {
            this.dom.tileDetails.textContent = 'Unrevealed territory.';
        } else if (selected.isHomeCore) {
            const rates = this.gameState.getProductionRates();
            this.dom.tileDetails.textContent = `Reveal radius ${this.gameState.getGlobalRevealRadius()}. Output +${this.formatRate(rates.homeEnergy)} Energy/s.`;
        } else {
            const claimCost = this.formatNumber(selected.claimCost);
            const costText = selected.isClaimed ? 'No claim cost' : `Cost ${claimCost} Energy`;
            const statusText = selected.isClaimed ? 'Claimed' : selected.isAdjacent ? 'Adjacent frontier' : 'Needs connection';
            this.dom.tileDetails.textContent = `${statusText}. ${costText}. Distance ${selected.distance}. ${resourceText}.`;
        }

        if (selected.isHomeCore && this.gameState.canLevelUpBase()) {
            this.dom.tileAction.textContent = `Level Up Base`;
            this.dom.tileAction.disabled = false;
        } else if (selected.canClaim) {
            this.dom.tileAction.textContent = `Claim (${this.formatNumber(selected.claimCost)} Energy)`;
            this.dom.tileAction.disabled = false;
        } else if (!selected.isClaimed && selected.isRevealed && selected.isAdjacent) {
            this.dom.tileAction.textContent = `Need ${this.formatNumber(selected.claimCost)} Energy`;
            this.dom.tileAction.disabled = true;
        } else {
            this.dom.tileAction.textContent = selected.isClaimed ? 'Claimed' : 'Select adjacent frontier';
            this.dom.tileAction.disabled = true;
        }
    }

    getResourceBenefitText(resource, isClaimed) {
        const rate = resource.rate * this.gameState.getTechMultiplier(resource.type);
        const resourceName = this.capitalize(resource.type);
        const verb = isClaimed ? 'Producing' : 'Claim benefit';

        return `${resourceName} node T${resource.tier}. ${verb}: +${this.formatRate(rate)}/${resource.type === 'energy' ? 's Energy' : 's Research'}`;
    }

    updateTechTree() {
        if (!this.dom.techButtons) {
            return;
        }

        const labels = {
            energy: this.dom.techEnergy,
            research: this.dom.techResearch
        };
        const maxLevel = this.gameState.getMaxTechLevel();

        this.dom.techTitle.textContent = `Level ${this.gameState.baseLevel} Tech Tree`;
        this.dom.techPoints.textContent = `${this.formatNumber(this.gameState.research)} Research`;
        this.dom.techAward.textContent = `Level-up award: +${this.formatNumber(this.gameState.lastLevelResearchAward)} Research. Run resources reset; Blue Core level and tech remain.`;

        for (const button of this.dom.techButtons) {
            const tech = button.dataset.tech;
            const level = this.gameState.techs[tech];
            const cost = this.gameState.getTechCost(tech);
            const multiplier = this.gameState.getTechMultiplier(tech);

            labels[tech].textContent = level >= maxLevel
                ? `Level ${level} max for Core ${this.gameState.baseLevel} - x${multiplier.toFixed(2)}`
                : `Level ${level} - ${this.formatNumber(cost)} Research - x${multiplier.toFixed(2)}`;
            button.disabled = !this.gameState.canUpgradeTech(tech);
        }
    }

    formatNumber(value) {
        if (!Number.isFinite(value)) {
            return '∞';
        }

        const absValue = Math.abs(value);
        const sign = value < 0 ? '-' : '';
        const suffixes = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

        if (absValue < 10) {
            return `${sign}${absValue.toFixed(2)}`;
        }

        if (absValue < 100) {
            return `${sign}${absValue.toFixed(1)}`;
        }

        if (absValue < 1000) {
            return `${sign}${Math.floor(absValue)}`;
        }

        const magnitude = Math.floor(Math.log10(absValue) / 3);
        if (magnitude >= suffixes.length) {
            return value.toExponential(2);
        }

        const scaled = absValue / Math.pow(1000, magnitude);
        const precision = scaled < 10 ? 2 : scaled < 100 ? 1 : 0;

        return `${sign}${scaled.toFixed(precision)}${suffixes[magnitude]}`;
    }

    formatRate(value) {
        return this.formatNumber(value);
    }

    capitalize(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
}

// Initialize grid when page loads
let isoGrid;

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    isoGrid = new IsoGrid(canvas);
});
