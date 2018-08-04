var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,

    properties: {},

    start() {
        this.player1 = this.nodeDict["player1"].getComponent("resultPlayerIcon");
        this.player1.node.active = false;
        this.player2 = this.nodeDict["player2"].getComponent("resultPlayerIcon");
        this.player2.node.active = false;
        this.player3 = this.nodeDict["player3"].getComponent("resultPlayerIcon");
        this.player3.node.active = false;
    },

    setData: function() {

    }
});
