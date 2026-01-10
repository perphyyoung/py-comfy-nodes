class FloatToString:
    RETURN_TYPES = ("STRING",)
    CATEGORY = "py-utils"
    FUNCTION = "convert_float_to_string"

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "float_value": ("FLOAT", {
                    "default": 0.0,
                    "min": -1000000.0,
                    "max": 1000000.0,
                    "step": 0.000001
                }),
                "decimal_places": ("INT", {
                    "default": 6,
                    "min": 0,
                    "max": 10,
                    "step": 1
                })
            },
        }

    def convert_float_to_string(self, float_value, decimal_places):
        format_string = f"{{:.{decimal_places}f}}"
        return (format_string.format(float_value),)
