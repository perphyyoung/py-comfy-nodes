# -*- coding: utf-8 -*-
"""
提示列表节点

该节点实现从多个提示文本中选择一个进行输出
支持动态指定 string 的数目
"""


class PromptList:
    MAX_STRINGS = 10  # 最大支持的字符串数量
    
    @classmethod
    def INPUT_TYPES(s):
        inputs = {
            "required": {},
            "optional": {},
        }
        
        # 动态添加 string 输入（放在前面）
        for i in range(1, s.MAX_STRINGS + 1):
            inputs["required"][f"string_{i}"] = ("STRING", {"multiline": True, "default": ""})
        
        # 将 string_count 和 index 放在最后
        inputs["required"]["string_count"] = ("INT", {"default": 3, "min": 1, "max": s.MAX_STRINGS, "step": 1})
        inputs["required"]["index"] = ("INT", {"default": 1, "min": 1, "max": s.MAX_STRINGS, "step": 1, "slider": True})
        
        return inputs

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("selected_string",)
    FUNCTION = "select_string"
    CATEGORY = "py-utils"
    DESCRIPTION = """
Selects one string from a list of multiline strings based on the index.
Set string_count to specify how many strings to display.
"""

    def select_string(self, string_count, index, **kwargs):
        # 收集所有非空的字符串
        strings = []
        for i in range(1, string_count + 1):
            key = f"string_{i}"
            value = kwargs.get(key, "")
            strings.append(value)
        
        # 确保索引在有效范围内
        if 1 <= index <= len(strings):
            return (strings[index - 1],)
        else:
            return ("",)