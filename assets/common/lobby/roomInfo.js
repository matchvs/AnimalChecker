var mvs = require("Matchvs");
cc.Class({
    extends: cc.Component,

    properties: {
        roomIdLb: {
            default: null,
            type: cc.Label
        },
        roomNameLb: {
            default: null,
            type: cc.Label
        },
    },

    start() {
        this.node.on("click", this.joinRoom, this);
    },

    setData: function(msRoomAttribute) {
        this.msRoomAttribute = msRoomAttribute;
        this.roomIdLb.string = msRoomAttribute.roomID;
        this.roomNameLb.string = msRoomAttribute.roomName;
    },

    joinRoom: function() {
        mvs.engine.joinRoom(this.msRoomAttribute.roomID, "joinRoomSpecial");
    }
});
