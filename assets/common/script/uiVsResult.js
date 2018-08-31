var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,

    properties: {
        loseClip: {
            default: null,
            url: cc.AudioClip
        },
        victoryClip: {
            default: null,
            url: cc.AudioClip
        },
        redFrame: cc.SpriteFrame,
        blueFrame: cc.SpriteFrame,
    },

    isWin (flag) {
        if (flag) {
            cc.audioEngine.play(this.victoryClip, false, 1);
        } else {
            cc.audioEngine.play(this.loseClip, false, 1);
        }
        this.nodeDict["lose"].active = !flag;
        this.nodeDict["win"].active = flag;
        this.nodeDict["draw"].active = false;
    },

    draw () {
        this.nodeDict["lose"].active = false;
        this.nodeDict["win"].active = false;
        this.nodeDict["draw"].active = true;
        cc.audioEngine.play(this.victoryClip, false, 1);
    },

    setData (winFlag) {
        if (winFlag === GLB.PLAYER_FLAG.RED && GLB.isRoomOwner) {
            this.isWin(true);
        } else if (winFlag === GLB.PLAYER_FLAG.BLUE && !GLB.isRoomOwner) {
            this.isWin(true);
        } else if (winFlag === null) {
            this.draw();
        } else {
            this.isWin(false);
            return;
        }
        Game.GameManager.loginServer();
    },

    setFrameColor () {
        if(GLB.isRoomOwner) {
            this.leftFrameSprite.spriteFrame = this.redFrame;
            this.rightFrameSprite.spriteFrame = this.blueFrame;
        } else {
            this.leftFrameSprite.spriteFrame = this.blueFrame;
            this.rightFrameSprite.spriteFrame = this.redFrame;
        }
    },

    start() {
        this.player = this.nodeDict["player"].getComponent("resultPlayerIcon");
        this.player.setData(GLB.playerUserIds[0]);
        this.rival = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        this.rival.setData(GLB.playerUserIds[1]);
        this.nodeDict["vs"].active = true;
        this.nodeDict["score"].active = false;
        this.leftFrameSprite =  this.nodeDict['leftFrame'].getComponent(cc.Sprite);
        this.rightFrameSprite = this.nodeDict['rightFrame'].getComponent(cc.Sprite);
        this.setFrameColor();
        // var gamePanel = uiFunc.findUI("uiGamePanel");
        // if (gamePanel) {
        //     var gamePanelScript = gamePanel.getComponent("uiGamePanel");
        //     this.selfScore = gamePanelScript.selfScore;
        //     this.otherScore = gamePanelScript.otherScore;
        // }
        // if (this.selfScore >= this.otherScore) {
        //     this.nodeDict["lose"].active = false;
        //     this.nodeDict["win"].active = true;
        // } else {
        //     this.nodeDict["lose"].active = true;
        //     this.nodeDict["win"].active = false;
        // }
        // var isWin = this.selfScore >= this.otherScore;
        // if (isWin) {
        //     cc.audioEngine.play(this.victoryClip, false, 1);
        // } else {
        //     cc.audioEngine.play(this.loseClip, false, 1);
        // }
        //
        // this.nodeDict["playerScore"].getComponent(cc.Label).string = this.selfScore;
        // this.nodeDict["rivalScore"].getComponent(cc.Label).string = this.otherScore;

        this.nodeDict["quit"].on("click", this.quit, this);

        // if (isWin) {
        //     // 发送胜局记录--
        //     Game.GameManager.loginServer();
        // }
    },

    quit: function() {
        mvs.engine.leaveRoom("");
        var gamePanel = uiFunc.findUI("uiGamePanel");
        if (gamePanel) {
            uiFunc.closeUI("uiGamePanel");
            gamePanel.destroy();
        }
        uiFunc.closeUI(this.node.name);
        this.node.destroy();


        Game.GameManager.lobbyShow();
    }
});
