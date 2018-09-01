cc.Class({
    extends: cc.Component,

    properties: {
        playerSprite: {
            default: null,
            type: cc.Sprite
        }
    },
    setData: function(userInfo) {
        this.userInfo = userInfo;
        this.playerId = userInfo.id ? userInfo.id : userInfo.userId;
        this.playerSprite.node.active = true;
        clientEvent.on(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
        Game.GameManager.userInfoReq(this.playerId);
    },

    userInfoSet: function(recvMsg) {
        if (recvMsg.account == this.playerId) {
            if (recvMsg.headIcon && recvMsg.headIcon !== "-") {
                cc.loader.load({url: recvMsg.headIcon, type: 'png'}, function(err, texture) {
                    var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                    if(this.playerSprite) {
                        this.playerSprite.spriteFrame = spriteFrame;
                    }
                }.bind(this));
            }
        }
    },

    onDestroy() {
        clientEvent.off(clientEvent.eventType.playerAccountGet, this.userInfoSet, this);
    }
});
