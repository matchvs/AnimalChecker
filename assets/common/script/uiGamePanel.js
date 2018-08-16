var mvs = require("Matchvs");
var GLB = require("Glb");


cc.Class({
    extends: cc.Component,

    properties: {
        // redFlag: cc.SpriteFrame,
        // blueFlag: cc.SpriteFrame,
        // redArrow: cc.SpriteFrame,
        // blueArrow: cc.SpriteFrame
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.setPicture();
        // this.leftBgSprite = this.node.getChildByName('bgImg').getChildByName('colorImg').getChildByName('left').getComponent(cc.Sprite);
        // this.blueBgSprite = this.node.getChildByName('bgImg').getChildByName('colorImg').getChildByName('right').getComponent(cc.Sprite);
        this.leftBgSprite = this.node.getChildByName('headImg').getChildByName('imgBgLeft').getComponent(cc.Sprite);
        this.blueBgSprite = this.node.getChildByName('headImg').getChildByName('imgBgRight').getComponent(cc.Sprite);
        this.timeNode = this.node.getChildByName('time');
        this.timeLeftNode = this.timeNode.getChildByName('left');
        this.timeRightNode = this.timeNode.getChildByName('right');
        this.timeLeftTxt = this.node.getChildByName('leftTimeTxt');
        this.timeRightTxt = this.node.getChildByName('rightTimeTxt');
        this.leftArrowSprite = this.timeLeftNode.getChildByName('jiantou').getComponent(cc.Sprite);
        this.rightArrowSprite = this.timeRightNode.getChildByName('jiantou').getComponent(cc.Sprite);
        this.timeLeftNumNode = this.timeNode.getChildByName('leftTimeNum');
        this.timeRightNumNode = this.timeNode.getChildByName('rightTimeNum');
        this.readyNode = this.node.getChildByName('readyGo');
        this.timeNumNode = this.timeNode.getChildByName('num');
        this.timeNumLabel = this.timeNumNode.getComponent(cc.Label);
        this.timeAnim = this.timeNumNode.getComponent(cc.Animation);
        this.readyAnim = this.readyNode.getComponent(cc.Animation);
        this.readyAnim.on('finished', this.gameStart, this);
        this.selfIcon = this.node.getChildByName('headImg').getChildByName('leftImgMask').getChildByName('leftImg');
        this.rivalIcon = this.node.getChildByName('headImg').getChildByName('rightImgMask').getChildByName('rightImg');
        clientEvent.on(clientEvent.eventType.updateTime, this.updateTime.bind(this));
        clientEvent.on(clientEvent.eventType.countTime, this.countTime.bind(this));
        clientEvent.on(clientEvent.eventType.changeFlag, this.changeFlag.bind(this));
        clientEvent.on(clientEvent.eventType.roundStart, this.roundStart.bind(this));
        clientEvent.on(clientEvent.eventType.gameOver, this.gameOver.bind(this));
        clientEvent.on(clientEvent.eventType.stopTimeWarnAnim, this.stopTimeWarnAnim.bind(this));
        this.readyGoAudio = this.readyNode.getComponent(cc.AudioSource);
    },

    setPicture () {
         var redFlagUrl = cc.url.raw("resources/picture/animal/" + "redHead" + ".png");
         this.redFlag = new cc.SpriteFrame(redFlagUrl);
         var blueFlagUrl = cc.url.raw("resources/picture/animal/" + "blueHead" + ".png");
         this.blueFlag = new cc.SpriteFrame(blueFlagUrl);
         var redArrowUrl = cc.url.raw("resources/picture/animal/" + "redTime" + ".png");
         this.redArrow = new cc.SpriteFrame(redArrowUrl);
         var blueArrowUrl = cc.url.raw("resources/picture/animal/" + "blueTime" + ".png");
         this.blueArrow = new cc.SpriteFrame(blueArrowUrl);
    },

    setHeadIcon () {
        this.selfIcon.getComponent('playerIcon').setData({id: GLB.playerUserIds[0]});
        this.rivalIcon.getComponent('playerIcon').setData({id: GLB.playerUserIds[1]});
    },

    gameOver () {
        this.stopTimeWarnAnim();
        this.setTimeNumFont();
        if(this.interval === null) return;
        clearInterval(this.interval);
    },

    setTimeNumFont () {
        this.timeNumLabel.fontSize = 35;
    },

    roundStart () {
        this.timeLabelInit();
        this.interval = null;
        this.playerFlag = GLB.PLAYER_FLAG.RED;
        // this.getTurn(this.playerFlag);
        user.init();
        this.headColorInit();
        clientEvent.dispatch(clientEvent.eventType.getMap);
        this.playReadyGo();
        this.setTimeNumFont();
        this.setHeadIcon();
    },

    playReadyGo() {
        this.readyAnim.play();
        this.readyGoAudio.play();
    },

    playTimeWarnAnim () {
        // TODO 初始化当前的状态；
        this.timeAnim.play();
    },

    stopTimeWarnAnim () {
        this.timeAnim.stop();
    },

    timeLabelInit () {
        this.timeNode.active = false;
        this.timeNumLabel.string = 30;
        this.timeNode.getChildByName('num').setScale(1,1);
    },

    gameStart () {

        // this.timeLabelInit();
        Game.GameManager.gameState = GameState.Play;
        this.countTime();
        if (GLB.isRoomOwner) {
            uiFunc.openUI('uiRoundTip', function (panel) {
                var uiRoundTip = panel.getComponent('uiRoundTip');
                uiRoundTip.setData(GLB.ROUND_TIP.SELF);
            })
        }
    },

    headColorInit () {
        // 主机为红色方；
        var leftSprite,rightSprite;
        if (GLB.isRoomOwner) {
            leftSprite = this.redFlag;
            rightSprite = this.blueFlag;
            this.leftArrowSprite.spriteFrame = this.redArrow;
            this.rightArrowSprite.spriteFrame = this.blueArrow;
        } else {
            leftSprite = this.blueFlag;
            rightSprite = this.redFlag;
            this.leftArrowSprite.spriteFrame = this.blueArrow;
            this.rightArrowSprite.spriteFrame = this.redArrow;
        }
        this.leftBgSprite.spriteFrame = leftSprite;
        this.blueBgSprite.spriteFrame = rightSprite;
    },

    exit() {
        uiFunc.openUI("uiExit");
    },

    countTime () {
        clearInterval(this.interval);
        if (!GLB.isRoomOwner || Game.GameManager.gameState !== GameState.Play) return;
        this.time = 30;
        this.countDownEvent();
        this.interval = setInterval(function() {
            this.time--;
            this.countDownEvent();
            if(this.time <= 0 && Game.GameManager.gameState === GameState.Play) {
                console.log('超时；获胜方====' + this.playerFlag === GLB.PLAYER_FLAG.RED ? '蓝色':'红色');
                var winFlag = this.playerFlag === GLB.PLAYER_FLAG.RED ? GLB.PLAYER_FLAG.BLUE : GLB.PLAYER_FLAG.RED
                Game.GameManager.gameState = GameState.Over;
                var msg = {
                    action: GLB.GAME_OVER_EVENT,
                    winFlag: winFlag
                }
                Game.GameManager.sendEventEx(msg);
                clearInterval(this.interval);
                this.interval = null;
            }
        }.bind(this), 1000);
    },

    countDownEvent () {
        var msg = {action: GLB.COUNT_TIME, flag: this.playerFlag, time: this.time};
        Game.GameManager.sendEventEx(msg);
    },

    changeFlag () {
        this.playerFlag === GLB.PLAYER_FLAG.RED ? this.playerFlag = GLB.PLAYER_FLAG.BLUE :this.playerFlag = GLB.PLAYER_FLAG.RED;
        this.getTurn(this.playerFlag);
        if (user.isMyTurn) {
            uiFunc.openUI('uiRoundTip', function (panel) {
                var uiRoundTip = panel.getComponent('uiRoundTip');
                uiRoundTip.setData(GLB.ROUND_TIP.SELF);
            })
        }
        this.countTime();
    },

    getTurn (flag) {
        // var flag = this.playerFlag;
        var preTurn = user.isMyTurn;
        if(GLB.isRoomOwner && flag === GLB.PLAYER_FLAG.RED) {
            user.isMyTurn = true;
        } else if(!GLB.isRoomOwner && flag === GLB.PLAYER_FLAG.BLUE){
            user.isMyTurn = true;
        } else {
            user.isMyTurn = false;
        }
        if (preTurn === user.isMyTurn) return;
        this.showCurTurnLabel();
        this.timeNode.active = true;
    },

    showCurTurnLabel () {
        if (user.isMyTurn) {
            this.timeLeftNode.active = true;
            // this.timeLeftNumNode.active = true;
            this.timeRightNode.active = false;
            // this.timeRightNumNode.active = false;
        } else {
            this.timeLeftNode.active = false;
            // this.timeLeftNumNode.active = false;
            this.timeRightNode.active = true;
           // this.timeRightNumNode.active = true;
        }
    },

    updateTime (param) {
        if (Game.GameManager.gameState !== GameState.Play) return;
        var side = null;
        var time = param.time;
        if (time <= 5) {
            this.playTimeWarnAnim();
        }
        this.getTurn(param.flag);
        user.isMyTurn ? side = 'Left' : side = 'Right';
        // var curNode = this['time' + side + 'NumNode'];
        // var label = curNode.getComponent(cc.Label);
        // label.string = time;
        this.timeNumLabel.string = time;
    },

    onDestroy () {
        clearInterval(this.interval);
        clientEvent.off(clientEvent.eventType.updateTime, this.updateTime.bind(this));
        clientEvent.off(clientEvent.eventType.countTime, this.countTime.bind(this));
        clientEvent.off(clientEvent.eventType.changeFlag, this.changeFlag.bind(this));
        clientEvent.off(clientEvent.eventType.roundStart, this.roundStart.bind(this));
        clientEvent.off(clientEvent.eventType.gameOver, this.gameOver.bind(this));
        clientEvent.off(clientEvent.eventType.stopTimeWarnAnim, this.stopTimeWarnAnim.bind(this));
    }
    // update (dt) {},
});
