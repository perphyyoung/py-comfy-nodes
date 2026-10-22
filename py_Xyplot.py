# -*- coding: utf-8 -*-
"""
XY Plot LoRA 权重节点

配合 ComfyUI-Easy-Use 的 XY 轴输入协议（X_Y 类型）使用：
只需选择一个 LoRA，节点会自动生成多组「同一个 LoRA + 不同权重」的取值，
无需在 easy-use 的「XY Inputs: Lora」里重复挑选同一个 LoRA。

输出为 easy-use 的 "advanced: Lora" 轴，每项取值格式固定为四段：
    lora_name,model_strength,clip_strength,label
例如：
    my_lora.safetensors,0.6,0.6,
其中第四段仅用于在 XY 图的标签上显示额外文字。
"""

import re

import folder_paths

# easy-use 的 XYPlot 会把列表按 "; " 拼接成字符串后按 "," 拆成四段
AXIS_NAME = "advanced: Lora"
WEIGHT_MODES = ["List", "Range"]
WEIGHT_TARGETS = ["model+clip", "model", "clip"]
MAX_WEIGHT_COUNT = 50
# 权重最多保留的小数位数
WEIGHT_DECIMALS = 2

# 权重列表支持分号、逗号、空白字符（含换行）作为分隔符
_SPLIT_PATTERN = re.compile(r"[;,\s]+")


def format_number(value):
    """把权重格式化成最多 2 位小数的紧凑字符串：0.60 -> 0.6，1.00 -> 1，0.00 -> 0"""
    text = f"{float(value):.{WEIGHT_DECIMALS}f}".rstrip("0").rstrip(".")
    if text in ("", "-0", "+0"):
        return "0"
    return text


def generate_range(count, first_weight, last_weight):
    """按数量在首尾权重之间等距取值，结果四舍五入到 2 位小数"""
    if count < 1:
        return []
    if count == 1:
        return [round(float(first_weight), WEIGHT_DECIMALS)]
    step = (float(last_weight) - float(first_weight)) / (count - 1)
    return [
        round(float(first_weight) + index * step, WEIGHT_DECIMALS)
        for index in range(count)
    ]


def parse_weight_list(text):
    """解析手写权重列表，支持 "0.2; 0.5; 0.8"、"0.2,0.5,0.8" 或逐行书写"""
    tokens = [token for token in _SPLIT_PATTERN.split((text or "").strip()) if token]
    if not tokens:
        raise ValueError("权重列表为空，请填入类似 0.2; 0.5; 0.8 的权重")

    weights = []
    for token in tokens:
        try:
            weights.append(float(token))
        except ValueError:
            raise ValueError(
                f"无法解析权重 {token!r}，请用分号、逗号或换行分隔数字，例如 0.2; 0.5; 0.8"
            )
    return weights


class XyplotLoraWeights:
    """同一 LoRA 多权重 XY 轴输入节点"""

    @classmethod
    def INPUT_TYPES(cls):
        loras = ["None"] + folder_paths.get_filename_list("loras")
        return {
            "required": {
                "lora_name": (loras, {"tooltip": "只在这里选择一次 LoRA，其余权重由下面参数生成"}),
                "weight_mode": (WEIGHT_MODES, {"default": "List"}),
                "weights": (
                    "STRING",
                    {
                        "default": "0.0; 1.0",
                        "multiline": True,
                        "placeholder": "用分号、逗号或换行分隔权重，例如\n0.2; 0.5; 0.8",
                        "tooltip": "weight_mode = List 时生效，顺序即网格顺序；权重最多保留 2 位小数",
                    },
                ),
                "batch_count": (
                    "INT",
                    {"default": 5, "min": 1, "max": MAX_WEIGHT_COUNT, "step": 1,
                     "tooltip": "weight_mode = Range 时生效，自动生成多少档权重"},
                ),
                "first_weight": (
                    "FLOAT",
                    {"default": 0.0, "min": -10.0, "max": 10.0, "step": 0.01,
                     "tooltip": "weight_mode = Range 时的起始权重"},
                ),
                "last_weight": (
                    "FLOAT",
                    {"default": 1.0, "min": -10.0, "max": 10.0, "step": 0.01,
                     "tooltip": "weight_mode = Range 时的结束权重"},
                ),
                "weight_target": (
                    WEIGHT_TARGETS,
                    {"default": "model",
                     "tooltip": "权重作用在哪些强度上；未被扫描的一方使用 fixed_weight"},
                ),
                "fixed_weight": (
                    "FLOAT",
                    {"default": 1.0, "min": -10.0, "max": 10.0, "step": 0.01,
                     "tooltip": "未被扫描的一方固定使用的强度"},
                ),
            },
            "optional": {
                "label_suffix": (
                    "STRING",
                    {"default": "", "tooltip": "追加到 XY 图标签后的文字，留空则自动处理"},
                ),
            },
        }

    RETURN_TYPES = ("X_Y", "STRING")
    RETURN_NAMES = ("X or Y", "weights info")
    FUNCTION = "xy_value"
    CATEGORY = "py-utils"
    DESCRIPTION = (
        "选择一次 LoRA，生成同一 LoRA 多组不同权重的 XY 轴取值，"
        "直接连到 easy-use 的 XY Plot（X/Y 输入）。"
    )

    def xy_value(
        self,
        lora_name,
        weight_mode,
        weights,
        batch_count,
        first_weight,
        last_weight,
        weight_target,
        fixed_weight,
        label_suffix="",
    ):
        if not lora_name or lora_name == "None":
            raise ValueError("请选择一个 LoRA（lora_name 不能是 None）")

        # 文件名中的逗号会破坏 easy-use 的四段解析，提前给出明确提示
        if "," in lora_name:
            raise ValueError(
                f"LoRA 文件名包含逗号，easy-use 的 XY Plot 无法解析：{lora_name}"
            )

        if weight_mode == "Range":
            weight_values = generate_range(batch_count, first_weight, last_weight)
        else:
            weight_values = parse_weight_list(weights)

        if not weight_values:
            raise ValueError("没有生成任何权重，请检查权重列表或权重范围参数")
        if len(weight_values) > MAX_WEIGHT_COUNT:
            raise ValueError(
                f"权重档位过多（{len(weight_values)}），最多支持 {MAX_WEIGHT_COUNT} 档"
            )

        # 第四段只用于图表标签，需去掉会破坏分隔符的字符
        suffix = (label_suffix or "").strip().replace(",", "*").replace(";", "*")

        values = []
        for weight in weight_values:
            model_strength = weight if weight_target in ("model+clip", "model") else fixed_weight
            clip_strength = weight if weight_target in ("model+clip", "clip") else fixed_weight

            label = suffix
            if not label and weight_target == "clip":
                # 图表标签只显示 model 强度，扫描 clip 时补一个标记便于区分
                label = f"c:{format_number(weight)}"

            values.append(
                "{},{},{},{}".format(
                    lora_name,
                    format_number(model_strength),
                    format_number(clip_strength),
                    label,
                )
            )

        info = "{} | {} | {}".format(
            lora_name,
            weight_target,
            ", ".join(format_number(weight) for weight in weight_values),
        )
        return ({"axis": AXIS_NAME, "values": values, "lora_stack": []}, info)
