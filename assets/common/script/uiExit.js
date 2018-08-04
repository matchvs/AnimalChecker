var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,
    properties: {},

    onLoad() {
        this._super();
        this.nodeDict["sure"].on("click", this.sure, this);
        this.nodeDict["close"].on("click", this.close, this);
    },

    close() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    sure() {

        var winFlag;
        if (GLB.isRoomOwner) {
            winFlag = GLB.PLAYER_FLAG.BLUE;
        } else {
            winFlag = GLB.PLAYER_FLAG.RED;
        }
        Game.GameManager.gameState = GameState.Over;
        var msg = {
            action: GLB.GAME_OVER_EVENT,
            winFlag: winFlag
        }
        Game.GameManager.sendEventEx(msg);

        // var gamePanel = uiFunc.findUI("uiGamePanel");
        // if (gamePanel) {
        //     uiFunc.closeUI("uiGamePanel");
        //     gamePanel.destroy();
        // }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();

    }
});
