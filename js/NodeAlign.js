/*
 * NodeAlign.js
 * 
 * 节点对齐工具 - 用于 ComfyUI 的节点布局和对齐功能
 * 
 * 主要功能:
 * - 基础对齐：左对齐、右对齐、上对齐、下对齐、水平居中、垂直居中
 * - 等宽等高：设置所选节点相同宽度或高度
 * - 分布排列：水平均匀分布、垂直均匀分布
 * - 智能布局：基于连接关系的智能对齐和树状布局
 * - 相邻放置：快速将节点放置在右侧或下方
 * - 撤销重做：支持对齐操作的撤销和重做
 * - 界面控制：可拖拽的控制面板，支持永久显示或选择时显示
 * 
 * 使用方法:
 * 1. 选择多个节点
 * 2. 点击相应的对齐按钮或使用右键菜单
 * 3. 拖动控制面板调整位置
 */

import { SVG, STYLES } from './NodeAlignConstants.js';

/**
 * 节点对齐工具主对象
 * 
 * 该对象包含所有节点对齐相关的功能和状态管理
 */
const NodeAligner = {
    /**
     * 初始化状态标志
     * @type {boolean}
     */
    isInitialized: false,
    
    /**
     * 控制面板容器元素
     * @type {HTMLElement|null}
     */
    buttonContainer: null,
    
    /**
     * 是否永久显示控制面板
     * @type {boolean}
     */
    isPermanent: true,
    
    /**
     * 拖拽开始时的X坐标
     * @type {number}
     */
    dragStartX: 0,
    
    /**
     * 拖拽开始时的Y坐标
     * @type {number}
     */
    dragStartY: 0,
    
    /**
     * 是否正在拖拽控制面板
     * @type {boolean}
     */
    isDragging: false,
    
    /**
     * 绑定后的拖拽中事件处理函数
     * @type {Function|null}
     */
    boundOnDragging: null,
    
    /**
     * 绑定后的拖拽结束事件处理函数
     * @type {Function|null}
     */
    boundOnDragEnd: null,
    
    /**
     * 撤销操作栈
     * @type {Array}
     */
    undoStack: [],
    
    /**
     * 重做操作栈
     * @type {Array}
     */
    redoStack: [],
    
    /**
     * 撤销栈的最大大小
     * @type {number}
     */
    maxUndoStackSize: 50,
    
    /**
     * 控制面板是否可见
     * @type {boolean}
     */
    isVisible: false,
    
    /**
     * 是否由用户主动关闭控制面板
     * @type {boolean}
     */
    isClosedByUser: false,
    
    /**
     * 初始化节点对齐工具
     * 
     * 该方法负责：
     * 1. 创建并添加样式表
     * 2. 创建控制面板容器
     * 3. 绑定拖拽事件处理函数
     * 4. 创建所有对齐按钮
     * 5. 设置右键菜单选项
     * 6. 初始化状态和界面
     */
    init() {
        // 防止重复初始化
        if (this.isInitialized) {
            return;
        }
        
        // 创建并添加样式表
        const style = document.createElement('style');
        style.textContent = STYLES;
        document.head.appendChild(style);
        
        // 创建控制面板容器
        this.buttonContainer = document.createElement('div');
        this.buttonContainer.id = 'na-alignment-buttons';
        this.buttonContainer.style.position = 'fixed';
        this.buttonContainer.style.zIndex = '9999';
        this.buttonContainer.style.left = '0px';
        this.buttonContainer.style.top = '0px';
        this.buttonContainer.style.visibility = 'hidden';
        document.body.appendChild(this.buttonContainer);
        
        // 绑定拖拽事件处理函数
        this.boundOnDragging = this.onDragging.bind(this);
        this.boundOnDragEnd = this.onDragEnd.bind(this);
        this.buttonContainer.addEventListener('mousedown', this.onDragStart.bind(this));
        document.addEventListener('mousemove', this.boundOnDragging);
        document.addEventListener('mouseup', this.boundOnDragEnd);
        
        // 创建所有对齐按钮
        this.createButtons();
        
        // 设置右键菜单选项
        this.setupContextMenu();
        
        // 更新初始化状态
        this.isInitialized = true;
        
        // 设置初始可见性
        this.setInitialVisibility();
        
        // 初始化撤销重做功能
        this.initUndoRedo();
        
        // 更新切换按钮状态
        this.updateToggleButton();
    },
    
    /**
     * 初始化撤销重做功能
     * 
     * 目前为占位方法，可用于未来扩展
     */
    initUndoRedo() {
    },
    
    /**
     * 将操作添加到撤销栈
     * 
     * @param {Object} action - 要添加到撤销栈的操作对象，包含undo和redo方法
     */
    addToUndoStack(action) {
        this.undoStack.push(action);
        
        // 限制撤销栈大小
        if (this.undoStack.length > this.maxUndoStackSize) {
            this.undoStack.shift();
        }
        
        // 清空重做栈
        this.redoStack = [];
        
        // 更新撤销重做按钮状态
        this.updateUndoRedoButtons();
    },
    
    /**
     * 执行撤销或重做操作
     * 
     * @param {Array} fromStack - 源栈（撤销或重做栈）
     * @param {Array} toStack - 目标栈（重做或撤销栈）
     * @param {string} actionMethod - 要执行的方法名（'undo'或'redo'）
     */
    executeAction(fromStack, toStack, actionMethod) {
        if (fromStack.length === 0) return;
        
        const action = fromStack.pop();
        
        try {
            // 执行操作
            if (action && typeof action[actionMethod] === 'function') {
                action[actionMethod]();
                toStack.push(action);
            } else {
                console.warn(`Invalid action or missing ${actionMethod} method`);
                return;
            }
            
            // 更新画布
            try {
                this.updateCanvas();
            } catch (canvasError) {
                console.warn(`Error updating canvas after ${actionMethod}:`, canvasError);
            }
        } catch (error) {
            console.warn(`Error during ${actionMethod} operation:`, error);
            // 恢复操作到原栈
            fromStack.push(action);
        } finally {
            // 更新按钮状态
            this.updateUndoRedoButtons();
        }
    },
    
    /**
     * 执行撤销操作
     */
    undo() {
        this.executeAction(this.undoStack, this.redoStack, 'undo');
    },
    
    /**
     * 执行重做操作
     */
    redo() {
        this.executeAction(this.redoStack, this.undoStack, 'redo');
    },
    
    /**
     * 更新撤销和重做按钮的状态
     * 
     * 根据撤销栈和重做栈的大小启用或禁用按钮
     */
    updateUndoRedoButtons() {
        const undoButton = document.getElementById('undo');
        const redoButton = document.getElementById('redo');
        
        // 根据撤销栈是否为空启用或禁用撤销按钮
        if (undoButton) undoButton.disabled = this.undoStack.length === 0;
        // 根据重做栈是否为空启用或禁用重做按钮
        if (redoButton) redoButton.disabled = this.redoStack.length === 0;
    },
    
    /**
     * 创建所有对齐按钮
     * 
     * 从按钮配置中创建按钮和分隔符
     */
    createButtons() {
        const buttons = this.getButtons();
        
        buttons.forEach(btn => {
            if (btn.type === 'divider') {
                this.createDivider();
            } else {
                this.createButton(btn);
            }
        });
    },
    
    /**
     * 创建分隔符元素
     * 
     * 在控制面板中添加分隔线，用于分隔不同功能的按钮组
     */
    createDivider() {
        const divider = document.createElement('div');
        divider.classList.add('nd-divider');
        
        // 分隔符也可以用于拖拽控制面板
        divider.addEventListener('mousedown', this.onDragStart.bind(this));
        
        this.buttonContainer.appendChild(divider);
    },
    
    /**
     * 创建单个按钮元素
     * 
     * @param {Object} btn - 按钮配置对象，包含id、action等属性
     */
    createButton(btn) {
        const button = document.createElement('button');
        button.id = btn.id;
        button.classList.add('nd-button');
        
        // 设置按钮图标
        button.innerHTML = SVG[btn.id] || '';
        
        // 设置按钮提示文本
        button.title = this.getButtonTitle(btn.id);
        
        // 绑定点击事件
        button.addEventListener('click', (e) => {
            try {
                if (typeof btn.action === 'function') {
                    btn.action.call(this, e);
                }
                
                // 更新画布
                try {
                    this.updateCanvas();
                } catch (canvasError) {
                    console.warn(`Error updating canvas after button click:`, canvasError);
                }
            } catch (error) {
                console.warn(`Error executing action for button ${btn.id}:`, error);
            }
        });
        
        this.buttonContainer.appendChild(button);
    },
    
    /**
     * 获取按钮的标题文本
     * 
     * @param {string} buttonId - 按钮ID
     * @returns {string} 按钮的标题文本
     */
    getButtonTitle(buttonId) {
        const titles = {
            alignLeft: 'Align Left',
            alignCenterHorizontally: 'Center Horizontally',
            alignRight: 'Align Right',
            alignTop: 'Align Top',
            alignCenterVertically: 'Center Vertically',
            alignBottom: 'Align Bottom',
            horizontalDistribution: 'Distribute Horizontally',
            verticalDistribution: 'Distribute Vertically',
            equalWidth: 'Equal Width',
            equalHeight: 'Equal Height',
            undo: 'Undo',
            redo: 'Redo',
            smartAlign: 'Smart Align',
            treeView: 'Tree View',
            placeRight: 'Place Right (chain)',
            placeBelow: 'Place Below (chain)',
            toggleMode: 'Toggle Mode'
        };
        return titles[buttonId] || '';
    },
    
    /**
     * 获取所有按钮的配置
     * 
     * 返回按钮配置数组，包含按钮ID和对应的操作
     * 
     * @returns {Array} 按钮配置数组
     */
    getButtons() {
        return [
            // 基础对齐按钮
            { id: 'alignLeft', action: () => this._handleAlignmentAction('alignLeft') },
            { id: 'alignCenterHorizontally', action: () => this._handleAlignmentAction('alignCenterHorizontally') },
            { id: 'alignRight', action: () => this._handleAlignmentAction('alignRight') },
            { id: 'alignTop', action: () => this._handleAlignmentAction('alignTop') },
            { id: 'alignCenterVertically', action: () => this._handleAlignmentAction('alignCenterVertically') },
            { id: 'alignBottom', action: () => this._handleAlignmentAction('alignBottom') },
            
            // 等宽等高按钮
            { id: 'equalWidth', action: () => this._handleAlignmentAction('equalWidth') },
            { id: 'equalHeight', action: () => this._handleAlignmentAction('equalHeight') },
            
            // 分布排列按钮
            { id: 'horizontalDistribution', action: this.horizontalDistribution },
            { id: 'verticalDistribution', action: this.verticalDistribution },
            
            // 撤销重做按钮
            { id: 'undo', action: this.undo },
            { id: 'redo', action: this.redo },
            
            // 智能布局按钮
            { id: 'smartAlign', action: this.smartAlign },
            { id: 'treeView', action: this.treeView },
            
            // 相邻放置按钮
            { id: 'placeRight', action: () => this.placeAdjacent('right') },
            { id: 'placeBelow', action: () => this.placeAdjacent('below') },
            
            // 界面控制按钮
            { id: 'toggleMode', action: this.toggleMode },
            
            // 分隔符
            { type: 'divider' },
            
            // 关闭按钮
            { id: 'close', action: this.close }
        ];
    },
    
    /**
     * 切换控制面板的显示模式
     * 
     * 在永久显示和仅选择时显示之间切换
     */
    toggleMode() {
        // 切换模式标志
        this.isPermanent = !this.isPermanent;
        
        // 保存模式设置到本地存储
        localStorage.setItem('NodeAlignerIsPermanent', this.isPermanent ? '1' : '0');
        
        // 如果切换到非永久模式且选择节点少于2个，则隐藏控制面板
        if (!this.isPermanent) {
            const selectedNodes = this.getSelectedNodes();
            if (selectedNodes.length < 2) {
                this.hide();
            }
        }
        
        // 更新切换按钮状态
        this.updateToggleButton();
    },
    
    /**
     * 更新切换模式按钮的状态
     * 
     * 根据当前模式更新按钮的样式和提示文本
     */
    updateToggleButton() {
        const toggleButton = document.getElementById('toggleMode');
        
        if (toggleButton) {
            // 根据模式添加或移除active类
            toggleButton.classList.toggle('active', this.isPermanent);
            // 更新按钮提示文本
            toggleButton.title = this.isPermanent ? 'Show on selection' : 'Show permanently';
        }
    },
    
    /**
     * 设置控制面板的初始可见性
     * 
     * 从本地存储中读取设置并应用
     */
    setInitialVisibility() {
        // 从本地存储中读取设置
        const isVisible = localStorage.getItem('NodeAlignVisible') === 'true';
        const isPermanent = localStorage.getItem('NodeAlignerIsPermanent') === '1';
        
        // 初始化状态
        this.isVisible = false;
        this.isPermanent = isPermanent;
        
        // 根据设置显示或隐藏控制面板
        if (isVisible && isPermanent) {
            // 使用setTimeout确保DOM已完全加载
            setTimeout(() => {
                this.show();
            }, 0);
        } else {
            this.buttonContainer.style.visibility = 'hidden';
            this.buttonContainer.style.display = 'none';
            this.isVisible = false;
        }
        
        // 更新切换按钮状态
        this.updateToggleButton();
    },
    
    /**
     * 显示控制面板
     */
    show() {
        if (!this.isVisible) {
            // 清除用户主动关闭标志
            this.isClosedByUser = false;
            
            // 恢复之前保存的位置
            this.restorePosition();
            
            // 显示控制面板
            this.buttonContainer.style.display = 'flex';
            this.buttonContainer.style.visibility = 'visible';
            this.isVisible = true;
            
            // 保存可见性设置到本地存储
            localStorage.setItem('NodeAlignVisible', 'true');
            
            // 更新切换按钮状态
            this.updateToggleButton();
        }
    },
    
    /**
     * 隐藏控制面板
     * 
     * 仅在非永久模式下隐藏
     */
    hide() {
        if (!this.isPermanent) {
            this.buttonContainer.style.display = 'none';
            this.buttonContainer.style.visibility = 'hidden';
            this.isVisible = false;
        }
    },
    
    /**
     * 设置控制面板的位置
     * 
     * @param {number} x - 水平位置
     * @param {number} y - 垂直位置
     */
    setPosition(x, y) {
        const containerRect = this.buttonContainer.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // 确保控制面板不会超出窗口边界
        if (x + containerRect.width > windowWidth) {
            x = windowWidth - containerRect.width;
        }
        if (x < 0) {
            x = 0;
        }
        if (y + containerRect.height > windowHeight) {
            y = windowHeight - containerRect.height;
        }
        if (y < 0) {
            y = 0;
        }
        
        // 设置位置
        this.buttonContainer.style.left = `${x}px`;
        this.buttonContainer.style.top = `${y}px`;
    },
    
    /**
     * 拖拽开始事件处理函数
     * 
     * @param {MouseEvent} e - 鼠标事件对象
     */
    onDragStart(e) {
        // 仅处理左键拖拽
        if (e.button !== 0) return;
        
        // 阻止事件冒泡
        e.stopPropagation();
        
        // 记录拖拽开始状态
        this.isDragging = true;
        this.dragStartX = e.clientX - this.buttonContainer.offsetLeft;
        this.dragStartY = e.clientY - this.buttonContainer.offsetTop;
    },
    
    /**
     * 拖拽中事件处理函数
     * 
     * @param {MouseEvent} e - 鼠标事件对象
     */
    onDragging(e) {
        if (!this.isDragging) return;
        
        // 阻止默认行为和事件冒泡
        e.preventDefault();
        e.stopPropagation();
        
        // 计算新位置
        const newX = e.clientX - this.dragStartX;
        const newY = e.clientY - this.dragStartY;
        
        // 更新控制面板位置
        this.buttonContainer.style.left = `${newX}px`;
        this.buttonContainer.style.top = `${newY}px`;
    },
    
    /**
     * 拖拽结束事件处理函数
     * 
     * @param {MouseEvent} e - 鼠标事件对象
     */
    onDragEnd(e) {
        if (!this.isDragging) return;
        
        // 仅处理左键拖拽结束
        if (e.button !== 0) return;
        
        // 阻止事件冒泡
        e.stopPropagation();
        
        // 结束拖拽状态
        this.isDragging = false;
        
        // 保存位置到本地存储
        const buttonPosition = {
            left: this.buttonContainer.style.left,
            top: this.buttonContainer.style.top,
            userPositioned: true
        };
        localStorage.setItem('NodeAlignerButtonPosition', JSON.stringify(buttonPosition));
    },
    
    /**
     * 恢复控制面板的位置
     * 
     * 从本地存储中读取位置，如果没有则使用默认位置
     */
    restorePosition() {
        const savedButtonPosition = JSON.parse(localStorage.getItem('NodeAlignerButtonPosition'));
        
        if (savedButtonPosition && savedButtonPosition.userPositioned) {
            // 使用保存的位置
            this.buttonContainer.style.left = savedButtonPosition.left;
            this.buttonContainer.style.top = savedButtonPosition.top;
        } else {
            // 使用默认位置（窗口底部中央）
            const windowWidth = window.innerWidth;
            const containerWidth = this.buttonContainer.offsetWidth || 400;
            const containerHeight = this.buttonContainer.offsetHeight || 44;
            
            const left = Math.max(0, (windowWidth - containerWidth) / 2);
            const top = window.innerHeight - containerHeight - 20;
            
            this.buttonContainer.style.left = `${left}px`;
            this.buttonContainer.style.top = `${top}px`;
        }
    },
    
    /**
     * 获取当前选中的节点
     * 
     * @returns {Array} 选中的节点数组
     */
    getSelectedNodes() {
        // 检查是否有活跃的画布
        if (!LGraphCanvas.active_canvas) {
            return [];
        }
        
        const selectedNodesObj = LGraphCanvas.active_canvas.selected_nodes;
        
        // 返回选中的节点数组
        return selectedNodesObj ? Object.values(selectedNodesObj) : [];
    },
    
    /**
     * 更新画布显示
     * 
     * 通知 ComfyUI 画布需要重新渲染
     */
    updateCanvas() {
        if (!LGraphCanvas.active_canvas) return;
        
        try {
            const canvas = LGraphCanvas.active_canvas;
            // 标记画布为脏，需要重新渲染
            canvas.setDirty(true, true);
        } catch (e) {
            console.warn("Error marking canvas dirty: ", e);
        }
    },
    
    /**
     * 创建对齐操作对象
     * 
     * @param {Array} nodes - 要对齐的节点数组
     * @param {string} property - 要修改的属性（'pos' 或 'size'）
     * @param {Function} getValue - 获取目标值的函数
     * @param {Object} setValue - 设置值的配置对象
     * @returns {Object|null} 包含 undo 和 redo 方法的操作对象
     */
    createAlignmentAction(nodes, property, getValue, setValue) {
        if (nodes.length === 0) return null;
        
        // 保存节点的原始状态
        const originalStates = {};
        nodes.forEach(node => {
            originalStates[node.id] = {
                pos: [...node.pos],
                size: [...node.size]
            };
        });
        
        // 计算目标值
        const targetValue = getValue(nodes);
        
        // 返回包含 undo 和 redo 方法的操作对象
        return {
            /**
             * 撤销操作
             */
            undo: () => {
                nodes.forEach(node => {
                    const originalState = originalStates[node.id];
                    if (originalState) {
                        node.pos = [...originalState.pos];
                        node.size = [...originalState.size];
                    }
                });
            },
            /**
             * 重做操作
             */
            redo: () => {
                nodes.forEach(node => {
                    const currentPos = [...node.pos];
                    const currentSize = [...node.size];
                    
                    if (property === 'pos') {
                        // 更新位置
                        const newValue = setValue.func ? setValue.func(node, targetValue) : targetValue;
                        const newPos = [...currentPos];
                        newPos[setValue.axis] = newValue;
                        node.pos = newPos;
                    } else if (property === 'size') {
                        // 更新大小
                        const newSize = [...currentSize];
                        newSize[setValue.axis] = targetValue;
                        node.size = newSize;
                    }
                });
            }
        };
    },
    
    /**
     * 应用对齐操作
     * 
     * @param {Object} action - 要应用的操作对象
     * @returns {boolean} 操作是否成功
     */
    applyAction(action) {
        if (!action) return false;
        
        try {
            if (typeof action.redo !== 'function') {
                console.warn('Action missing redo method');
                return false;
            }
            
            // 执行操作
            action.redo();
            
            // 添加到撤销栈
            this.addToUndoStack(action);
            
            // 更新画布
            try {
                this.updateCanvas();
            } catch (canvasError) {
                console.warn('Error updating canvas after applying action:', canvasError);
            }
            
            return true;
        } catch (error) {
            console.warn('Error applying action:', error);
            return false;
        }
    },
    
    /**
     * 处理对齐操作
     * 
     * @param {string} actionName - 操作名称
     * @returns {boolean} 操作是否成功
     */
    _handleAlignmentAction(actionName) {
        // 获取操作配置
        const config = this.ALIGNMENT_CONFIG[actionName];
        
        if (!config) {
            console.warn("Unknown alignment/equalize action:", actionName);
            return false;
        }

        // 获取选中的节点
        const selectedNodes = this.getSelectedNodes();
        if (selectedNodes.length === 0) return false;

        // 绑定值函数的上下文
        const boundValueFunc = typeof config.valueFunc === 'function' ? config.valueFunc.bind(this) : config.valueFunc;

        // 创建并应用操作
        const action = this.createAlignmentAction(
            selectedNodes,
            config.type,
            boundValueFunc,
            { axis: config.axis, func: config.transformFunc }
        );
        
        return this.applyAction(action);
    },
    
    /**
     * 水平均匀分布选中的节点
     * 
     * 将选中的节点在水平方向上均匀分布
     * 
     * @returns {boolean} 操作是否成功
     */
    horizontalDistribution() {
        const selectedNodes = this.getSelectedNodes();
        // 计算水平分布的位置
        const calcResult = this._calculateDistributedPositions(selectedNodes, 0);
        
        if (!calcResult) return false;

        const { targetPositions, originalStates } = calcResult;
        
        // 创建操作对象
        const action = {
            undo: () => {
                selectedNodes.forEach(node => {
                    const originalState = originalStates[node.id];
                    if (originalState) {
                        node.pos = [...originalState.pos];
                        node.size = [...originalState.size];
                    }
                });
            },
            redo: () => {
                selectedNodes.forEach(node => {
                    const targetPos = targetPositions[node.id];
                    if (targetPos) {
                        node.pos[0] = Number(targetPos[0]) || 0;
                        node.pos[1] = Number(targetPos[1]) || 0;
                    }
                });
            }
        };

        return this.applyAction(action);
    },
    
    /**
     * 垂直均匀分布选中的节点
     * 
     * 将选中的节点在垂直方向上均匀分布
     * 
     * @returns {boolean} 操作是否成功
     */
    verticalDistribution() {
        const selectedNodes = this.getSelectedNodes();
        // 计算垂直分布的位置
        const calcResult = this._calculateDistributedPositions(selectedNodes, 1);
        
        if (!calcResult) return false;

        const { targetPositions, originalStates } = calcResult;
        
        // 创建操作对象
        const action = {
            undo: () => {
                selectedNodes.forEach(node => {
                    const originalState = originalStates[node.id];
                    if (originalState) {
                        node.pos = [...originalState.pos];
                        node.size = [...originalState.size];
                    }
                });
            },
            redo: () => {
                selectedNodes.forEach(node => {
                    const targetPos = targetPositions[node.id];
                    if (targetPos) {
                        node.pos[0] = Number(targetPos[0]) || 0;
                        node.pos[1] = Number(targetPos[1]) || 0;
                    }
                });
            }
        };

        return this.applyAction(action);
    },
    
    /**
     * 智能对齐选中的节点
     * 
     * 基于节点之间的连接关系，将节点排列成有层次的布局
     * 
     * @returns {boolean} 操作是否成功
     */
    smartAlign() {
        const selectedNodes = this.getSelectedNodes();
        
        if (selectedNodes.length < 2) return false;
        
        // 保存原始状态
        const originalStates = {};
        selectedNodes.forEach(node => {
            originalStates[node.id] = {
                pos: [...node.pos],
                size: [...node.size]
            };
        });
        
        // 使用BFS分析连接关系
        const analysisResult = this.analyzeConnectionsBFS(selectedNodes);
        const levels = analysisResult.levels;
        
        if (!levels || levels.length === 0) {
            console.warn("Smart Align: Could not determine node levels.");
            return false;
        }
        
        const targetPositions = {};
        const horizontalSpacing = 100; // 水平间距
        const verticalSpacing = 30;   // 垂直间距
        
        // 从根节点开始布局
        let currentX = originalStates[levels[0][0].id].pos[0];
        let maxColumnHeight = 0;
        const columnWidths = [];
        
        // 计算每列的宽度和最大高度
        levels.forEach((level, levelIndex) => {
            let currentColumnWidth = 0;
            let currentColumnHeight = 0;
            
            level.forEach((node, nodeIndex) => {
                const originalSize = originalStates[node.id].size;
                currentColumnWidth = Math.max(currentColumnWidth, originalSize[0]);
                currentColumnHeight += originalSize[1] + (nodeIndex > 0 ? verticalSpacing : 0);
            });
            
            columnWidths[levelIndex] = currentColumnWidth;
            maxColumnHeight = Math.max(maxColumnHeight, currentColumnHeight);
        });
        
        // 计算每个节点的目标位置
        levels.forEach((level, levelIndex) => {
            // 按Y坐标排序当前层级的节点
            level.sort((a, b) => originalStates[a.id].pos[1] - originalStates[b.id].pos[1]);
            
            // 计算当前层级的总高度
            const levelHeight = level.reduce((sum, node, idx) => 
                sum + originalStates[node.id].size[1] + (idx > 0 ? verticalSpacing : 0), 0
            );
            
            // 计算当前层级的起始Y坐标（垂直居中）
            let currentY = originalStates[levels[0][0].id].pos[1] + (maxColumnHeight - levelHeight) / 2;
            
            // 计算每个节点的位置
            level.forEach(node => {
                const originalSize = originalStates[node.id].size;
                const nodeX = currentX + (columnWidths[levelIndex] - originalSize[0]) / 2;
                
                targetPositions[node.id] = [nodeX, currentY];
                
                // 更新当前Y坐标
                currentY += originalSize[1] + verticalSpacing;
            });
            
            // 更新当前X坐标
            currentX += columnWidths[levelIndex] + horizontalSpacing;
        });
        
        // 创建操作对象
        const action = {
            undo: () => {
                selectedNodes.forEach(node => {
                    const originalState = originalStates[node.id];
                    if (originalState) {
                        node.pos = [...originalState.pos];
                        node.size = [...originalState.size];
                    }
                });
            },
            redo: () => {
                selectedNodes.forEach(node => {
                    const targetPos = targetPositions[node.id];
                    if (targetPos) {
                        node.pos = [Number(targetPos[0]) || 0, Number(targetPos[1]) || 0];
                    }
                });
            }
        };
        
        return this.applyAction(action);
    },
    
    /**
     * 将选中的节点排列成树状布局
     * 
     * 基于节点之间的连接关系，将节点排列成层级分明的树状结构
     * 
     * @returns {boolean} 操作是否成功
     */
    treeView() {
        const selectedNodes = this.getSelectedNodes();
        if (selectedNodes.length < 2) return false;
        
        const originalStates = {};
        selectedNodes.forEach(node => {
            originalStates[node.id] = {
                pos: [...node.pos],
                size: [...node.size]
            };
        });
        
        const rootNode = this.findRootNode(selectedNodes);
        if (!rootNode) {
            console.warn("Tree View: Could not find a root node.");
            return false;
        }
        
        const targetPositions = {};
        const levels = this.buildSimpleHierarchy(rootNode, selectedNodes);
        const nodeWidth = Math.max(...selectedNodes.map(node => originalStates[node.id].size[0]));
        const nodeHeight = Math.max(...selectedNodes.map(node => originalStates[node.id].size[1]));
        const horizontalSpacing = nodeWidth * 1.5;
        const verticalSpacing = nodeHeight * 1.5;
        
        const rootOriginalPos = originalStates[rootNode.id].pos;
        
        levels.forEach((level, levelIndex) => {
            const levelWidth = (level.length - 1) * horizontalSpacing;
            const startX = rootOriginalPos[0];
            
            level.forEach((node, nodeIndex) => {
                const targetX = startX + (nodeIndex - (level.length - 1) / 2) * horizontalSpacing;
                const targetY = rootOriginalPos[1] + levelIndex * verticalSpacing;
                targetPositions[node.id] = [targetX, targetY];
            });
        });
        
        const action = {
            undo: () => selectedNodes.forEach(node => {
                 const originalState = originalStates[node.id];
                 if (originalState) {
                     node.pos = [...originalState.pos];
                     node.size = [...originalState.size];
                 }
            }),
            redo: () => {
                selectedNodes.forEach(node => {
                    const targetPos = targetPositions[node.id];
                    if (targetPos) {
                        node.pos = [Number(targetPos[0]) || 0, Number(targetPos[1]) || 0];
                    }
                });
            }
        };
        
        return this.applyAction(action);
    },
    
    /**
     * 将选中的节点按顺序放置在指定方向
     * 
     * @param {string} direction - 放置方向，'right' 或 'below'
     * @param {number} gap - 节点之间的间距
     * @returns {boolean} 操作是否成功
     */
    placeAdjacent(direction = 'right', gap = 20) {
        const selected = this.getSelectedNodes();
        if (selected.length < 2) return false;

        const axis = direction === 'right' ? 0 : 1;
        const otherAxis = axis === 0 ? 1 : 0;

        const originalStates = {};
        selected.forEach(n => {
            originalStates[n.id] = { pos: [...n.pos], size: [...n.size] };
        });

        const analysis = this.analyzeConnectionsBFS(selected);
        const flow = analysis && analysis.sortedNodes && analysis.sortedNodes.length === selected.length
            ? analysis.sortedNodes
            : [...selected].sort((a, b) => originalStates[a.id].pos[axis] - originalStates[b.id].pos[axis]);

        const anchor = flow[0];
        const rest = flow.slice(1);

        const targetPositions = {};
        let currentCoord = originalStates[anchor.id].pos[axis] + originalStates[anchor.id].size[axis] + gap;
        
        rest.forEach(n => {
            const newPos = [...originalStates[n.id].pos];
            newPos[axis] = currentCoord;
            newPos[otherAxis] = originalStates[anchor.id].pos[otherAxis];
            targetPositions[n.id] = newPos;
            currentCoord += originalStates[n.id].size[axis] + gap;
        });

        const action = {
            undo: () => {
                selected.forEach(n => {
                    const st = originalStates[n.id];
                    n.pos = [...st.pos];
                    n.size = [...st.size];
                });
            },
            redo: () => {
                rest.forEach(n => {
                    const pos = targetPositions[n.id];
                    if (pos) n.pos = [Number(pos[0]) || 0, Number(pos[1]) || 0];
                });
            }
        };

        return this.applyAction(action);
    },
    
    /**
     * 使用 BFS 分析节点之间的连接关系
     * 
     * @param {Array} nodes - 要分析的节点数组
     * @returns {Object} 包含排序后的节点和层级信息的对象
     */
    analyzeConnectionsBFS(nodes) {
        const graph = {};
        const inDegree = {};
        const nodeMap = {};
        
        nodes.forEach(node => {
            const nodeId = node.id;
            graph[nodeId] = { node, outputs: [] };
            inDegree[nodeId] = 0;
            nodeMap[nodeId] = node;
        });
        
        nodes.forEach(node => {
            if (node.inputs) {
                node.inputs.forEach(input => {
                    if (input.link !== null) {
                        const sourceNode = nodes.find(n => n.outputs && n.outputs.some(o => o.links && o.links.includes(input.link)));
                        if (sourceNode) {
                            const sourceId = sourceNode.id;
                            const destId = node.id;
                            if (!graph[sourceId].outputs.includes(destId)) {
                                graph[sourceId].outputs.push(destId);
                                inDegree[destId]++;
                            }
                        }
                    }
                });
            }
        });
        
        const queue = [];
        for (const nodeId in inDegree) {
            if (inDegree[nodeId] === 0) {
                queue.push(nodeId);
            }
        }
        
        const result = [];
        const levels = [];
        let levelIndex = 0;
        
        while (queue.length > 0) {
            const levelSize = queue.length;
            const currentLevelNodes = [];
            for (let i = 0; i < levelSize; i++) {
                 const u = queue.shift();
                 const nodeObj = nodeMap[u];
                 result.push(nodeObj);
                 currentLevelNodes.push(nodeObj);
                 if(graph[u]){
                    graph[u].outputs.forEach(v => {
                         if (inDegree.hasOwnProperty(v)) {
                             inDegree[v]--;
                             if (inDegree[v] === 0) {
                                 queue.push(v);
                             }
                         }
                     });
                 }
            }
            if (currentLevelNodes.length > 0) {
                 levels[levelIndex] = currentLevelNodes;
                 levelIndex++;
            }
        }
        
        if (result.length !== nodes.length) {
            console.warn("Cycle detected or disconnected nodes within selection. Layout might be incomplete.");
            return { sortedNodes: nodes, levels: null };
        }
        
        return { sortedNodes: result, levels: levels };
    },
    
    /**
     * 查找根节点
     * 
     * 根节点是没有输入连接的节点
     * 
     * @param {Array} nodes - 节点数组
     * @returns {Object|null} 根节点或 null
     */
    findRootNode(nodes) {
        return nodes.find(node => !node.inputs || node.inputs.every(input => input.link === null));
    },
    
    /**
     * 构建简单的节点层级结构
     * 
     * @param {Object} rootNode - 根节点
     * @param {Array} allNodes - 所有节点数组
     * @returns {Array} 层级结构数组，每个元素是一个层级的节点数组
     */
    buildSimpleHierarchy(rootNode, allNodes) {
        const levels = [[rootNode]];
        const visited = new Set([rootNode.id]);
        let currentLevel = [rootNode];
        
        while (currentLevel.length > 0) {
            const nextLevel = [];
            for (const node of currentLevel) {
                const children = allNodes.filter(n => 
                    !visited.has(n.id) && n.inputs && n.inputs.some(input => 
                        input.link !== null && node.outputs && node.outputs.some(output => 
                            output.links && output.links.includes(input.link)
                        )
                    )
                );
                children.forEach(child => visited.add(child.id));
                nextLevel.push(...children);
            }
            if (nextLevel.length > 0) {
                levels.push(nextLevel);
            }
            currentLevel = nextLevel;
        }
        return levels;
    },
    
    /**
     * 轮询等待画布加载完成
     * 
     * 当画布加载完成后，初始化节点对齐工具并设置事件监听器
     */
    pollForCanvas() {
        const canvas = document.querySelector('canvas#graph-canvas');
        if (canvas) {
            NodeAligner.init();
            canvas.addEventListener('click', (event) => {
                const selectedNodes = this.getSelectedNodes();
                if (!this.isPermanent) {
                    if (!this.isClosedByUser && selectedNodes.length >= 2) {
                        this.show();
                        const nodesBounds = this.getNodesBoundsInScreenCoords(selectedNodes);
                        const containerWidth = this.buttonContainer.offsetWidth || 400;
                        const containerHeight = this.buttonContainer.offsetHeight || 44;
                        
                        let left = nodesBounds.left + (nodesBounds.width / 2) - (containerWidth / 2);
                        let top = nodesBounds.bottom + 50;
                        
                        this.setPosition(left, top);
                    } else {
                        this.hide();
                    }
                } else {
                    if (!this.isClosedByUser && !this.isVisible) {
                        this.show();
                    }
                }
            });
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(this.pollForCanvas.bind(this), 1000);
        }
    },
    
    /**
     * 设置右键菜单选项
     * 
     * 在 ComfyUI 画布的右键菜单中添加显示/隐藏节点对齐工具的选项
     */
    setupContextMenu() {
        const onContextMenu = LGraphCanvas.prototype.getCanvasMenuOptions;
        LGraphCanvas.prototype.getCanvasMenuOptions = function() {
            const options = onContextMenu.call(this);
            options.push(null);
            options.push({
                content: NodeAligner.isVisible ? "Hide Node Aligner" : "Show Node Aligner",
                callback: () => {
                    if (NodeAligner.isVisible) {
                        NodeAligner.close();
                    } else {
                        NodeAligner.show();
                        NodeAligner.isPermanent = true;
                        localStorage.setItem('NodeAlignerIsPermanent', '1');
                        NodeAligner.updateToggleButton();
                    }
                }
            });
            return options;
        };
    },
    
    /**
     * 关闭节点对齐工具
     * 
     * 隐藏控制面板并保存状态到本地存储
     */
    close() {
        this.buttonContainer.style.display = 'none';
        this.buttonContainer.style.visibility = 'hidden';
        this.isVisible = false;
        localStorage.setItem('NodeAlignVisible', 'false');
        localStorage.removeItem('NodeAlignerButtonPosition');
        this.isClosedByUser = true;
        this.isPermanent = false;
        this.updateToggleButton();
    },
    
    /**
     * 获取节点在屏幕坐标中的边界框
     * 
     * @param {Array} nodes - 节点数组
     * @returns {Object} 包含 left, top, right, bottom, width, height 的边界框对象
     */
    getNodesBoundsInScreenCoords(nodes) {
        if (!nodes || nodes.length === 0 || !LGraphCanvas.active_canvas) {
            return { left: 10, top: 10, right: 110, bottom: 110, width: 100, height: 100 };
        }
        const canvas = LGraphCanvas.active_canvas;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        nodes.forEach(node => {
            const nodeGraphX = node.pos[0];
            const nodeGraphY = node.pos[1];
            const nodeWidth = node.size[0];
            const nodeHeight = node.size[1];
            
            try {
                const topLeft = canvas.convertOffsetToCanvas([nodeGraphX, nodeGraphY]);
                const bottomRight = canvas.convertOffsetToCanvas([nodeGraphX + nodeWidth, nodeGraphY + nodeHeight]);
                minX = Math.min(minX, topLeft[0]);
                minY = Math.min(minY, topLeft[1]);
                maxX = Math.max(maxX, bottomRight[0]);
                maxY = Math.max(maxY, bottomRight[1]);
            } catch (e) {
                console.error("Error converting node coordinates:", e, node);
            }
        });
        
        if (minX === Infinity) {
            return { left: 10, top: 10, right: 110, bottom: 110, width: 100, height: 100 };
        }
        
        return {
            left: minX,
            top: minY,
            right: maxX,
            bottom: maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    },
    
    ALIGNMENT_CONFIG: {
        alignLeft: { type: 'pos', axis: 0, valueFunc: nodes => Math.min(...nodes.map(n => n.pos[0])), transformFunc: (n, v) => v },
        alignRight: { type: 'pos', axis: 0, valueFunc: nodes => Math.max(...nodes.map(n => n.pos[0] + n.size[0])), transformFunc: (n, v) => v - n.size[0] },
        alignTop: { type: 'pos', axis: 1, valueFunc: nodes => Math.min(...nodes.map(n => n.pos[1])), transformFunc: (n, v) => v },
        alignBottom: { type: 'pos', axis: 1, valueFunc: nodes => Math.max(...nodes.map(n => n.pos[1] + n.size[1])), transformFunc: (n, v) => v - n.size[1] },
        alignCenterHorizontally: { type: 'pos', axis: 1, valueFunc: function(nodes) { return this.calculateCenterInGroup(nodes, 1); }, transformFunc: (n, v) => v - n.size[1] / 2 },
        alignCenterVertically: { type: 'pos', axis: 0, valueFunc: function(nodes) { return this.calculateCenterInGroup(nodes, 0); }, transformFunc: (n, v) => v - n.size[0] / 2 },
        equalWidth: { type: 'size', axis: 0, valueFunc: nodes => Math.max(...nodes.map(n => n.size[0])) },
        equalHeight: { type: 'size', axis: 1, valueFunc: nodes => Math.max(...nodes.map(n => n.size[1])) }
    },
    
    calculateCenterInGroup(group, axis) {
        const minCoord = Math.min(...group.map(node => node.pos[axis]));
        const maxCoord = Math.max(...group.map(node => node.pos[axis] + node.size[axis]));
        return (minCoord + maxCoord) / 2;
    },
    
    /**
     * 计算节点分布排列的位置
     * 
     * @param {Array} nodes - 要分布的节点数组
     * @param {number} axis - 分布的轴（0: 水平, 1: 垂直）
     * @returns {Object|null} 包含 targetPositions, originalStates, flowSortedNodes 的对象
     */
    _calculateDistributedPositions(nodes, axis) {
        if (nodes.length < 2) return null;

        const originalStates = {};
        nodes.forEach(node => {
            originalStates[node.id] = {
                pos: [...node.pos],
                size: [...node.size]
            };
        });

        const analysisResult = this.analyzeConnectionsBFS(nodes);
        let flowSortedNodes = analysisResult.sortedNodes;
        
        if (!flowSortedNodes || flowSortedNodes.length !== nodes.length) {
            console.warn(`Distribution axis ${axis}: Could not determine flow order. Falling back to position-based sorting.`);
            flowSortedNodes = [...nodes].sort((a, b) => a.pos[axis] - b.pos[axis]);
        }

        const minCoord = Math.min(...flowSortedNodes.map(node => originalStates[node.id].pos[axis]));
        const maxCoord = Math.max(...flowSortedNodes.map(node => originalStates[node.id].pos[axis] + originalStates[node.id].size[axis]));
        const totalAvailableSpace = maxCoord - minCoord;
        const totalNodesSize = flowSortedNodes.reduce((sum, node) => sum + originalStates[node.id].size[axis], 0);

        const nodeCount = flowSortedNodes.length;
        const totalGaps = nodeCount - 1;
        const equalGap = totalGaps > 0 
            ? Math.max(0, (totalAvailableSpace - totalNodesSize) / totalGaps)
            : 0;

        const targetPositions = {};
        let currentCoord = minCoord;
        
        flowSortedNodes.forEach(node => {
            const originalPos = originalStates[node.id].pos;
            const targetPos = [...originalPos];
            targetPos[axis] = currentCoord;
            targetPositions[node.id] = targetPos;
            currentCoord += originalStates[node.id].size[axis] + equalGap;
        });

        return { targetPositions, originalStates, flowSortedNodes };
    },
};

let attempts = 0;
const maxAttempts = 10;
NodeAligner.pollForCanvas();
