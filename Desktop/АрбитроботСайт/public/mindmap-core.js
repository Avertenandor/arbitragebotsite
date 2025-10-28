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
     * Setup mind map data structure - ArbitroBot Step-by-Step Journey
     */
    setupData() {
        // Define all nodes in the mind map
        // НОВАЯ СТРУКТУРА: шаги горизонтально слева направо, требования сверху/снизу, недели зигзагом
        this.nodes = [
            // ===== ШАГ 1: ПОДГОТОВКА (x=150) =====
            {
                id: 'step1-plex',
                label: 'ШАГ 1: PLEX Холдинг',
                type: 'requirement',
                x: 150,
                y: 250,
                svgIcon: '/assets/icons-arbitrage/safe.svg',
                description: '5,000-25,000+ PLEX\nОпределяет количество сумм\n⚠️ Продажа = остановка бота'
            },
            {
                id: 'step1-rabbits',
                label: 'ШАГ 1: Кролики',
                type: 'requirement',
                x: 150,
                y: 650,
                svgIcon: '/assets/icons-arbitrage/rabbit.svg',
                description: '1-15+ живых кроликов\nТокенизированная ферма\n💰 Дополнительный доход за 120 дней'
            },

            // ===== ШАГ 2: НАСТРОЙКА (x=350) =====
            {
                id: 'step2-deposit',
                label: 'ШАГ 2: Депозит',
                type: 'requirement',
                x: 350,
                y: 250,
                svgIcon: '/assets/icons-arbitrage/coins.svg',
                description: 'От $100 и выше\nРекомендуется $500-1,000\n🔄 Изменение = сброс прогресса'
            },
            {
                id: 'step2-commission',
                label: 'ШАГ 2: Комиссия',
                type: 'requirement',
                x: 350,
                y: 650,
                svgIcon: '/assets/icons-arbitrage/clock-coin.svg',
                description: '10 PLEX за каждый $1\nОплата КАЖДЫЙ ДЕНЬ\n📅 Без пропусков'
            },

            // ===== ШАГ 3: РАБОТА БОТА - НЕДЕЛИ ЗИГЗАГОМ (x=550-700) =====
            // Снизу вверх: 1-я внизу, 2-я правее, 3-я левее, 4-я правее, 5+ левее, месяц 3 правее
            {
                id: 'step3-week1',
                label: 'ШАГ 3: Неделя 1',
                type: 'timeline',
                x: 550,
                y: 750,
                svgIcon: '/assets/icons-arbitrage/sprout.svg',
                description: 'Начальная доходность\nАдаптация системы\nПервые результаты'
            },
            {
                id: 'step3-week2',
                label: 'Неделя 2',
                type: 'timeline',
                x: 700,
                y: 630,
                svgIcon: '/assets/icons-arbitrage/young-tree.svg',
                description: 'Рост доходности\nОптимизация алгоритмов\nУвеличение прибыли'
            },
            {
                id: 'step3-week3',
                label: 'Неделя 3',
                type: 'timeline',
                x: 550,
                y: 510,
                svgIcon: '/assets/icons-arbitrage/tree.svg',
                description: 'Стабильная работа\nУстойчивый рост\nРегулярная прибыль'
            },
            {
                id: 'step3-week4',
                label: 'Неделя 4',
                type: 'timeline',
                x: 700,
                y: 390,
                svgIcon: '/assets/icons-arbitrage/fruit-tree.svg',
                description: 'Полная мощность\nВысокая доходность\nМаксимальная эффективность'
            },
            {
                id: 'step3-week5',
                label: 'Неделя 5+',
                type: 'timeline',
                x: 550,
                y: 270,
                svgIcon: '/assets/icons-arbitrage/money-tree.svg',
                description: 'Пиковая доходность\nДо 72.8% в день\nСтабильная прибыль'
            },
            {
                id: 'step3-month3',
                label: 'Месяц 3',
                type: 'timeline',
                x: 700,
                y: 150,
                svgIcon: '/assets/icons-arbitrage/balance.svg',
                description: 'БЕЗУБЫТОК\nПокрытие всех затрат\nНачало чистой прибыли'
            },

            // ===== ШАГ 4: ВАЖНЫЕ ПРАВИЛА (x=900) =====
            {
                id: 'step4-rule1',
                label: 'ШАГ 4: Не продавать',
                type: 'rule',
                x: 900,
                y: 250,
                svgIcon: '/assets/icons-arbitrage/stop.svg',
                description: 'ЗАПРЕТ продажи PLEX\nПродал = бот остановится НАВСЕГДА\nПсихологический замок'
            },
            {
                id: 'step4-rule2',
                label: 'Не менять депозит',
                type: 'rule',
                x: 900,
                y: 450,
                svgIcon: '/assets/icons-arbitrage/lock.svg',
                description: 'Фиксированная сумма\nИзменение = сброс прогресса\nДисциплина важна'
            },
            {
                id: 'step4-rule3',
                label: 'Платить каждый день',
                type: 'rule',
                x: 900,
                y: 650,
                svgIcon: '/assets/icons-arbitrage/calendar.svg',
                description: 'Ежедневная комиссия\nПропуск = остановка бота\nБез выходных'
            },

            // ===== ШАГ 5: ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ (x=1100) =====
            {
                id: 'step5-profit',
                label: 'ШАГ 5: Прибыль',
                type: 'result',
                x: 1100,
                y: 250,
                svgIcon: '/assets/icons-arbitrage/chart.svg',
                description: 'Торговая прибыль\nРастет экспоненциально\nРеальный доход'
            },
            {
                id: 'step5-growth',
                label: 'Рост активов',
                type: 'result',
                x: 1100,
                y: 450,
                svgIcon: '/assets/icons-arbitrage/rocket.svg',
                description: 'Рост холдинга PLEX\nДолгосрочная инвестиция\nПотенциал роста токена'
            },
            {
                id: 'step5-total',
                label: 'ИТОГО',
                type: 'result',
                x: 1100,
                y: 650,
                svgIcon: '/assets/icons-arbitrage/trophy.svg',
                description: 'Значительная прибыль возможна\nВысокий потенциал ROI\n⚠️ Требует терпения и дисциплины'
            },

            // ===== ARBITRAGEBOT - ФИНАЛЬНЫЙ УЗЕЛ (x=1280) =====
            {
                id: 'core',
                label: 'ARBITRAGEBOT',
                type: 'core',
                x: 1280,
                y: 450,
                svgIcon: '/assets/icons-arbitrage/robot.svg',
                description: 'Доступ к боту\nВысокая доходность\nАвтоматический арбитраж'
            },
        ];

        // Define connections between nodes
        // НОВАЯ СТРУКТУРА СВЯЗЕЙ: горизонтальный поток слева направо
        this.links = [
            // ===== ШАГ 1: Требования связаны между собой =====
            { source: 'step1-plex', target: 'step1-rabbits' },

            // ===== ШАГ 1 → ШАГ 2 =====
            { source: 'step1-plex', target: 'step2-deposit' },
            { source: 'step1-rabbits', target: 'step2-commission' },

            // ===== ШАГ 2: Требования связаны между собой =====
            { source: 'step2-deposit', target: 'step2-commission' },

            // ===== ШАГ 2 → ШАГ 3 (начало работы бота) =====
            { source: 'step2-deposit', target: 'step3-week1' },
            { source: 'step2-commission', target: 'step3-week1' },

            // ===== ШАГ 3: Недели последовательно (зигзаг) =====
            { source: 'step3-week1', target: 'step3-week2' },
            { source: 'step3-week2', target: 'step3-week3' },
            { source: 'step3-week3', target: 'step3-week4' },
            { source: 'step3-week4', target: 'step3-week5' },
            { source: 'step3-week5', target: 'step3-month3' },

            // ===== ШАГ 3 → ШАГ 4 (важность правил) =====
            { source: 'step3-month3', target: 'step4-rule2' },

            // ===== ШАГ 4: Правила связаны между собой =====
            { source: 'step4-rule1', target: 'step4-rule2' },
            { source: 'step4-rule2', target: 'step4-rule3' },

            // ===== Правила связаны с входными требованиями (важность соблюдения) =====
            { source: 'step4-rule1', target: 'step1-plex' },
            { source: 'step4-rule3', target: 'step2-commission' },

            // ===== ШАГ 4 → ШАГ 5 (результаты) =====
            { source: 'step4-rule2', target: 'step5-growth' },

            // ===== ШАГ 5: Результаты связаны между собой =====
            { source: 'step5-profit', target: 'step5-growth' },
            { source: 'step5-growth', target: 'step5-total' },

            // ===== Временная шкала влияет на прибыль =====
            { source: 'step3-month3', target: 'step5-profit' },

            // ===== ШАГ 5 → ARBITRAGEBOT (финал - доступ к боту) =====
            { source: 'step5-profit', target: 'core' },
            { source: 'step5-total', target: 'core' },
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
