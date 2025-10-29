/**
 * ArbitroBot Mind Map Render Module
 * Handles: Rendering Nodes/Links, Event Listeners, Interactions
 */

const MindMapRender = {
    /**
     * Render the mind map
     */
    render(core) {
        // Clear existing content
        core.contentGroup.innerHTML = '';

        // Render links first (so they appear behind nodes)
        core.links.forEach(link => this.renderLink(core, link));

        // Render nodes (initially hidden for animation)
        core.nodes.forEach(node => this.renderNode(core, node));

        // Animate nodes after rendering
        this.animateNodes(core);
    },

    /**
     * Render a link between nodes
     */
    renderLink(core, link) {
        const sourceNode = core.nodes.find(n => n.id === link.source);
        const targetNode = core.nodes.find(n => n.id === link.target);

        if (!sourceNode || !targetNode) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        // Determine link type and apply appropriate styling
        const linkType = this.getLinkType(link.source, link.target);
        const linkClasses = ['mindmap-link', linkType.class];

        line.setAttribute('class', linkClasses.join(' '));
        line.setAttribute('x1', sourceNode.x);
        line.setAttribute('y1', sourceNode.y);
        line.setAttribute('x2', targetNode.x);
        line.setAttribute('y2', targetNode.y);
        line.setAttribute('data-source', link.source);
        line.setAttribute('data-target', link.target);
        line.setAttribute('stroke', linkType.color);
        line.setAttribute('stroke-width', linkType.width);

        core.contentGroup.appendChild(line);
    },

    /**
     * Determine link type and styling based on source/target nodes
     */
    getLinkType(source, target) {
        // Вертикальная временная ось (зеленая, жирная)
        const timelineLinks = [
            'step3-week1_step3-week2',
            'step3-week2_step3-week3',
            'step3-week3_step3-week4',
            'step3-week4_step3-week5',
            'step3-week5_step3-month3'
        ];
        const linkId = `${source}_${target}`;

        if (timelineLinks.includes(linkId)) {
            return { class: 'link-timeline-axis', color: '#22c55e', width: 3 };
        }

        // Главная связь (Месяц 3 → ARBITRAGEBOT) - голубая с свечением
        if (source === 'step3-month3' && target === 'core') {
            return { class: 'link-main', color: '#06b6d4', width: 4 };
        }

        // Колонка 1 → Колонка 2 (синие)
        if (source.includes('step1-') || source.includes('step2-')) {
            return { class: 'link-requirement', color: '#3b82f6', width: 2 };
        }

        // Колонка 2 → Колонка 3 (зеленые)
        if (source.includes('step3-') && target.includes('step4-')) {
            return { class: 'link-timeline', color: '#10b981', width: 2 };
        }

        // Колонка 3 → Колонка 4 (красные)
        if (source.includes('step4-') && target.includes('step5-')) {
            return { class: 'link-rule', color: '#ef4444', width: 2 };
        }

        // Колонка 4 → Колонка 5 (оранжевые)
        if (source.includes('step5-') && target === 'core') {
            return { class: 'link-result', color: '#f59e0b', width: 2 };
        }

        // Остальные связи
        return { class: 'link-default', color: 'rgba(100, 100, 100, 0.3)', width: 2 };
    },

    /**
     * Render a node
     */
    renderNode(core, node) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', `mindmap-node node-${node.type}`);
        group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        group.setAttribute('data-node-id', node.id);
        group.style.cursor = 'move';

        // Node circle with smooth transitions
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('r', this.getNodeRadius(node.type));
        circle.setAttribute('fill', this.getNodeFill(node.type));
        circle.setAttribute('stroke', this.getNodeStroke(node.type));

        // Add glow effect for core node
        if (node.type === 'core') {
            circle.setAttribute('filter', 'url(#glow)');
        }

        group.appendChild(circle);

        // Node icon (SVG image or text fallback)
        if (node.svgIcon) {
            const iconSize = node.type === 'core' ? 60 : 28;  // 40 * 1.5 = 60 для core
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            icon.setAttribute('href', node.svgIcon);
            icon.setAttribute('x', -iconSize / 2);
            icon.setAttribute('y', -iconSize / 2);
            icon.setAttribute('width', iconSize);
            icon.setAttribute('height', iconSize);
            icon.setAttribute('class', 'node-icon-svg');
            icon.setAttribute('pointer-events', 'none');
            group.appendChild(icon);
        } else if (node.icon) {
            // Fallback to emoji/text icon
            const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            icon.setAttribute('text-anchor', 'middle');
            icon.setAttribute('dy', '0.35em');
            icon.setAttribute('class', 'node-icon');
            icon.setAttribute('font-size', node.type === 'core' ? '54' : '24');  // 36 * 1.5 = 54 для core
            icon.setAttribute('fill', '#fff');
            icon.textContent = node.icon;
            icon.setAttribute('pointer-events', 'none');
            group.appendChild(icon);
        }

        // Node label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('dy', this.getNodeRadius(node.type) + 20);
        label.setAttribute('class', 'node-label');
        label.textContent = node.label;
        label.setAttribute('pointer-events', 'none');
        group.appendChild(label);

        // Node description (multiline, shown on hover)
        if (node.description) {
            const lines = node.description.split('\n');
            const startY = this.getNodeRadius(node.type) + 40;
            lines.forEach((line, index) => {
                const desc = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                desc.setAttribute('text-anchor', 'middle');
                desc.setAttribute('y', startY + (index * 16));
                desc.setAttribute('class', 'node-description');
                desc.textContent = line;
                desc.setAttribute('pointer-events', 'none');
                group.appendChild(desc);
            });
        }

        // Event listeners
        group.addEventListener('mouseenter', () => this.onNodeHover(core, node, group, true));
        group.addEventListener('mouseleave', () => this.onNodeHover(core, node, group, false));
        group.addEventListener('mousedown', (e) => this.onNodeDragStart(core, e, node, group));

        // Touch support
        group.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.onNodeDragStart(core, e.touches[0], node, group);
            }
        }, { passive: true });

        // Initially hide node for animation
        group.style.opacity = '0';
        group.style.transform = `translate(${node.x}, ${node.y}) scale(0.5)`;

        core.contentGroup.appendChild(group);
    },

    /**
     * Animate nodes sequentially by column (left to right)
     */
    animateNodes(core) {
        // Define animation sequence by column
        const animationSequence = [
            // Колонка 1: Входные требования (синие)
            ['step1-plex', 'step2-deposit', 'step1-rabbits', 'step2-commission'],

            // Колонка 2: Временная шкала (зеленые, снизу вверх!)
            ['step3-week1', 'step3-week2', 'step3-week3', 'step3-week4', 'step3-week5', 'step3-month3'],

            // Колонка 3: Железные правила (красные)
            ['step4-rule1', 'step4-rule2', 'step4-rule3'],

            // Колонка 4: Результаты (оранжевые)
            ['step5-profit', 'step5-growth', 'step5-total'],

            // Колонка 5: Конечная цель (голубой)
            ['core']
        ];

        animationSequence.forEach((column, colIndex) => {
            column.forEach((nodeId, nodeIndex) => {
                const nodeElement = core.contentGroup.querySelector(`[data-node-id="${nodeId}"]`);
                if (!nodeElement) return;

                const node = core.nodes.find(n => n.id === nodeId);
                if (!node) return;

                // Calculate delay: column delay + node delay within column
                const delay = (colIndex * 600) + (nodeIndex * 150);

                setTimeout(() => {
                    nodeElement.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    nodeElement.style.opacity = '1';
                    nodeElement.style.transform = `translate(${node.x}, ${node.y}) scale(1)`;
                }, delay);
            });
        });

        // Calculate total animation time and show links after
        const totalDelay = animationSequence.length * 600;
        setTimeout(() => {
            // Animate links appearance
            const links = core.contentGroup.querySelectorAll('.mindmap-link');
            links.forEach((link, index) => {
                link.style.opacity = '0';
                setTimeout(() => {
                    link.style.transition = 'opacity 0.5s ease';
                    link.style.opacity = '';
                }, index * 30);
            });
        }, totalDelay);
    },

    /**
     * Get node radius based on type
     */
    getNodeRadius(type) {
        const radii = {
            core: 75,        // 50 * 1.5 = 75 (ARBITRAGEBOT в 1.5 раза больше)
            requirement: 38,
            timeline: 35,
            rule: 35,
            result: 40,
            // Legacy types (fallback)
            page: 40,
            feature: 30,
            data: 30,
            condition: 30
        };
        return radii[type] || 30;
    },

    /**
     * Get node fill color based on type
     */
    getNodeFill(type) {
        const fills = {
            core: 'url(#coreGradient)',
            requirement: 'url(#requirementGradient)',
            timeline: 'url(#timelineGradient)',
            rule: 'url(#ruleGradient)',
            result: 'url(#resultGradient)',
            // Legacy types (fallback)
            page: 'url(#pageGradient)',
            feature: 'url(#featureGradient)',
            data: 'url(#dataGradient)',
            condition: 'url(#conditionGradient)'
        };
        return fills[type] || 'url(#featureGradient)';
    },

    /**
     * Get node stroke color based on type
     */
    getNodeStroke(type) {
        const strokes = {
            core: '#00D9FF',
            requirement: '#3b82f6',
            timeline: '#22c55e',
            rule: '#ef4444',
            result: '#fbbf24',
            // Legacy types (fallback)
            page: '#4a9eff',
            feature: '#51cf66',
            data: '#ffd93d',
            condition: '#9D4EDD'
        };
        return strokes[type] || '#51cf66';
    },

    /**
     * Handle node hover with smooth animations
     */
    onNodeHover(core, node, group, isHover) {
        // Add/remove hover class for CSS transitions
        if (isHover) {
            group.classList.add('hovered');
        } else {
            group.classList.remove('hovered');
        }

        // Highlight connected links
        const links = core.contentGroup.querySelectorAll('.mindmap-link');
        links.forEach(link => {
            const source = link.getAttribute('data-source');
            const target = link.getAttribute('data-target');

            if (source === node.id || target === node.id) {
                if (isHover) {
                    link.classList.add('highlighted');
                } else {
                    link.classList.remove('highlighted');
                }
            }
        });
    },

    /**
     * Handle node drag start
     */
    onNodeDragStart(core, event, node, group) {
        event.stopPropagation();

        core.isDragging = true;
        core.draggedNode = { node, group };

        // Get mouse/touch position
        const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches.length > 0 ? event.touches[0].clientX : 0);
        const clientY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches.length > 0 ? event.touches[0].clientY : 0);

        // Convert to SVG coordinates
        const pt = core.svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgP = pt.matrixTransform(core.contentGroup.getScreenCTM().inverse());

        core.dragStartX = svgP.x - node.x;
        core.dragStartY = svgP.y - node.y;

        // Add dragging class for visual feedback
        group.classList.add('dragging');
    },

    /**
     * Handle mouse move
     */
    onMouseMove(core, event) {
        if (!core.isDragging && !core.isPanning) return;

        // Get mouse/touch position
        const clientX = event.clientX !== undefined ? event.clientX : (event.touches && event.touches.length > 0 ? event.touches[0].clientX : 0);
        const clientY = event.clientY !== undefined ? event.clientY : (event.touches && event.touches.length > 0 ? event.touches[0].clientY : 0);

        if (core.isDragging && core.draggedNode) {
            // Node dragging
            const pt = core.svg.createSVGPoint();
            pt.x = clientX;
            pt.y = clientY;
            const svgP = pt.matrixTransform(core.contentGroup.getScreenCTM().inverse());

            const newX = svgP.x - core.dragStartX;
            const newY = svgP.y - core.dragStartY;

            // Update node position
            core.draggedNode.node.x = newX;
            core.draggedNode.node.y = newY;

            // Update visual position with SVG transform
            core.draggedNode.group.setAttribute('transform', `translate(${newX}, ${newY})`);

            // Update connected links
            this.updateLinksForNode(core, core.draggedNode.node);
        } else if (core.isPanning) {
            // Pan the view
            const dx = clientX - core.panStartX;
            const dy = clientY - core.panStartY;

            core.targetX = core.panStartOffsetX + dx;
            core.targetY = core.panStartOffsetY + dy;
        }
    },

    /**
     * Update links connected to a node
     */
    updateLinksForNode(core, node) {
        const links = core.contentGroup.querySelectorAll('.mindmap-link');
        links.forEach(link => {
            const source = link.getAttribute('data-source');
            const target = link.getAttribute('data-target');

            if (source === node.id) {
                link.setAttribute('x1', node.x);
                link.setAttribute('y1', node.y);
            }
            if (target === node.id) {
                link.setAttribute('x2', node.x);
                link.setAttribute('y2', node.y);
            }
        });
    },

    /**
     * Handle mouse up
     */
    onMouseUp(core) {
        if (core.draggedNode) {
            core.draggedNode.group.classList.remove('dragging');
        }

        core.isDragging = false;
        core.isPanning = false;
        core.draggedNode = null;
    },

    /**
     * Setup event listeners
     */
    setupEventListeners(core) {
        // Zoom buttons with smooth animation
        document.getElementById('mindmapZoomIn')?.addEventListener('click', () => core.smoothZoom(1.3));
        document.getElementById('mindmapZoomOut')?.addEventListener('click', () => core.smoothZoom(0.7));
        document.getElementById('mindmapReset')?.addEventListener('click', () => core.reset());
        document.getElementById('mindmapCenter')?.addEventListener('click', () => core.centerView());

        // Mouse wheel zoom (throttled)
        core.svg.addEventListener('wheel', (e) => this.onWheel(core, e), { passive: false });

        // Mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(core, e));
        document.addEventListener('mouseup', () => this.onMouseUp(core));

        // Touch events for panning and dragging
        document.addEventListener('touchmove', (e) => {
            if (core.isPinching) {
                e.preventDefault();
                this.onTouchMove(core, e);
            } else if (core.isDragging || core.isPanning) {
                e.preventDefault();
                this.onMouseMove(core, e);
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            this.onTouchEnd(core, e);
            this.onMouseUp(core);
        });

        // Pan on SVG background (mouse)
        core.svg.addEventListener('mousedown', (e) => {
            if (e.target === core.svg || e.target.closest('#mindmapContent') === core.contentGroup) {
                core.isPanning = true;
                core.panStartX = e.clientX;
                core.panStartY = e.clientY;
                core.panStartOffsetX = core.currentX;
                core.panStartOffsetY = core.currentY;
                core.svg.style.cursor = 'grabbing';
            }
        });

        core.svg.addEventListener('mouseup', () => {
            core.svg.style.cursor = 'grab';
        });

        // Touch events for SVG (panning and pinch-to-zoom)
        core.svg.addEventListener('touchstart', (e) => {
            this.onTouchStart(core, e);
        }, { passive: false });
    },

    /**
     * Handle mouse wheel with throttling
     */
    onWheel(core, event) {
        event.preventDefault();

        const now = Date.now();
        if (now - core.lastWheelTime < core.wheelThrottle) {
            return;
        }
        core.lastWheelTime = now;

        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        core.smoothZoom(delta);
    },

    /**
     * Handle touch start for pinch-to-zoom and panning
     */
    onTouchStart(core, event) {
        const touches = event.touches;

        if (touches.length === 2) {
            // Two-finger touch = pinch-to-zoom
            event.preventDefault();
            core.isPinching = true;
            core.touches = Array.from(touches);

            // Calculate initial distance between two fingers
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            core.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
        } else if (touches.length === 1) {
            // Single touch = pan
            if (event.target === core.svg || event.target.closest('#mindmapContent') === core.contentGroup) {
                core.isPanning = true;
                core.panStartX = touches[0].clientX;
                core.panStartY = touches[0].clientY;
                core.panStartOffsetX = core.currentX;
                core.panStartOffsetY = core.currentY;
            }
        }
    },

    /**
     * Handle touch move for pinch-to-zoom
     */
    onTouchMove(core, event) {
        if (!core.isPinching || event.touches.length !== 2) {
            return;
        }

        event.preventDefault();

        const touches = event.touches;

        // Calculate current distance between two fingers
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);

        // Calculate zoom factor based on distance change
        if (core.lastPinchDistance > 0) {
            const scale = currentDistance / core.lastPinchDistance;
            core.smoothZoom(scale);
        }

        core.lastPinchDistance = currentDistance;
    },

    /**
     * Handle touch end
     */
    onTouchEnd(core, event) {
        if (event.touches.length < 2) {
            core.isPinching = false;
            core.lastPinchDistance = 0;
            core.touches = [];
        }

        if (event.touches.length === 0) {
            core.isPanning = false;
        }
    }
};

// Export to window for global access
if (typeof window !== 'undefined') {
    window.MindMapRender = MindMapRender;
}
