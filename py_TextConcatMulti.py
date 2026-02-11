# -*- coding: utf-8 -*-
"""
多文本拼接节点

该节点实现将多个文本内容拼接在一起
"""


class TextConcatMulti:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "inputcount": ("INT", {"default": 2, "min": 2, "max": 1000, "step": 1}),
                "text_1": ("STRING", {"forceInput": True}),
                "separator": ("STRING", {"default": "\n"}),
            },
            "optional": {
                "text_2": ("STRING", {"forceInput": True}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("result",)
    FUNCTION = "concat"
    CATEGORY = "py-utils"
    DESCRIPTION = """
Concatenates multiple text strings together.
You can set how many inputs the node has,
with the **inputcount** and clicking update.
"""

    def concat(self, inputcount, separator, **kwargs):
        result = ""
        for c in range(1, inputcount + 1):
            text = kwargs.get(f"text_{c}", "")
            if c == 1:
                result = text
            else:
                if result and text:
                    result = result + separator + text
                elif text:
                    result = result + text
        return (result,)
