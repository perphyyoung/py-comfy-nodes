# -*- coding: utf-8 -*-
"""
动态Key节点

该节点实现动态的key数目，默认3个，最多10个
参考 py_PromptFromFile.py 从 YAML 文件读取数据
"""

import os
import yaml


class MultiKeys:
    @classmethod
    def INPUT_TYPES(s):
        # 构建 YAML 文件路径
        yaml_folder = os.path.join(os.path.dirname(__file__), "yaml_folder")
        py_prompt_path = os.path.join(yaml_folder, "pyPrompt.yaml")
        
        # 读取 pyPrompt.yaml 文件，获取所有可用的 key
        available_keys = ["None"]  # 始终添加"None"作为第一个选项
        if os.path.exists(py_prompt_path):
            with open(py_prompt_path, "r", encoding="utf-8") as f:
                try:
                    data = yaml.safe_load(f)
                    if isinstance(data, dict):
                        # 将YAML文件中的key添加到可用的key列表中
                        for key in data.keys():
                            if key != "None":  # 避免重复添加"None"
                                available_keys.append(key)
                except yaml.YAMLError as e:
                    print(f"Error loading pyPrompt.yaml: {e}")
        
        inputs = {
            "required": {
                "key_count": (
                    "INT",
                    {"default": 3, "min": 1, "max": 5, "step": 1},
                ),
                "delimiter": ("STRING", {"default": ", "}),
                "clean_whitespace": ("BOOLEAN", {"default": True}),
                "replace_underscore": ("BOOLEAN", {"default": True}),
            },
            "optional": {
                "prefix": (
                    "STRING",
                    {
                        "default": "",
                    },
                ),
            },
        }

        for i in range(1, 6):
            inputs["required"][f"key_{i}"] = (
                available_keys,
                {"default": "None"},
            )

        return inputs

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("text",)
    FUNCTION = "dynamic_key"
    CATEGORY = "py-utils"

    def dynamic_key(
        self, key_count, delimiter, clean_whitespace, replace_underscore, prefix=None, **kwargs
    ):
        # 构建 YAML 文件路径
        yaml_folder = os.path.join(os.path.dirname(__file__), "yaml_folder")
        py_prompt_path = os.path.join(yaml_folder, "pyPrompt.yaml")
        
        # 读取 pyPrompt.yaml 文件
        data = {}
        if os.path.exists(py_prompt_path):
            with open(py_prompt_path, "r", encoding="utf-8") as f:
                try:
                    loaded_data = yaml.safe_load(f)
                    if isinstance(loaded_data, dict):
                        data = loaded_data
                except yaml.YAMLError as e:
                    print(f"Error loading pyPrompt.yaml: {e}")
        
        values = []
        
        for i in range(1, key_count + 1):
            key = kwargs.get(f"key_{i}", "")
            
            # 如果key为"None"，跳过处理
            if key == "None":
                continue
                
            value = data.get(key, "")
            
            if clean_whitespace:
                value = value.strip()
            
            if replace_underscore:
                value = value.replace("_", " ")
            
            if value:
                values.append(value)
        
        if delimiter in ("\n", "\\n"):
            delimiter = "\n"
        
        merged_text = delimiter.join(values)
        
        # 如果提供了prefix，将其添加到结果的开头
        if prefix:
            merged_text = f"{prefix}{delimiter}{merged_text}"
        
        return (merged_text,)
