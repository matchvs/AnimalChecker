window.network = {
    initNetwork: function() {
        this.pomeloBuildObj = pomeloBuild.create();
        this.pomelo = this.pomeloBuildObj.pomelo;

        this.isBinding = false;

        if (!this.isBinding) { // 主要为了让onMessage绑定this
            this.onMessage = this.onMessage.bind(this);
            this.isBinding = true;
        }

        // 只能被network用，其他人不能用
        this.netListener = eventListener.create("one");
        this.reset();
        this._registerNetEvent();
    },

    reset: function() {
        this.curMsgName = "";

        // 路由管理器（暂名）重置，重置后立马刷新一次netLoading的显示
        this.routerManager = {};
    },
    /**
     内部使用的注册网络回调函数
     */
    _registerNetEvent: function() {
        this.pomelo["on"]("heartbeat timeout", function() {
            this.pomelo["disconnect"]();

            this.netListener.dispatch("reconnect timeout", {});
        }.bind(this));

        this.pomelo["on"]("heartbeat recv", function() {
            clientEvent.dispatch("updateNetworkState", "heartBeatRet");
        }.bind(this));

        this.pomelo["on"]("close", function() {
            this.pomelo["disconnect"]();

            this.netListener.dispatch("network close", {});
        }.bind(this));

        this.pomelo["on"]("onKick", function() {
            this.netListener.dispatch("kick user", {});

            // 关闭网络loading动画
            this.receiveRouterFromServer('close all netLoading');
        }.bind(this));
    },

    // 网络协议都是在logic注册的，不能注销
    on: function(route) {
        this.netListener.on.apply(this.netListener, arguments);
        pomelo["on"](route, this.onMessage);
    },

    getCurMsgName: function() {
        return this.curMsgName;
    },

    connect: function(ip, port, cb) {
        var netConfig = {
            host: ip,
            port: port,
            log: true
        };

        this.isKicked = false;
        netConfig.wsStr = "wss://";

        // 解决微信上点击会崩溃的bug,网络连接不能在放在ui层,所以用timeout包装一层
        setTimeout(function() {
            this.pomelo["init"](netConfig, function() {
                if (cb) cb();
            }.bind(this));
        }.bind(this), 0);
    },

    disconnect: function() {
        if (this.isConnected()) {
            this.pomelo["disconnect"]();
        }
    },
    /**
     *  globally-unique identifiers, 生成一个不重复的随机字符串，用于跟踪请求链
     */
    guid: function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    },

    send: function(routeStr, dataObj) {
        if (typeof (dataObj) === "undefined") {
            dataObj = {};
        }

        // 请求参数中加入唯一标识,用于跟踪请求链。
        dataObj.uuid = this.guid();
        console.log("send route:" + routeStr + " data:" + JSON.stringify(dataObj));

        // 记录路由请求
        this.addRouterToManager(routeStr);

        if (this.isConnected()) {
            this.pomelo["request"](routeStr, dataObj, this.onMessage);
        }
    },

    onMessage: function(msgOrigin) {
        var router = msgOrigin["route"];

        this.receiveRouterFromServer(router);

        console.log("receive msg from :" + JSON.stringify(msgOrigin));

        if (msgOrigin["body"]["code"] === 500) {
            cc.error("server data error, can't find the route:" + router);
            // pomelo异常处理都返回500，仍然需要做分发处理
            // return;
        }

        if (!router) {
            cc.error("please add the msg route in server");
            return;
        }

        // 空数据
        if (Object.keys(msgOrigin["body"]).length <= 0) {
            cc.error("server data error, can't response no data proto");
            return;
        }

        this.curMsgName = msgOrigin["route"];

        this.netListener.dispatch(msgOrigin["route"], msgOrigin["body"]);
    },

    setNetLoadingStatus: function(flag) {
        if (flag) {
            // clientEvent.dispatch("showPanel", "netLoadingPanel");
        } else {
            clientEvent.dispatch('hidePanel', "netLoadingPanel");
        }
    },

    /**
     * 检测 netLoading 的显示状态
     * 从 routeManager 中获取每个记录的路由的请求时间，与当前时间对比
     * 如果超出阈值就显示 netLoading
     * 注：已返回的路由就会从 routerManager 中删掉
     */
    checkNetLoadingStatus: function() {
        var keys = Object.keys(this.routerManager);
        var keysLength = keys.length;
        if (keysLength <= 0) {
            this.netListener.dispatch('hidePanel', "netLoadingPanel");
            return;
        }

        var currentTime = Date.now();
        for (var key in this.routerManager) {
            if (this.routerManager.hasOwnProperty(key)) {
                var routerTime = this.routerManager[key];
                var deltaTime = currentTime - routerTime;
                if (deltaTime > this.netLoadingCheckInterval) {
                    // 存在路由的请求时间超出了阈值，显示 netLoading
                    // 有路由显示的话，就不再检查其他的路由
                    return;
                }
            }
        }
    },

    /**
     * 将路由添加到路由管理器（暂名）
     * @param {String} router 路由名
     * 将 { 路由名 => 时间 } 作为键值对存起来，如果是已经存在的路由，则跳过
     */
    addRouterToManager: function(router) {
        var keys = Object.keys(this.routerManager);

        // 断线重连期间，拒绝其他的路由加入
        if (keys.indexOf('connectTimeout') === -1) {
            // 断线重连时，清空路由
            if (router === 'connectTimeout') {
                this.routerManager = {};
            }

            keys = Object.keys(this.routerManager);
            var index = keys.indexOf(router);
            if (index === -1) {
                var currentTime = Date.now();
                this.routerManager[router] = currentTime;
            }
        }
    },

    /**
     * 收到网络返回，将路由管理器（暂名）中对应的路由删掉
     * @param {String} router 路由名
     */
    receiveRouterFromServer: function(router) {
        if (router === 'close all netLoading') {
            this.routerManager = {};
            this.checkNetLoadingStatus();
            return;
        }
        var keys = Object.keys(this.routerManager);
        var index = keys.indexOf(router);
        if (index > -1) {
            console.log(router, "cost", Date.now() - this.routerManager[router], "ms");
            delete this.routerManager[router];

            // 删除之后要刷新一次 netLoading 的显示
            this.checkNetLoadingStatus();
        }
    },
    /**
     * 请客网络回调
     */
    clearCallback: function() {
        if (this.pomelo) this.pomelo.clearCallback();
    }
};

network.isConnecting = function() {
    return this.pomelo.isConnecting();
};

network.isConnected = function() {
    return this.pomelo.isOpen();
};

network.isClosed = function() {
    return this.pomelo.isClosed();
};

network.isClosing = function() {
    return this.pomelo.isClosing();
};

network.chooseNetworkMode = function() {
    this.initNetwork();
    if (this.pomelo) {
        for (var key in this.netListener) {
            this.pomelo["on"](key, this.onMessage);
        }
    }
};

network.on = function(msgName, handler) {
    this.netListener.on(msgName, handler);
};

network.dispatch = function(msgName, msgContent) {
    this.netListener.dispatch(msgName, msgContent);
};
