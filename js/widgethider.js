// 参考 ComfyUI-Prompt-Wildcards 的 widgethider.js

import { app } from "../../scripts/app.js";

let origProps = {};

const findWidgetByName = (node, name) => {
  return node.widgets ? node.widgets.find((w) => w.name === name) : null;
};

const doesInputWithNameExist = (node, name) => {
  return false;
};

const HIDDEN_TAG = "tschide";

function toggleWidget(node, widget, show = false, suffix = "") {
  if (!widget || doesInputWithNameExist(node, widget.name)) return;

  if (!origProps[widget.name]) {
    origProps[widget.name] = {
      origType: widget.type,
      origComputeSize: widget.computeSize,
    };
  }

  widget.type = show ? origProps[widget.name].origType : HIDDEN_TAG + suffix;
  widget.computeSize = show
    ? origProps[widget.name].origComputeSize
    : () => [0, -4];
  widget.linkedWidgets?.forEach((w) =>
    toggleWidget(node, w, ":" + widget.name, show)
  );

  const newHeight = node.computeSize()[1];

  node.setSize([node.size[0], newHeight]);
}

app.registerExtension({
  name: "py-comfy-nodes.widgethider",
  nodeCreated(node) {
    if (node.comfyClass === "MultiKeys") {
      // 找到key_count widget
      let keyCountWidget = null;
      for (const w of node.widgets || []) {
        if (w.name === "key_count") {
          keyCountWidget = w;
          break;
        }
      }
      
      // 初始化所有key字段的可见性
      if (keyCountWidget) {
        // 立即初始化所有key字段的可见性
        const currentCount = keyCountWidget.value;
        for (let i = 1; i <= 5; i++) {
          const widgetName = `key_${i}`;
          const nameWidget = findWidgetByName(node, widgetName);
          if (nameWidget) {
            const shouldShow = i <= currentCount;
            toggleWidget(node, nameWidget, shouldShow);
          }
        }
        
        // 为key_count widget添加监听器
        let widgetValue = currentCount;
        let originalDescriptor = Object.getOwnPropertyDescriptor(keyCountWidget, "value");
        if (!originalDescriptor) {
          originalDescriptor = Object.getOwnPropertyDescriptor(
            keyCountWidget.constructor.prototype,
            "value"
          );
        }
        Object.defineProperty(keyCountWidget, "value", {
          get() {
            let valueToReturn =
              originalDescriptor && originalDescriptor.get
                ? originalDescriptor.get.call(keyCountWidget)
                : widgetValue;

            return valueToReturn;
          },
          set(newVal) {
            if (originalDescriptor && originalDescriptor.set) {
              originalDescriptor.set.call(keyCountWidget, newVal);
            } else {
              widgetValue = newVal;
            }
            
            // 当key_count值变化时，更新所有key字段的可见性
            for (let i = 1; i <= 5; i++) {
              const widgetName = `key_${i}`;
              const nameWidget = findWidgetByName(node, widgetName);
              if (nameWidget) {
                const shouldShow = i <= newVal;
                toggleWidget(node, nameWidget, shouldShow);
              }
            }
          },
        });
      }
    }
  },
});
