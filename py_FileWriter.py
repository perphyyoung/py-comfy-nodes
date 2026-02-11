# -*- coding: utf-8 -*-
"""
文件写入节点

该节点实现将文本内容写入到指定路径的文件中
"""

import os


class FileWriter:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "content": ("STRING", {"forceInput": True}),
                "dir_path": ("STRING", {"default": "", "multiline": False}),
                "file_name": ("STRING", {"default": "", "multiline": False}),
                "append_mode": (["overwrite", "append_end"], {"default": "append_end"}),
                "encoding": ("STRING", {"default": "utf-8"}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("result",)
    FUNCTION = "write_file"
    CATEGORY = "py-utils"

    def write_file(self, dir_path, file_name, content, append_mode="append_end", encoding="utf-8"):
        """
        写入文本内容到文件
        
        Args:
            dir_path (str): 文件目录路径
            file_name (str): 文件名称
            content (str): 要写入的文本内容
            append_mode (str): 写入模式，可选值: "overwrite"(覆盖), "append_end"(追加到末尾)
            encoding (str): 文件编码，默认为utf-8
            
        Returns:
            tuple: 包含操作结果的元组
        """
        result = ""
        
        # 检查文件路径是否为空
        if not dir_path:
            return ("Error: dir_path is empty",)
        
        # 检查文件名称是否为空
        if not file_name:
            return ("Error: file_name is empty",)
        
        # 检查目录是否存在，不存在则创建
        if not os.path.exists(dir_path):
            try:
                os.makedirs(dir_path, exist_ok=True)
            except Exception as e:
                return (f"Error creating directory: {e}",)
        
        # 构建完整文件路径
        full_path = os.path.join(dir_path, file_name)
        
        try:
            if append_mode == "overwrite":
                # 覆盖模式
                with open(full_path, "w", encoding=encoding) as f:
                    f.write(content)
                result = f"Successfully written to: {full_path}"
            elif append_mode == "append_end":
                # 追加到末尾模式
                with open(full_path, "a", encoding=encoding) as f:
                    f.write("\n" + content)
                result = f"Successfully appended to end: {full_path}"
            else:
                result = f"Error: Invalid append_mode: {append_mode}"
        except Exception as e:
            result = f"Error writing file: {e}"
        
        return (result,)
