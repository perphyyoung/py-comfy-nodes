# -*- coding: utf-8 -*-
"""
文件读取节点

该节点实现读取特定路径的文本文件，输出文件的内容
"""

import os


class FileReader:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "file_path": ("STRING", {"default": "", "multiline": False}),
                "encoding": ("STRING", {"default": "utf-8"}),
                "strip_whitespace": ("BOOLEAN", {"default": True}),
            },
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("content",)
    FUNCTION = "read_file"
    CATEGORY = "py-utils"

    def read_file(self, file_path, encoding="utf-8", strip_whitespace=True):
        """
        读取文本文件内容
        
        Args:
            file_path (str): 文件路径
            encoding (str): 文件编码，默认为utf-8
            strip_whitespace (bool): 是否去除首尾空白字符，默认为True
            
        Returns:
            tuple: 包含文件内容的元组
        """
        content = ""
        
        # 检查文件路径是否为空
        if not file_path:
            return (content,)
        
        # 检查文件是否存在
        if not os.path.exists(file_path):
            return (content,)
        
        # 检查是否是文件
        if not os.path.isfile(file_path):
            return (content,)
        
        try:
            # 读取文件内容
            with open(file_path, "r", encoding=encoding) as f:
                content = f.read()
            
            # 去除首尾空白字符
            if strip_whitespace:
                content = content.strip()
                
        except Exception as e:
            print(f"Error reading file: {e}")
            content = ""
        
        return (content,)
