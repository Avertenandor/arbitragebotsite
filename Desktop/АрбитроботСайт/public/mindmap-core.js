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
     * Setup mind map data structure - ArbitroBot specific
     */
    setupData() {
        // Define all nodes in the mind map
        this.nodes = [
            // Core
            { id: 'core', label: 'ArbitroBot', type: 'core', x: 700, y: 450, icon: '🤖', description: 'Арбитражная платформа' },

            // Main sections
            { id: 'monitoring', label: 'Мониторинг', type: 'page', x: 400, y: 250, icon: '📊', description: 'Real-time мониторинг' },
            { id: 'bot-control', label: 'Панель бота', type: 'page', x: 1000, y: 250, icon: '🎛️', description: 'Управление ботом' },
            { id: 'user-dashboard', label: 'Личный кабинет', type: 'page', x: 700, y: 150, icon: '👤', description: 'Dashboard пользователя' },
            { id: 'about', label: 'О проекте', type: 'page', x: 300, y: 450, icon: 'ℹ️', description: 'Информация' },
            { id: 'faq', label: 'FAQ', type: 'page', x: 1100, y: 450, icon: '❓', description: 'Частые вопросы' },

            // Monitoring features
            { id: 'real-time', label: 'Real-time данные', type: 'feature', x: 200, y: 150, icon: '⚡', description: 'WebSocket подключение' },
            { id: 'transactions', label: 'Транзакции', type: 'feature', x: 250, y: 350, icon: '📝', description: 'История операций' },
            { id: 'user-stats', label: 'Статистика', type: 'feature', x: 400, y: 100, icon: '📈', description: 'Аналитика пользователя' },

            // Bot control features
            { id: 'dashboard-tab', label: 'Dashboard', type: 'feature', x: 1150, y: 150, icon: '📊', description: 'Обзор состояния' },
            { id: 'wallet-tab', label: 'Кошелёк', type: 'feature', x: 1200, y: 250, icon: '💰', description: 'Управление средствами' },
            { id: 'scanner-tab', label: 'Сканер', type: 'feature', x: 1250, y: 350, icon: '🔍', description: 'Поиск возможностей' },
            { id: 'contract-tab', label: 'Контракты', type: 'feature', x: 900, y: 100, icon: '📄', description: 'Smart contracts' },
            { id: 'statistics-tab', label: 'Статистика', type: 'feature', x: 850, y: 200, icon: '📊', description: 'Детальная аналитика' },
            { id: 'decisions-tab', label: 'Решения', type: 'feature', x: 950, y: 350, icon: '🎯', description: 'Торговые решения' },
            { id: 'lists-tab', label: 'Списки токенов', type: 'feature', x: 1050, y: 400, icon: '📋', description: 'White/Black/Gray lists' },
            { id: 'arbitrage-tab', label: 'Арбитраж', type: 'feature', x: 1150, y: 500, icon: '💹', description: 'Арбитражные пары' },
            { id: 'node-tab', label: 'Ноды', type: 'feature', x: 1000, y: 550, icon: '🌐', description: 'RPC подключения' },
            { id: 'terminal-tab', label: 'Терминал', type: 'feature', x: 850, y: 500, icon: '💻', description: 'Консоль управления' },

            // Technology & Data sources
            { id: 'bsc', label: 'BNB Chain', type: 'data', x: 500, y: 700, icon: '⛓️', description: 'Blockchain сеть' },
            { id: 'websocket', label: 'WebSocket', type: 'data', x: 700, y: 750, icon: '🔌', description: 'Real-time соединение' },
            { id: 'api', label: 'REST API', type: 'data', x: 900, y: 700, icon: '🔗', description: 'HTTP API' },
            { id: 'dex', label: 'DEX биржи', type: 'data', x: 300, y: 700, icon: '🔄', description: 'PancakeSwap, Biswap' },

            // Conditions and Requirements
            { id: 'condition-access', label: 'Открытый доступ', type: 'condition', x: 150, y: 550, icon: '🔓', description: 'Без регистрации' },
            { id: 'condition-mobile', label: 'Мобильная версия', type: 'condition', x: 1250, y: 600, icon: '📱', description: 'Адаптивный дизайн' },
            { id: 'condition-flash', label: 'Flash Loans', type: 'condition', x: 500, y: 550, icon: '⚡', description: 'Безрисковые займы' },
            { id: 'condition-security', label: 'Безопасность', type: 'condition', x: 900, y: 600, icon: '🔐', description: 'Защита средств' },

            // User Journey
            { id: 'user-new', label: 'Новые пользователи', type: 'feature', x: 200, y: 600, icon: '👶', description: 'Начало работы' },
            { id: 'user-advanced', label: 'Опытные трейдеры', type: 'feature', x: 1100, y: 650, icon: '🎓', description: 'Расширенные функции' },
        ];

        // Define connections between nodes
        this.links = [
            // Core connections
            { source: 'core', target: 'monitoring' },
            { source: 'core', target: 'bot-control' },
            { source: 'core', target: 'user-dashboard' },
            { source: 'core', target: 'about' },
            { source: 'core', target: 'faq' },

            // Monitoring connections
            { source: 'monitoring', target: 'real-time' },
            { source: 'monitoring', target: 'transactions' },
            { source: 'monitoring', target: 'user-stats' },

            // Bot control connections
            { source: 'bot-control', target: 'dashboard-tab' },
            { source: 'bot-control', target: 'wallet-tab' },
            { source: 'bot-control', target: 'scanner-tab' },
            { source: 'bot-control', target: 'contract-tab' },
            { source: 'bot-control', target: 'statistics-tab' },
            { source: 'bot-control', target: 'decisions-tab' },
            { source: 'bot-control', target: 'lists-tab' },
            { source: 'bot-control', target: 'arbitrage-tab' },
            { source: 'bot-control', target: 'node-tab' },
            { source: 'bot-control', target: 'terminal-tab' },

            // Data source connections
            { source: 'real-time', target: 'websocket' },
            { source: 'scanner-tab', target: 'dex' },
            { source: 'arbitrage-tab', target: 'dex' },
            { source: 'wallet-tab', target: 'bsc' },
            { source: 'contract-tab', target: 'bsc' },
            { source: 'transactions', target: 'api' },
            { source: 'node-tab', target: 'bsc' },

            // Condition connections
            { source: 'monitoring', target: 'condition-access' },
            { source: 'core', target: 'condition-mobile' },
            { source: 'arbitrage-tab', target: 'condition-flash' },
            { source: 'wallet-tab', target: 'condition-security' },

            // User journey connections
            { source: 'user-new', target: 'monitoring' },
            { source: 'user-new', target: 'about' },
            { source: 'user-new', target: 'faq' },
            { source: 'user-advanced', target: 'bot-control' },
            { source: 'user-advanced', target: 'user-dashboard' },

            // Cross connections
            { source: 'user-dashboard', target: 'user-stats' },
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
