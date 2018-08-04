var GLB = require("Glb");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.isOpen = false;
        this.isMoving = false;
        this.node.on('touchend', this.touchEvent, this);
    },

    touchEvent (event, cb) {
        if (Game.GameManager.gameState !== GameState.Play) return;
        // 别人的回合
        if(!user.isMyTurn) {
            if(!this.isTipSecond) {
                uiFunc.openUI('uiRoundTip', function (panel) {
                    var uiRoundTip = panel.getComponent('uiRoundTip');
                    uiRoundTip.setData(GLB.ROUND_TIP.OTHER);
                })
            }
            this.isTipSecond = true;
            setTimeout(function () {
                this.isTipSecond = false;
            }.bind(this), 2000);
            return;
        }
        if(event) {
            event.stopPropagation();
        }


        if (this.isOpen) {
            //已经翻开
            if(!GLB.isRoomOwner) {
                // 蓝色方
                if (this.type !== GLB.PLAYER_FLAG.BLUE) {
                    clientEvent.dispatch(clientEvent.eventType.eatForChess, this.node);
                    return;
                }
            } else {
                // 红色方
                if (this.type !== GLB.PLAYER_FLAG.RED) {
                    clientEvent.dispatch(clientEvent.eventType.eatForChess, this.node);
                    return;
                }
            }

            if (this.isMoving === true) {
                this.isMoving = false;
            } else {
                this.isMoving = true;
            }
            var param = {
                node: this.node,
                move: this.isMoving,
                callback: cb
            }
            clientEvent.dispatch(clientEvent.eventType.checkMoveDirection, param);
        } else {
            // 未翻开
            this.isOpen = true;
            var msg = {action: GLB.CHANGE_FLAG};
            Game.GameManager.sendEvent(msg);
            clientEvent.dispatch(clientEvent.eventType.changeFlag);
            clientEvent.dispatch(clientEvent.eventType.openChessPiece, this.node.tag);
        }
        // user.isMyTurn = false;
        // TODO 发送翻棋的消息
        var msg = {action: GLB.OPEN_FOR_OTHER, tag: this.node.tag};
        Game.GameManager.sendEvent(msg);
    },

    openChessPiece:function () {
        this.isOpen = true;
    },

    clearMove:function() {
        this.isMoving = false;
    },

    setChessType:function (type,index) {
        this.type = type;
        this.index = index - 1;
    },

    setDestory:function(){
        this.node.active = false;
    },

    setPosition: function(x, y) {
        this.node.setPosition.apply(this.node, arguments);
    },

    getPosition () {
      return this.node.getPosition();
    },

    getIsOpen:function() {
        return this.isOpen;
    },

    getIndex:function() {
        return this.index + 1;
    },

    getTyp :function() {
        return this.type;
    },
    getNode:function(){
        return this.node;
    },

    start () {

    },
    onDestroy () {
        console.log('*****nextStepOndestroy*****')
       // this.node.off('touchend', this.touchEvent, this);
    }

    // update (dt) {},
});
