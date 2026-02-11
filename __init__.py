# -*- coding: utf-8 -*-
"""
py-comfy-nodes 项目初始化文件

该文件主要负责：
1. 导入并注册自定义节点
2. 配置节点在 UI 中的显示名称
3. 设置前端代码目录路径
"""

from .py_FloatToString import FloatToString
from .py_PromptFromFile import PromptPyFromFile
from .py_MultiKeys import MultiKeys
from .py_FileReader import FileReader
from .py_FileWriter import FileWriter

# 节点类映射字典
# 键：节点注册名称（在工作流 JSON 中使用）
# 值：实际的节点类
NODE_CLASS_MAPPINGS = {
    "FloatToString": FloatToString,  # 浮点数转字符串节点
    "PromptPyFromFile": PromptPyFromFile,  # 从 pyPrompt.yaml 文件读取 prompt 节点
    "MultiKeys": MultiKeys,  # 动态key数目节点
    "FileReader": FileReader,  # 文件读取节点
    "FileWriter": FileWriter,  # 文件写入节点
}

# 节点显示名称映射字典
# 键：节点注册名称
# 值：在 ComfyUI 界面中显示的名称
NODE_DISPLAY_NAME_MAPPINGS = {
    "FloatToString": "py-utils: Float to String",  # 节点显示名称，包含分类前缀
    "PromptPyFromFile": "py-utils: Prompt Py From File",  # 节点显示名称，包含分类前缀
    "MultiKeys": "py-utils: Multi Keys",  # 节点显示名称，包含分类前缀
    "FileReader": "py-utils: File Reader",  # 节点显示名称，包含分类前缀
    "FileWriter": "py-utils: File Writer",  # 节点显示名称，包含分类前缀
}

# 前端代码目录路径
# 该目录包含所有需要加载的 JavaScript 文件
WEB_DIRECTORY = "js"

# 模块导出列表
# 定义了该模块被导入时，哪些变量会被导出
__all__ = [
    "NODE_CLASS_MAPPINGS",        # 节点类映射
    "NODE_DISPLAY_NAME_MAPPINGS", # 节点显示名称映射
    "WEB_DIRECTORY"               # 前端代码目录
]
