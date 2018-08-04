/*
    create by hao.c 2018/04/10

    desc: 游戏显示相关操作逻辑
 */

window.uiFunc = {
    uiList: [],
    cacheUIList: []
};

uiFunc.openUI = function(uiName, callBack) {
    // 缓存--
    for (var i = 0; i < uiFunc.cacheUIList.length; i++) {
        var temp = uiFunc.cacheUIList[i];
        if (temp && temp.name === uiName) {
            temp.active = true;
            temp.parent = cc.Canvas.instance.node;
            uiFunc.uiList.push(temp)
            uiFunc.cacheUIList.splice(i, 1);

            var panel = temp.getComponent("uiPanel");
            if (panel) {
                panel.show();
            }

            // event--
            if (callBack) {
                callBack(temp);
            }
            clientEvent.dispatch(clientEvent.eventType.openUI);
            return;
        }
    }
    // 非缓存--
    cc.loader.loadRes('ui/' + uiName, function(err, prefab) {
        if (err) {
            cc.error(err.message || err);
            return;
        }

        var temp = cc.instantiate(prefab);
        temp.parent = cc.Canvas.instance.node;
        uiFunc.uiList.push(temp)

        var panel = temp.getComponent("uiPanel");
        if (panel) {
            panel.show();
        }

        // event--
        if (callBack) {
            callBack(temp);
        }
        clientEvent.dispatch(clientEvent.eventType.openUI);
    });
};

uiFunc.closeUI = function(uiName, callBack) {
    for (var i = uiFunc.uiList.length - 1; i >= 0; i--) {
        var temp = uiFunc.uiList[i];
        if (temp && temp.name === uiName) {
            temp.active = false;
            temp.removeFromParent(true);
            uiFunc.cacheUIList.push(temp);
            uiFunc.uiList.splice(i, 1);

            var panel = temp.getComponent("uiPanel");
            if (panel) {
                panel.hide();
            }

            clientEvent.dispatch(clientEvent.eventType.closeUI);
            if (callBack) {
                callBack();
            }
            return;
        }
    }
}

uiFunc.findUI = function(uiName) {
    for (var i = uiFunc.uiList.length - 1; i >= 0; i--) {
        var temp = uiFunc.uiList[i];
        if (temp && temp.name === uiName) {
            return temp;
        }
    }
}
