var uiPanel = require("uiPanel");

cc.Class({

    extends: uiPanel,
    properties: {
        rankPrefab: {
            default: null,
            type: cc.Node
        },
        rank1Node: {
            default: null,
            type: cc.Node
        },
        rank2Node: {
            default: null,
            type: cc.Node
        },
        rank3Node: {
            default: null,
            type: cc.Node
        }
    },

    onLoad: function() {
        this._super();
        this.rankPrefab.active = false;
        this.rank1Node.active = false;
        this.rank2Node.active = false;
        this.rank3Node.active = false;
        this.rank1Info = this.rank1Node.getComponent("rankUserInfo");
        this.rank2Info = this.rank2Node.getComponent("rankUserInfo");
        this.rank3Info = this.rank3Node.getComponent("rankUserInfo");
        this.nodeDict["exit"].on("click", this.quit, this);
    },

    quit: function() {
        uiFunc.closeUI(this.node.name);
        this.node.destroy();
    },

    setData: function(rankdata) {
        console.log("setData");
        for (var i = 0; i < rankdata.length; i++) {
            if (i === 0) {
                this.rank1Node.active = true;
                this.rank1Info.setData(rankdata[i]);
            } else if (i === 1) {
                this.rank2Node.active = true;
                this.rank2Info.setData(rankdata[i]);
            } else if (i === 2) {
                this.rank3Node.active = true;
                this.rank3Info.setData(rankdata[i]);
            } else {
                var temp = cc.instantiate(this.rankPrefab);
                temp.active = true;
                temp.parent = this.rankPrefab.parent;
                var rankInfo = temp.getComponent("rankUserInfo");
                rankInfo.setData(rankdata[i]);
            }
        }
    }
});
