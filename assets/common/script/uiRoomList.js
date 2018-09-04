var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
var GLB = require("Glb");
cc.Class({
    extends: uiPanel,

    properties: {},

    start() {
        this.roomPrefab = this.nodeDict["roomPrefab"];
        this.editBox = this.nodeDict["editBox"].getComponent(cc.EditBox);
        this.roomPrefab.active = false;
        this.nodeDict["search"].on("click", this.search, this);
        this.nodeDict["quit"].on("click", this.quit, this);


        this.rooms = [];

        clientEvent.on(clientEvent.eventType.getRoomListResponse, this.getRoomListResponse, this);
        clientEvent.on(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
        clientEvent.on(clientEvent.eventType.getRoomListExResponse, this.getRoomListExResponse, this);

        this.getRoomList();
        this.roomRqId = setInterval(function() {
            if (this.editBox.string === '') {
                this.getRoomList();
            }
        }.bind(this), 5000);
    },

    getRoomList: function() {
        var filter = {
            maxPlayer: 0,
            mode: 0,
            canWatch: 0,
            roomProperty: "",
            full: 2,
            state: 1,
            sort: 1,
            order: 0,
            pageNo: 0,
            pageSize: 20
        }
        mvs.engine.getRoomListEx(filter);
    },

    getRoomListResponse: function(data) {
        for (var j = 0; j < this.rooms.length; j++) {
            this.rooms[j].destroy();
        }
        this.rooms = [];
        data.roomInfos.sort(function(a, b) {
            return a.roomID - b.roomID;
        });
        for (var i = 0; i < data.roomInfos.length; i++) {
            var room = cc.instantiate(this.roomPrefab);
            room.active = true;
            room.parent = this.roomPrefab.parent;
            var roomScript = room.getComponent('roomInfo');
            roomScript.setData(data.roomInfos[i]);

            this.rooms.push(room);
        }
    },

    getRoomListExResponse: function(data) {
        for (var j = 0; j < this.rooms.length; j++) {
            this.rooms[j].destroy();
        }
        this.rooms = [];
        this.roomAttrs = data.rsp.roomAttrs;
        for (var i = 0; i < data.rsp.roomAttrs.length; i++) {
            var room = cc.instantiate(this.roomPrefab);
            room.active = true;
            room.parent = this.roomPrefab.parent;
            var roomScript = room.getComponent('roomInfo');
            roomScript.setData(data.rsp.roomAttrs[i]);

            this.rooms.push(room);
        }
    },

    quit: function() {
        clearInterval(this.roomRqId);
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    search: function() {
        if (this.editBox.string === '') {
            for (var i = 0; i < this.rooms.length; i++) {
                this.rooms[i].active = true;
            }
        } else {
            for (var j = 0; j < this.rooms.length; j++) {
                var roomScript = this.rooms[j].getComponent('roomInfo');
                if (roomScript.roomIdLb.string == this.editBox.string) {
                    this.rooms[j].active = true;
                } else {
                    this.rooms[j].active = false;
                }
            }
        }
    },

    joinRoomResponse: function(data) {
        if (data.status !== 200) {
            console.log('进入房间失败,异步回调错误码: ' + data.status);
        } else {
            console.log('进入房间成功');
            console.log('房间号: ' + data.roomInfo.roomID);
            if (!data.roomUserInfoList.some(function(x) {
                return x.userId === GLB.userInfo.id;
            })) {
                data.roomUserInfoList.push({
                    userId: GLB.userInfo.id,
                    userProfile: ""
                });
            }
            // 设置房间最大人数--
            for (var i = 0; i < this.roomAttrs.length; i++) {
                if (data.roomInfo.roomID === this.roomAttrs[i].roomID) {
                    GLB.MAX_PLAYER_COUNT = this.roomAttrs[i].maxPlayer;
                    break;
                }
            }

            if (cc.Canvas.instance.designResolution.height > cc.Canvas.instance.designResolution.width) {
                uiFunc.openUI("uiRoomVer", function(obj) {
                    var room = obj.getComponent('uiRoom');
                    room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
                    uiFunc.closeUI(this.node.name);
                    this.node.destroy();
                }.bind(this));
            } else {
                uiFunc.openUI("uiRoom", function(obj) {
                    var room = obj.getComponent('uiRoom');
                    room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
                    uiFunc.closeUI(this.node.name);
                    this.node.destroy();
                }.bind(this));
            }
        }
    },

    onDestroy() {
        if (window.wx) {
            wx.offKeyboardComplete();
            wx.offKeyboardInput();
            wx.hideKeyboard();
        }
        clearInterval(this.roomRqId);
        clientEvent.off(clientEvent.eventType.getRoomListResponse, this.getRoomListResponse, this);
        clientEvent.off(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
        clientEvent.off(clientEvent.eventType.getRoomListExResponse, this.getRoomListExResponse, this);
    }
});
