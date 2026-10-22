# py-comfy-nodes

ComfyUI 的自定义节点和工具集合，提供实用的节点功能和节点对齐工具。

## 功能特点

### 1. 自定义节点

#### Float to String 节点
- **分类**：py-utils
- **功能**：将浮点数转换为指定小数位数的字符串
- **输入**：
  - float_value: 要转换的浮点数（范围：-1,000,000.0 到 1,000,000.0）
  - decimal_places: 保留的小数位数（范围：0 到 10）
- **输出**：转换后的字符串

#### Prompt Py From File 节点
- **分类**：py-utils
- **功能**：从 pyPrompt.yaml 文件读取 prompt 文本
- **输入**：
  - key: 从 pyPrompt.yaml 文件中选择的键名
- **输出**：所选键对应的 prompt 文本

#### Prompt List 节点
- **分类**：py-utils
- **功能**：从多个提示文本中选择一个进行输出，支持动态指定字符串数量
- **输入**：
  - string_1 ~ string_10: 多行文本输入框（最多10个）
  - string_count: 指定要显示的字符串数量（范围：1 到 10）
  - index: 选择要输出的字符串索引（范围：1 到 10，带滑杆控件）
- **输出**：selected_string: 选定的字符串
- **特性**：
  - 每个字符串输入框左侧显示行号
  - 通过 string_count 动态控制显示的输入框数量
  - 点击 "Update UI" 按钮更新界面
  - index 支持滑杆拖动选择

#### Text Concat Multi 节点
- **分类**：py-utils
- **功能**：将多个文本内容拼接在一起
- **输入**：
  - inputcount: 输入文本的数量
  - text_1 ~ text_n: 要拼接的文本
  - separator: 分隔符
- **输出**：result: 拼接后的文本

#### Multi Keys 节点
- **分类**：py-utils
- **功能**：动态键值对节点
- **输入**：可配置的键值对
- **输出**：根据配置输出

#### XYPlot LoRA Weights 节点
- **分类**：py-utils
- **功能**：只选择一个 LoRA，自动生成「同一 LoRA、不同权重」的 XY 轴取值，配合 ComfyUI-Easy-Use 的 XY Plot 使用
- **输入**：
  - lora_name: 只选一次的目标 LoRA
  - weight_mode: `List`（手写权重列表）或 `Range`（按数量等距生成）
  - weights: List 模式下的权重，用分号、逗号或换行分隔
  - batch_count / first_weight / last_weight: Range 模式下的档位数与首尾权重
  - weight_target: 权重作用对象 `model+clip` / `model` / `clip`
  - fixed_weight: 未被扫描的一方固定使用的强度
  - label_suffix（可选）: 追加到 XY 图标签后的文字
- **输出**：
  - X or Y: `X_Y` 类型，直接连到 easy-use 的 XY Plot（X/Y 输入）
  - weights info: 本次生成的权重摘要（调试用）

#### File Reader 节点
- **分类**：py-utils
- **功能**：读取文件内容
- **输入**：文件路径
- **输出**：文件内容

#### File Writer 节点
- **分类**：py-utils
- **功能**：写入文件内容
- **输入**：文件路径和内容
- **输出**：写入状态

### 2. 节点对齐工具

提供直观的节点布局和对齐功能，帮助您轻松组织工作流中的节点。

#### 主要功能
- **基础对齐**：左对齐、右对齐、上对齐、下对齐、水平居中、垂直居中
- **等宽等高**：设置所选节点相同宽度或高度
- **分布排列**：水平均匀分布、垂直均匀分布
- **智能布局**：基于连接关系的智能对齐
- **树状布局**：将节点排列成树状结构
- **相邻放置**：快速将节点放置在右侧或下方
- **撤销重做**：支持对齐操作的撤销和重做
- **界面控制**：可拖拽的控制面板，支持永久显示或选择时显示

## 安装方法

1. 将 `py-comfy-nodes` 文件夹复制到 ComfyUI 的 `custom_nodes` 目录下
2. 重启 ComfyUI
3. 节点将自动加载，可在 `py-utils` 分类中找到
4. 节点对齐工具将在选择多个节点时自动显示

## 使用说明

### Float to String 节点

1. 在 ComfyUI 界面中搜索 "py-utils: Float to String" 节点
2. 连接浮点数输入和小数位数参数
3. 节点将输出格式化的字符串

### Prompt Py From File 节点

1. 在 ComfyUI 界面中搜索 "py-utils: Prompt Py From File" 节点
2. 从下拉菜单中选择 pyPrompt.yaml 文件中的一个键名
3. 节点将输出所选键对应的 prompt 文本

### Prompt List 节点

1. 在 ComfyUI 界面中搜索 "py-utils: Prompt List" 节点
2. 在 string_1 ~ string_n 输入框中输入提示文本
3. 设置 string_count 指定要显示的字符串数量
4. 使用 index 滑杆选择要输出的字符串索引
5. 点击 "Update UI" 按钮更新界面（保持节点尺寸不变）
6. 节点将输出选定的字符串

### Text Concat Multi 节点

1. 在 ComfyUI 界面中搜索 "py-utils: Text Concat Multi" 节点
2. 设置 inputcount 指定输入数量
3. 点击 "Update inputs" 按钮更新输入
4. 连接要拼接的文本
5. 设置分隔符
6. 节点将输出拼接后的文本

### XYPlot LoRA Weights 节点

1. 在 ComfyUI 界面中搜索 "py-utils: XYPlot LoRA Weights" 节点
2. 在 `lora_name` 中选择要测试的 LoRA（只需选一次）
3. 选择生成方式：
   - `List`：在 `weights` 中写权重，例如 `0.2; 0.5; 0.8`（分号、逗号、换行均可）
   - `Range`：设置 `batch_count`、`first_weight`、`last_weight`，等距生成
4. 需要时调整 `weight_target`（默认作用于 model）与 `fixed_weight`
5. 将输出连到 easy-use 的 `easy XYPlotAdvanced` 节点的 `X`（或 `Y`）输入，运行即可得到权重对比图

> 注意：easy-use 的 XY Plot 在 X、Y 同时为 LoRA 轴时会把两个 LoRA 叠加应用，
> 因此同一个 LoRA 不要同时接到 X 和 Y 上，另一个轴建议用 CFG / Steps / 采样器等。

### 节点对齐工具

1. 选择多个节点
2. 控制面板将自动显示（或通过右键菜单手动显示）
3. 点击相应的对齐按钮执行操作
4. 拖动控制面板调整位置
5. 使用 "Toggle Mode" 按钮切换显示模式（永久显示或选择时显示）

## 快捷键和操作

- **选择节点**：按住 Shift 键点击节点
- **移动控制面板**：拖拽面板或分隔符
- **撤销操作**：点击撤销按钮或使用快捷键
- **重做操作**：点击重做按钮或使用快捷键
- **关闭面板**：点击关闭按钮

## 配置和自定义

### 存储位置

工具的配置信息存储在浏览器的 localStorage 中，包括：
- 控制面板位置
- 显示模式设置
- 可见性状态

### 自定义样式

如果需要自定义控制面板的样式，可以修改 `js/NodeAlignConstants.js` 文件中的 CSS 样式定义。

## 项目结构

```
py-comfy-nodes/
├── __init__.py                 # 项目初始化和节点注册
├── py_FloatToString.py         # 浮点数转字符串节点
├── py_PromptFromFile.py        # 从 YAML 文件读取 prompt 节点
├── py_PromptList.py            # 提示列表选择节点
├── py_TextConcatMulti.py       # 多文本拼接节点
├── py_MultiKeys.py             # 动态键值对节点
├── py_FileReader.py            # 文件读取节点
├── py_FileWriter.py            # 文件写入节点
├── py_Xyplot.py                # 同一 LoRA 多权重 XY 轴节点
├── js/
│   ├── NodeAlign.js            # 节点对齐工具主逻辑
│   ├── NodeAlignConstants.js   # SVG 图标和 CSS 样式定义
│   ├── TextConcatMulti.js      # 多文本拼接节点前端逻辑
│   ├── PromptList.js           # 提示列表节点前端逻辑
│   ├── XyplotLoraWeights.js    # XYPlot LoRA 权重节点前端逻辑
│   └── widgethider.js          # Widget 显示控制
└── README.md                   # 项目说明文档
```

## 更新日志

### 最新版本
- 新增 XYPlot LoRA Weights 节点，同一 LoRA 只需选择一次即可扫描多档权重
- 新增 Prompt List 节点，支持多行文本选择和动态数量控制
- 新增行号显示功能
- 新增 Update UI 按钮，更新界面时保持节点尺寸
- index 参数支持滑杆控件