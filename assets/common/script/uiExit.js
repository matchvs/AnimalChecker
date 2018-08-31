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

        // var winFlag;
        // if (GLB.isRoomOwner) {
        //     winFlag = GLB.PLAYER_FLAG.BLUE;
        // } else {
        //     winFlag = GLB.PLAYER_FLAG.RED;
        // }

        // var msg = {
        //     action: GLB.GAME_OVER_EVENT,
        //     winFlag: winFlag
        // }
        // Game.GameManager.sendEvent(msg);

        Game.GameManager.gameState = GameState.Over;
        var msg = {
            action: GLB.EXIT
        }
        Game.GameManager.sendEvent(msg);
        // 不进入结算页面，进入大厅
        clientEvent.dispatch(clientEvent.eventType.gameOver);

        // 这里不先close就会destroy
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
            uiFunc.closeUI("uiGamePanel");
            gamePanel.destroy();
        }
        mvs.engine.leaveRoom();
        Game.GameManager.isLoadGame = false;
        Game.GameManager.lobbyShow();
        uiFunc.closeUI(this.node.name);
        this.node.destroy();

    }
});
