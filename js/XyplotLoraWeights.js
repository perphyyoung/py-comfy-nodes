// XYPlot LoRA 权重节点前端逻辑
// 根据 weight_mode 隐藏无关参数：List 模式隐藏区间参数，Range 模式隐藏权重列表文本框

import { app } from "../../scripts/app.js";

const HIDDEN_TAG = "tschide";
const origProps = {};

const findWidgetByName = (node, name) => {
  return node.widgets ? node.widgets.find((w) => w.name === name) : null;
};

function toggleWidget(node, widget, show = false) {
  if (!widget) return;

  if (!origProps[widget.name]) {
    origProps[widget.name] = {
      origType: widget.type,
      origComputeSize: widget.computeSize,
    };
  }

  widget.type = show ? origProps[widget.name].origType : HIDDEN_TAG;
  widget.computeSize = show ? origProps[widget.name].origComputeSize : () => [0, -4];
}

function applyVisibility(node, mode) {
  const isRange = mode === "Range";

  // List 模式才需要手写权重列表
  toggleWidget(node, findWidgetByName(node, "weights"), !isRange);

  // Range 模式才需要数量与首尾权重
  for (const name of ["batch_count", "first_weight", "last_weight"]) {
    toggleWidget(node, findWidgetByName(node, name), isRange);
  }

  node.setSize([node.size[0], node.computeSize()[1]]);
}

app.registerExtension({
  name: "py-comfy-nodes.XyplotLoraWeights",
  nodeCreated(node) {
    if (node.comfyClass !== "XyplotLoraWeights") return;

    const modeWidget = findWidgetByName(node, "weight_mode");
    if (!modeWidget) return;

    // 初始化可见性
    applyVisibility(node, modeWidget.value);

    // 监听下拉框变化
    let widgetValue = modeWidget.value;
    let originalDescriptor = Object.getOwnPropertyDescriptor(modeWidget, "value");
    if (!originalDescriptor) {
      originalDescriptor = Object.getOwnPropertyDescriptor(
        modeWidget.constructor.prototype,
        "value"
      );
    }

    Object.defineProperty(modeWidget, "value", {
      get() {
        return originalDescriptor && originalDescriptor.get
          ? originalDescriptor.get.call(modeWidget)
          : widgetValue;
      },
      set(newVal) {
        if (originalDescriptor && originalDescriptor.set) {
          originalDescriptor.set.call(modeWidget, newVal);
        } else {
          widgetValue = newVal;
        }
        applyVisibility(node, newVal);
      },
    });
  },
});
