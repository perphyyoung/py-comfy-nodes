import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "py-comfy-nodes.PromptList",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "PromptList") {
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                const result = onNodeCreated?.apply(this, arguments);
                
                // 找到 string_count widget
                const stringCountWidget = this.widgets.find(w => w.name === "string_count");
                
                // 找到所有 string widgets
                const maxStrings = 10;
                const stringWidgets = [];
                for (let i = 1; i <= maxStrings; i++) {
                    const widget = this.widgets.find(w => w.name === `string_${i}`);
                    if (widget) {
                        stringWidgets.push(widget);
                    }
                }
                
                // 更新 string widgets 的可见性
                const updateStringWidgetsVisibility = () => {
                    const count = stringCountWidget ? stringCountWidget.value : 3;
                    stringWidgets.forEach((widget, index) => {
                        const shouldShow = index < count;
                        widget.type = shouldShow ? "customtext" : "hidden";
                        widget.computeSize = shouldShow ? null : () => [0, -4];
                    });
                    // 只重绘画布，不改变节点尺寸
                    app.graph.setDirtyCanvas(true);
                };
                
                // 为每个 string widget 添加行号绘制
                stringWidgets.forEach((widget, index) => {
                    // 保存原始绘制函数
                    if (!widget._originalDraw) {
                        widget._originalDraw = widget.draw;
                    }
                    
                    // 自定义绘制函数
                    widget.draw = function(ctx, node, widgetWidth, y, widgetHeight) {
                        const lineNumberWidth = 16;
                        const padding = 4;
                        const lineNumberHeight = 14;
                        const offsetY = -2; // 向上偏移
                        
                        // 绘制行号背景
                        ctx.fillStyle = "#1a1a1a";
                        ctx.fillRect(padding, y + offsetY, lineNumberWidth, lineNumberHeight);
                        
                        // 绘制行号文字
                        ctx.fillStyle = "#aaaaaa";
                        ctx.font = "11px Arial";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText(`${index + 1}`, padding + lineNumberWidth / 2, y + offsetY + lineNumberHeight / 2);
                        
                        // 调用原始绘制函数，但调整位置
                        if (this._originalDraw) {
                            ctx.save();
                            ctx.translate(lineNumberWidth + padding * 2, 0);
                            this._originalDraw.call(this, ctx, node, widgetWidth - lineNumberWidth - padding * 2, y, widgetHeight);
                            ctx.restore();
                        }
                    };
                });
                
                // 从节点配置中读取 string_count 值
                const configure = this.configure;
                this.configure = function(info) {
                    configure.apply(this, arguments);
                    // 在配置完成后，根据保存的 string_count 更新可见性
                    if (stringCountWidget && info && info.widgets_values) {
                        const stringCountIndex = this.widgets.findIndex(w => w.name === "string_count");
                        if (stringCountIndex !== -1 && info.widgets_values[stringCountIndex] !== undefined) {
                            stringCountWidget.value = info.widgets_values[stringCountIndex];
                        }
                    }
                    updateStringWidgetsVisibility();
                };
                
                // 初始化可见性
                updateStringWidgetsVisibility();
                
                // 在底部添加更新 UI 按钮
                this.addWidget("button", "Update UI", null, () => {
                    updateStringWidgetsVisibility();
                });
                
                return result;
            };
        }
    }
});