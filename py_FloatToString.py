# -*- coding: utf-8 -*-
"""
自定义节点定义文件

该文件包含所有在 py-comfy-nodes 项目中定义的自定义节点类
"""

class FloatToString:
    """
    浮点数转字符串节点
    
    该节点用于将浮点数转换为指定小数位数的字符串格式
    
    属性:
        RETURN_TYPES: 定义节点输出的数据类型
        CATEGORY: 节点在 ComfyUI 中的分类
        FUNCTION: 节点执行时调用的方法名
    """
    
    # 节点输出的数据类型，这里返回一个字符串类型
    RETURN_TYPES = ("STRING",)
    
    # 节点分类，用于在 ComfyUI 界面中组织节点
    CATEGORY = "py-utils"
    
    # 节点执行时调用的方法名
    FUNCTION = "convert_float_to_string"

    @classmethod
    def INPUT_TYPES(s):
        """
        定义节点的输入参数
        
        返回:
            dict: 包含输入参数定义的字典
        """
        return {
            "required": {
                # 浮点数输入参数
                "float_value": ("FLOAT", {
                    "default": 0.0,           # 默认值
                    "min": -1000000.0,         # 最小值
                    "max": 1000000.0,          # 最大值
                    "step": 0.000001           # 步长
                }),
                # 小数位数输入参数
                "decimal_places": ("INT", {
                    "default": 6,              # 默认值
                    "min": 0,                  # 最小值（0表示不保留小数）
                    "max": 10,                 # 最大值
                    "step": 1                  # 步长
                })
            },
        }

    def convert_float_to_string(self, float_value, decimal_places):
        """
        将浮点数转换为字符串
        
        参数:
            float_value (float): 要转换的浮点数
            decimal_places (int): 保留的小数位数
            
        返回:
            tuple: 包含转换后字符串的元组
        """
        # 创建格式化字符串，指定小数位数
        format_string = f"{{:.{decimal_places}f}}"
        # 格式化浮点数并返回结果（注意：ComfyUI 节点返回值必须是元组）
        return (format_string.format(float_value),)

