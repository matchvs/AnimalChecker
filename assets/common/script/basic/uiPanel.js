var PanelAnimation = cc.Enum({
    None: -1,
    ScaleAndAlpha: -1
});

cc.Class({
    extends: cc.Component,
    properties: {
        showAnimation: {
            default: PanelAnimation.None,
            type: PanelAnimation
        },
        hideAnimation: {
            default: PanelAnimation.None,
            type: PanelAnimation
        },
        isUseMask: false
    },

    onLoad: function() {
        // node load --
        this.nodeDict = {};

        var linkWidget = function(self, nodeDict) {
            var children = self.children;
            for (var i = 0; i < children.length; i++) {
                var widgetName = children[i].name;
                if (widgetName && widgetName.indexOf("key_") >= 0) {
                    var nodeName = widgetName.substring(4);
                    if (nodeDict[nodeName]) {
                        cc.error("控件名字重复!" + children[i].name);
                    }
                    nodeDict[nodeName] = children[i];
                }
                if (children[i].childrenCount > 0) {
                    linkWidget(children[i], nodeDict);
                }
            }
        }.bind(this);
        linkWidget(this.node, this.nodeDict);

        // 添加动画--
        if (!this.showAnimation || !this.hideAnimation) {
            this.anim = this.getComponent(cc.Animation);
            if (!this.anim) {
                this.anim = this.addComponent(cc.Animation);
            }
            this.anim.on('finished', this.showCompleted, this);
        }
    },

    show: function() {
        if (this.showAnimation === PanelAnimation.None) {
            this.node.active = true;
        } else {
            var clipName = PanelAnimation[this.showAnimation];
            this.anim.addClip(dataFunc.uiPanelAnimationClips[clipName]);
            this.anim.play(clipName);
        }
    },

    showCompleted: function() {
        console.log(this.node.name + "动画播放完毕～");
    },

    hide: function() {
        if (this.hideAnimation === PanelAnimation.None) {
            this.node.active = false;
        } else {
            var clipName = PanelAnimation[this.hideAnimation];
            this.anim.addClip(dataFunc.uiPanelAnimationClips[clipName]);
            this.anim.play(clipName);
        }
        // 解除事件绑定--
        clientEvent.clear(this);
    },

    onDestroy: function() {
        if (this.anim) {
            this.anim.off('finished', this.showCompleted, this);
        }
    },
});
