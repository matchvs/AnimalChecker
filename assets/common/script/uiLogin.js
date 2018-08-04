var uiPanel = require("uiPanel");
cc.Class({
    extends: uiPanel,
    properties: {},

    onLoad() {
        this._super();
        this.nodeDict["start"].on("click", this.startGame, this);
    },

    startGame() {
        Game.GameManager.matchVsInit();
    }
});
