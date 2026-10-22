import { app } from "../../scripts/app.js";

// text_N 槽位名，例如 text_1 / text_12
const TEXT_INPUT_PATTERN = /^text_(\d+)$/;
const TEXT_SOCKET_TYPE = "STRING";
const MIN_TEXT_INPUTS = 1;
const MAX_TEXT_INPUTS = 1000;

const findWidget = (node, name) => node.widgets?.find((widget) => widget.name === name) ?? null;

// 取出节点上所有 text_N 槽位，保持 inputs 数组中的原始顺序
function listTextInputs(node) {
  const entries = [];
  for (let index = 0; index < node.inputs.length; index++) {
    const matched = TEXT_INPUT_PATTERN.exec(node.inputs[index]?.name ?? "");
    if (matched) {
      entries.push({ input: node.inputs[index], index, number: Number(matched[1]) });
    }
  }
  return entries;
}

// 新前端的 graph.links 是 Map，旧前端是普通对象
function findLink(graph, linkId) {
  const links = graph?.links ?? graph?._links;
  if (!links || linkId == null) return null;
  return typeof links.get === "function" ? links.get(linkId) ?? null : links[linkId] ?? null;
}

// 槽位顺序变化后同步 link.target_slot，避免之后断开/删除连线时错位
function resyncLinkTargets(node) {
  const graph = node.graph ?? app.graph;
  if (!graph) return;
  for (let index = 0; index < node.inputs.length; index++) {
    const linkId = node.inputs[index].link;
    if (linkId == null) continue;
    const link = findLink(graph, linkId);
    if (link) link.target_slot = index;
  }
}

// 把 text_N 槽位按编号重新摆放：只调整数组位置，不新建/删除槽位，连线不丢
function sortTextInputs(node) {
  const entries = listTextInputs(node);
  if (entries.length < 2) return;

  const sorted = [...entries].sort((a, b) => a.number - b.number);
  if (entries.every((entry, index) => entry.input === sorted[index].input)) return;

  entries.forEach((entry, index) => {
    node.inputs[entry.index] = sorted[index].input;
  });
}

function removeInputSafely(node, index) {
  try {
    node.removeInput(index);
    return true;
  } catch (error) {
    // 部分前端版本在布局校验失败时会抛异常，这里保证后续步骤继续执行
    console.warn("[py-comfy-nodes] 移除输入槽位失败", error);
    return false;
  }
}

// 让 text_1..text_N 与 inputcount 严格对齐（按名字判断，不按数量推算）
function syncTextInputs(node) {
  const countWidget = findWidget(node, "inputcount");
  if (!countWidget) return;

  const rawCount = Number(countWidget.value);
  const count = Number.isFinite(rawCount)
    ? Math.min(MAX_TEXT_INPUTS, Math.max(MIN_TEXT_INPUTS, Math.round(rawCount)))
    : MIN_TEXT_INPUTS;

  // 1. 删除编号超过 count 的 text_N，从后往前删避免索引漂移
  for (let index = node.inputs.length - 1; index >= 0; index--) {
    const matched = TEXT_INPUT_PATTERN.exec(node.inputs[index]?.name ?? "");
    if (matched && Number(matched[1]) > count) removeInputSafely(node, index);
  }

  // 2. 清理重名槽位，保留最靠前的一个
  const seenNames = new Set();
  const duplicateIndexes = [];
  for (let index = 0; index < node.inputs.length; index++) {
    const name = node.inputs[index]?.name ?? "";
    if (!TEXT_INPUT_PATTERN.test(name)) continue;
    if (seenNames.has(name)) duplicateIndexes.push(index);
    else seenNames.add(name);
  }
  for (let index = duplicateIndexes.length - 1; index >= 0; index--) {
    removeInputSafely(node, duplicateIndexes[index]);
  }

  // 3. 按名字补齐缺失的 text_N：历史遗留的 text_1/text_2/text_4 也能修好
  for (let number = 1; number <= count; number++) {
    const name = `text_${number}`;
    if (seenNames.has(name)) continue;
    node.addInput(name, TEXT_SOCKET_TYPE, { forceInput: true });
    seenNames.add(name);
  }

  // 4. 补齐的槽位可能被追加到末尾，这里恢复成 text_1..text_N 的顺序
  sortTextInputs(node);
  resyncLinkTargets(node);

  // 5. 只增高不缩小，保证新增槽位可见
  const neededHeight = node.computeSize()[1];
  if (node.size[1] < neededHeight) node.setSize([node.size[0], neededHeight]);

  node.setDirtyCanvas?.(true, true);
}

app.registerExtension({
  name: "py-comfy-nodes.TextConcatMulti",
  async beforeRegisterNodeDef(nodeType, nodeData) {
    if (nodeData.name !== "TextConcatMulti") return;

    const originalOnNodeCreated = nodeType.prototype.onNodeCreated;

    nodeType.prototype.onNodeCreated = function () {
      originalOnNodeCreated?.apply(this, arguments);

      if (findWidget(this, "Update inputs")) return;

      this.addWidget("button", "Update inputs", null, () => syncTextInputs(this));
    };
  },
});
