var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,
    properties: {},

    onLoad() {
        this._super();
        setTimeout(function() {
            if (this && this.node) {
                uiFunc.closeUI(this.node.name);
                this.node.destroy();
            }
        }.bind(this), 2000);
    },

    setData(content){
        this.nodeDict["tipLb"].getComponent(cc.Label).string = content;
    }
});
