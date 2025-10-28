/**
 * ArbitroBot Mind Map Core Module
 * Handles: Initialization, Data Setup, Animation Loop, Transforms
 */

class MindMapCore {
    constructor() {
        this.svg = null;
        this.contentGroup = null;
        this.nodes = [];
        this.links = [];

        // Transform state
        this.currentScale = 1;
        this.targetScale = 1;
        this.currentX = 0;
        this.currentY = 0;
        this.targetX = 0;
        this.targetY = 0;

        // Animation state
        this.animationFrame = null;
        this.isAnimating = false;

        // Drag state
        this.isDragging = false;
        this.isPanning = false;
        this.draggedNode = null;
        this.dragStartX = 0;
        this.dragStartY = 0;

        // Viewport
        this.viewBoxWidth = 1400;
        this.viewBoxHeight = 900;

        // Throttle state
        this.lastWheelTime = 0;
        this.wheelThrottle = 16; // ~60fps

        // Touch/pinch state for mobile
        this.touches = [];
        this.lastPinchDistance = 0;
        this.isPinching = false;

        this.initialized = false;
    }

    /**
     * Smooth easing functions
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    /**
     * Interpolate between current and target values
     */
    lerp(start, end, alpha) {
        return start + (end - start) * alpha;
    }

    /**
     * Initialize the mind map
     */
    init() {
        if (this.initialized) return;

        this.svg = document.getElementById('mindmapSvg');
        this.contentGroup = document.getElementById('mindmapContent');

        if (!this.svg || !this.contentGroup) {
            console.error('Mind map SVG elements not found');
            return;
        }

        this.setupData();

        // Delegate rendering to render module
        if (window.MindMapRender) {
            window.MindMapRender.render(this);
            window.MindMapRender.setupEventListeners(this);
        }

        this.centerView();
        this.startAnimationLoop();

        this.initialized = true;
    }

    /**
     * Main animation loop for smooth 60fps animations
     */
    startAnimationLoop() {
        const animate = () => {
            // Smooth interpolation towards target
            const alpha = 0.2;

            this.currentScale = this.lerp(this.currentScale, this.targetScale, alpha);
            this.currentX = this.lerp(this.currentX, this.targetX, alpha);
            this.currentY = this.lerp(this.currentY, this.targetY, alpha);

            // Apply SVG transform
            this.applyTransform();

            // Continue animation loop
            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Apply transform to content group using SVG transform
     */
    applyTransform() {
        const transform = `translate(${this.currentX}, ${this.currentY}) scale(${this.currentScale})`;
        this.contentGroup.setAttribute('transform', transform);
    }

    /**
     * Setup mind map data structure - ArbitroBot User Journey to Profit
     */
    setupData() {
        // Define all nodes in the mind map
        this.nodes = [
            // ===== ЦЕНТРАЛЬНЫЙ УЗЕЛ =====
            {
                id: 'core',
                label: 'ARBITRAGEBOT',
                type: 'core',
                x: 700,
                y: 450,
                svgIcon: '/assets/icons-arbitrage/robot.svg',
                description: '30-72.8% доход в день\nВысокочастотный торговый бот'
            },

            // ===== УРОВЕНЬ 1: ВХОДНЫЕ ТРЕБОВАНИЯ =====
            {
                id: 'plex-holding',
                label: 'PLEX Холдинг',
                type: 'requirement',
                x: 350,
                y: 280,
                svgIcon: '/assets/icons-arbitrage/safe.svg',
                description: '5,000-25,000+ PLEX\nОпределяет количество сумм\n⚠️ Продажа = остановка бота'
            },
            {
                id: 'nft-rabbits',
                label: 'Кролики DEXRabbit',
                type: 'requirement',
                x: 1050,
                y: 280,
                svgIcon: '/assets/icons-arbitrage/rabbit.svg',
                description: '1-15+ кроликов NFT\nВторой фактор авторизации\n💰 Бонус: доход 500-1300% за 120 дней'
            },
            {
                id: 'deposit',
                label: 'Депозит USDT',
                type: 'requirement',
                x: 350,
                y: 620,
                svgIcon: '/assets/icons-arbitrage/coins.svg',
                description: 'От $100 до $10,000+\nРекомендуется $500-1,000\n🔄 Изменение = сброс прогресса'
            },
            {
                id: 'commission',
                label: 'Комиссия 10 PLEX/$1',
                type: 'requirement',
                x: 1050,
                y: 620,
                svgIcon: '/assets/icons-arbitrage/clock-coin.svg',
                description: 'Оплачивается КАЖДЫЙ ДЕНЬ\n📅 Без выходных и праздников\nНеуплата = остановка бота'
            },

            // ===== УРОВЕНЬ 2: ВРЕМЕННАЯ ШКАЛА =====
            {
                id: 'week1',
                label: 'Неделя 1',
                type: 'timeline',
                x: 1150,
                y: 200,
                svgIcon: '/assets/icons-arbitrage/sprout.svg',
                description: '0.5% в день\n$5/день при $1,000\nАдаптация системы'
            },
            {
                id: 'week2',
                label: 'Неделя 2',
                type: 'timeline',
                x: 1150,
                y: 280,
                svgIcon: '/assets/icons-arbitrage/young-tree.svg',
                description: '2% в день\n$20/день при $1,000\nОптимизация алгоритмов'
            },
            {
                id: 'week3',
                label: 'Неделя 3',
                type: 'timeline',
                x: 1150,
                y: 360,
                svgIcon: '/assets/icons-arbitrage/tree.svg',
                description: '4% в день\n$40/день при $1,000\nСтабильная работа'
            },
            {
                id: 'week4',
                label: 'Неделя 4',
                type: 'timeline',
                x: 1150,
                y: 440,
                svgIcon: '/assets/icons-arbitrage/fruit-tree.svg',
                description: '12% в день\n$120/день при $1,000\nПолная мощность'
            },
            {
                id: 'week5',
                label: 'Неделя 5+',
                type: 'timeline',
                x: 1150,
                y: 520,
                svgIcon: '/assets/icons-arbitrage/money-tree.svg',
                description: 'До 72.8% в день\nДо $728/день при $1,000\nПик доходности'
            },
            {
                id: 'month3',
                label: 'Месяц 3',
                type: 'timeline',
                x: 1150,
                y: 600,
                svgIcon: '/assets/icons-arbitrage/balance.svg',
                description: 'БЕЗУБЫТОК\nПокрытие всех затрат\nНачало чистой прибыли'
            },

            // ===== УРОВЕНЬ 3: ЖЕЛЕЗНЫЕ ПРАВИЛА =====
            {
                id: 'rule1',
                label: 'ЗАПРЕТ продажи',
                type: 'rule',
                x: 250,
                y: 350,
                svgIcon: '/assets/icons-arbitrage/stop.svg',
                description: 'Продал 1 PLEX из холдинга?\n→ Бот останавливается НАВСЕГДА\nПсихологический замок против продаж'
            },
            {
                id: 'rule2',
                label: 'Фиксированный депозит',
                type: 'rule',
                x: 250,
                y: 450,
                svgIcon: '/assets/icons-arbitrage/lock.svg',
                description: 'Изменил размер суммы?\n→ Прогресс недель сбрасывается\nМожно вывести отдельные суммы'
            },
            {
                id: 'rule3',
                label: 'Ежедневная оплата',
                type: 'rule',
                x: 250,
                y: 550,
                svgIcon: '/assets/icons-arbitrage/calendar.svg',
                description: 'Пропустил оплату комиссии?\n→ Бот останавливается\n→ Потеря времени в градации'
            },

            // ===== УРОВЕНЬ 4: ИТОГОВЫЕ РЕЗУЛЬТАТЫ =====
            {
                id: 'result-bot',
                label: 'Прибыль от бота',
                type: 'result',
                x: 450,
                y: 750,
                svgIcon: '/assets/icons-arbitrage/chart.svg',
                description: '~$360,000 за 6 месяцев\nПри депозите $1,000\nРеальная торговая прибыль'
            },
            {
                id: 'result-plex',
                label: 'Рост холдинга PLEX',
                type: 'result',
                x: 700,
                y: 750,
                svgIcon: '/assets/icons-arbitrage/rocket.svg',
                description: '15,000 PLEX × $50 = $750,000\nПрогнозируемый рост токена\nДолгосрочная инвестиция'
            },
            {
                id: 'result-total',
                label: 'ИТОГО',
                type: 'result',
                x: 950,
                y: 750,
                svgIcon: '/assets/icons-arbitrage/trophy.svg',
                description: '$1,100,000+ возможно\nROI: 110,150%\n⚠️ Требует терпения первые 2.5 месяца'
            },
        ];

        // Define connections between nodes
        this.links = [
            // Центр → Входные требования
            { source: 'core', target: 'plex-holding' },
            { source: 'core', target: 'nft-rabbits' },
            { source: 'core', target: 'deposit' },
            { source: 'core', target: 'commission' },

            // Центр → Временная шкала (последовательная)
            { source: 'core', target: 'week1' },
            { source: 'week1', target: 'week2' },
            { source: 'week2', target: 'week3' },
            { source: 'week3', target: 'week4' },
            { source: 'week4', target: 'week5' },
            { source: 'week5', target: 'month3' },

            // Центр → Железные правила
            { source: 'core', target: 'rule1' },
            { source: 'core', target: 'rule2' },
            { source: 'core', target: 'rule3' },

            // Правила связаны с требованиями
            { source: 'rule1', target: 'plex-holding' },
            { source: 'rule2', target: 'deposit' },
            { source: 'rule3', target: 'commission' },

            // Временная шкала → Результаты
            { source: 'month3', target: 'result-bot' },
            { source: 'month3', target: 'result-plex' },
            { source: 'result-bot', target: 'result-total' },
            { source: 'result-plex', target: 'result-total' },

            // Входные требования влияют на результаты
            { source: 'plex-holding', target: 'result-plex' },
            { source: 'deposit', target: 'result-bot' },
        ];
    }

    /**
     * Smooth zoom with target interpolation
     */
    smoothZoom(factor) {
        this.targetScale = Math.max(0.3, Math.min(3, this.targetScale * factor));
    }

    /**
     * Reset view
     */
    reset() {
        this.targetScale = 1;
        this.targetX = 0;
        this.targetY = 0;
    }

    /**
     * Center view on the core node
     */
    centerView() {
        const coreNode = this.nodes.find(n => n.id === 'core');
        if (!coreNode) return;

        const svgRect = this.svg.getBoundingClientRect();
        this.targetX = svgRect.width / 2 - coreNode.x;
        this.targetY = svgRect.height / 2 - coreNode.y;
        this.targetScale = 1;
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.initialized = false;
    }
}

// Export to window for global access
if (typeof window !== 'undefined') {
    window.MindMapCore = MindMapCore;
}
