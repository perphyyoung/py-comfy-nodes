import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "py-comfy-nodes.TextConcatMulti",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "TextConcatMulti") {
            nodeType.prototype.onNodeCreated = function () {
                this._type = "STRING"
                this.addWidget("button", "Update inputs", null, () => {
                    if (!this.inputs) {
                        this.inputs = [];
                    }
                    const target_number_of_inputs = this.widgets.find(w => w.name === "inputcount")["value"];
                    const num_inputs = this.inputs.filter(input => input.type === this._type).length
                    if(target_number_of_inputs===num_inputs)return;

                    if(target_number_of_inputs < num_inputs){
                        const inputs_to_remove = num_inputs - target_number_of_inputs;
                        for(let i = 0; i < inputs_to_remove; i++) {
                            this.removeInput(this.inputs.length - 1);
                        }
                    }
                    else{
                        for(let i = num_inputs+1; i <= target_number_of_inputs; ++i)
                            this.addInput(`text_${i}`, this._type, {forceInput: true});
                    }
                });
            }
        }
    }
});
