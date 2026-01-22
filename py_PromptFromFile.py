# -*- coding: utf-8 -*-
"""
从 YAML 文件读取 prompt 的节点

该模块实现了一个 ComfyUI 节点，可以从指定的 YAML 文件中读取 prompt 文本。
"""

import os
import yaml


class PromptPyFromFile:
    """从 pyPrompt.yaml 文件读取 prompt 的节点类"""

    # 节点输入类型定义
    @classmethod
    def INPUT_TYPES(cls):
        """定义节点的输入参数"""
        # 构建 YAML 文件路径
        yaml_folder = os.path.join(os.path.dirname(__file__), "yaml_folder")
        py_prompt_path = os.path.join(yaml_folder, "pyPrompt.yaml")
        
        # 读取 pyPrompt.yaml 文件，获取所有可用的 key
        available_keys = []
        if os.path.exists(py_prompt_path):
            with open(py_prompt_path, "r", encoding="utf-8") as f:
                try:
                    data = yaml.safe_load(f)
                    if isinstance(data, dict):
                        available_keys = list(data.keys())
                except yaml.YAMLError as e:
                    print(f"Error loading pyPrompt.yaml: {e}")
        
        # 如果没有可用的 key，添加一个默认值
        if not available_keys:
            available_keys = ["default"]
        
        return {
            "required": {
                "key": (available_keys, {"default": "pos-quality"}),  # 从 pyPrompt.yaml 文件中获取的 key 列表
            },
            "optional": {
                "key2": (available_keys, {"default": "pos-real"}),  # 第二个 key，默认值为空
            },
        }

    # 节点输出类型定义
    RETURN_TYPES = ("STRING", "STRING", "STRING")  # 输出类型为字符串
    RETURN_NAMES = ("prompt", "prompt2", "prompt-concat")  # 输出名称为 prompt、prompt2 和 prompt-concat

    # 节点执行的函数
    FUNCTION = "load_prompt"

    # 节点分类
    CATEGORY = "py-utils"

    def load_prompt(self, key, key2=""):
        """加载指定 key 对应的 prompt 文本"""
        # 构建 YAML 文件路径
        yaml_folder = os.path.join(os.path.dirname(__file__), "yaml_folder")
        py_prompt_path = os.path.join(yaml_folder, "pyPrompt.yaml")
        
        # 读取 pyPrompt.yaml 文件
        prompt = ""
        prompt2 = ""
        if os.path.exists(py_prompt_path):
            with open(py_prompt_path, "r", encoding="utf-8") as f:
                try:
                    data = yaml.safe_load(f)
                    if isinstance(data, dict):
                        if key in data:
                            prompt = data[key]
                        if key2 and key2 in data:
                            prompt2 = data[key2]
                except yaml.YAMLError as e:
                    print(f"Error loading pyPrompt.yaml: {e}")
        
        # 生成 prompt-concat，用逗号连接 prompt 和 prompt2，并删除多余的逗号
        prompts = [p for p in [prompt, prompt2] if p]
        prompt_concat = ", ".join(prompts)
        
        return (prompt, prompt2, prompt_concat)
