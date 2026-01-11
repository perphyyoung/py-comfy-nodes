from .nodes import FloatToString

NODE_CLASS_MAPPINGS = {
    "FloatToString": FloatToString,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "FloatToString": "py-utils: Float to String",
}

WEB_DIRECTORY = "js"
__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
