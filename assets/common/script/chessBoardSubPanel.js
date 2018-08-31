var GLB = require("Glb");
var pool = require("pool");

cc.Class({
    extends: cc.Component,

    properties: {
        chess: cc.Prefab,
        nextStep: cc.Prefab
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        pool.createPrefabPool(this.chess);
        pool.createPrefabPool(this.nextStep);
        //
        // this.showChessArr = [];//存棋子
        // this.showStepArr = [];
        // this.chessBoardList = [
        //     [0, 0, 0, 0],
        //     [0, 0, 0, 0],
        //     [0, 0, 0, 0],
        //     [0, 0, 0, 0]
        // ];
        this.init();
        this.fPosList = [];

        this.chessBoradWidth = this.node.width;
        this.chessBoradHeight = this.node.height;
        this.rows = 4;
        this.columns = 4;
        this.longX = this.chessBoradWidth / this.columns;
        this.longY = this.chessBoradHeight / this.rows;


        //初始化格子坐标
        for(var x = 0;x <this.rows; x++){
            var areaLine = [];
            for(var y = 0; y < this.columns; y++){
               // var pos = cc.p(-this.chessBoradWidth/2 + y*this.longX + this.longX/2, this.chessBoradHeight/2 - x*this.longY - this.longY/2);
                var pos = cc.p(-this.chessBoradWidth/2 + y*this.longX + this.longX/2, this.chessBoradHeight/2 - x*this.longY - this.longY/2 + 5);
                areaLine[y] = pos;
            }
            this.fPosList.push(areaLine);
        }

        this.playing = false;

        // TODO 加载声音；
        this.mapParam01 = null;
        this.mapParam02 = null;

        clientEvent.on(clientEvent.eventType.mapInit, this.mapInitEvent, this);
        clientEvent.on(clientEvent.eventType.eatForChess, this.eatForChessEvent, this)
        clientEvent.on(clientEvent.eventType.eatForOther, this.eatForOther, this);
        clientEvent.on(clientEvent.eventType.openForOther, this.openForOther, this);
        clientEvent.on(clientEvent.eventType.openChessPiece, this.openChessPieceEvent, this);
        clientEvent.on(clientEvent.eventType.checkMoveDirection, this.checkMoveDirection, this);
        clientEvent.on(clientEvent.eventType.isGameOver, this.isGameOver, this);
        clientEvent.on(clientEvent.eventType.getMap, this.getMap, this);
        clientEvent.on(clientEvent.eventType.gameOver, this.overClear, this);
        clientEvent.on(clientEvent.eventType.clearChess, this.overClear, this);
        // this.node.on('touchend', this.touchBoardEvent, this);
        //this.getMap();
    },

    init () {
        this.showChessArr = [];//存棋子
        this.showStepArr = [];
        this.chessBoardList = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
    },

    overClear () {
        console.log('******清除棋子数据*****')
        this.mapParam01 = null;
        this.mapParam02  = null;
        this.oldChessNode = null;
        this.chessBoardList = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];
        var childrenNodes = this.node.children;
        for (const val of childrenNodes)  {
            val.destroy();
        }
        this.node.removeAllChildren();

    },

    touchBoardEvent (event) {
        if (Game.GameManager.gameState !== GameState.Play) return;
        var pos = this.node.convertToNodeSpace(event.getLocation());
        var clickPos = {x: pos.y/this.longY,
            y:pos.x/this.longX};
        if (clickPos.y%1 < 0.25 || clickPos.y%1 >0.7 || clickPos.x%1 < 0.25 || clickPos.x%1 >0.7 ) {
            console.log("在界外");
            // if (this.oldChessNode) {
            //     this.oldChessNode.clearDirection(true);
            //     this.oldChessNode.animatPutDown();
            // }
            return;
        }
        var clickPos = {x:3 - parseInt(clickPos.x),y:parseInt(clickPos.y)};
        console.log(clickPos);
        // var moveTag = clickPos.x * 4 + clickPos.y;
        console.log(this.chessMove);
        var moveTag;
        if (this.chessMove === true){
            moveTag = {x:parseInt(this.oldChess.tag / 4),y:parseInt(this.oldChess.tag % 4)};
            if (this.data.left) {
                if (moveTag.y - 1 === clickPos.y && moveTag.x === clickPos.x) {
                    this.setEatfun(this.oldChess.tag,null,-1,clickPos);
                    console.log("成功移动");
                }
            }
            if (this.data.right) {
                if (moveTag.y + 1 === clickPos.y && moveTag.x === clickPos.x) {
                    this.setEatfun(this.oldChess.tag,null,1,clickPos);
                    console.log("成功移动");
                }
            }
            if (this.data.up) {
                if (moveTag.x  - 1 === clickPos.x && moveTag.y === clickPos.y) {
                    this.setEatfun(this.oldChess.tag,null,-4,clickPos);
                    console.log("成功移动");
                }
            }
            if (this.data.down) {
                if (moveTag.x  + 1  === clickPos.x && moveTag.y === clickPos.y) {
                    this.setEatfun(this.oldChess.tag,null,4,clickPos);
                    console.log("成功移动");
                }
            }
        }
    },

    eatForChessEvent (stepNode) {
        if (!this.chessMove) return;
        this.eatForChess(stepNode);
    },

    openChessPieceEvent (stepNode) {
        if (this.oldChessNode) {
            this.oldChessNode.clearDirection();
            this.oldChessNode.animatPutDown();
        }
    },

    mapInitEvent (data) {
        if(data.showChessInfo) {
            this.mapParam01 = data.showChessInfo;
        } else if(data.chessBoardList){
            this.mapParam02 = data.chessBoardList;
        }
        if(this.mapParam01 && this.mapParam02) {
            var param = {
                showChessInfo: this.mapParam01,
                chessBoardList: this.mapParam02
            }
            this.mapInit(param);
        }
    },

    mapInit (data) {
        console.log('*******这里是mapInit*********');
        if(GLB.isRoomOwner) return;
        this.showChessArr = [];
        this.showStepArr = []
        var showChessInfo = data["showChessInfo"];
        this.chessBoardList = data.chessBoardList;
        for(var j = 0;j < showChessInfo.length; j++){
            var chessNode = pool.getPrefab(this.chess.name);
            this.node.addChild(chessNode);
            chessNode.setPosition(showChessInfo[j].pos);
            chessNode.tag = showChessInfo[j].tag;
            var chessScript = chessNode.getComponent(this.chess.name);
            this.showChessArr.push(chessNode);
            chessScript.setChessType(showChessInfo[j].type, showChessInfo[j].index);

            var stepNode = pool.getPrefab(this.nextStep.name);
            var stepScrip = stepNode.getComponent(this.nextStep.name);
            this.node.addChild(stepNode);
            stepScrip.setChessType(showChessInfo[j].type, showChessInfo[j].index);
            stepNode.setPosition(showChessInfo[j].pos);
            stepNode.tag = showChessInfo[j].tag;
            this.showStepArr.push(stepNode);
        }
    },

    getMap () {
        // 主机生成地图数据；
        if(!GLB.isRoomOwner) return;
        // // 先清空棋子数据（主机不会收到）；
        // var chessMsg = {
        //     action: GLB.CLEAR_CHESS,
        // }
        // Game.GameManager.sendEvent(chessMsg)

        this.showChessInfo = [];
        this.showChessArr = [];
        this.showStepArr = [];
        var blueChessPiecesArr = [1,2,3,4,5,6,7,8];
        var redChessPiecesArr = [11,12,13,14,15,16,17,18];

        for(var j = 0;j <this.rows; j++){
            for(var k = 0; k < this.columns; k++){
                var chessNode = pool.getPrefab(this.chess.name);
                this.node.addChild(chessNode);
                chessNode.setPosition(this.fPosList[j][k]);
                chessNode.tag = j*this.columns + k;
                var chessScript = chessNode.getComponent(this.chess.name);
                this.showChessArr.push(chessNode);

                var stepNode = pool.getPrefab(this.nextStep.name);
                var stepNodeScrip =stepNode.getComponent(this.nextStep.name);

                this.node.addChild(stepNode);
                stepNode.setPosition(this.fPosList[j][k]);
                stepNode.tag = j*this.columns + k;
                this.showStepArr.push(stepNode);

                var chessInfo = {pos:this.fPosList[j][k], tag:chessNode.tag};
                var xx = cc.random0To1();
                if(xx >= 0.5)
                {
                    if(blueChessPiecesArr.length == 0)
                    {
                        if(redChessPiecesArr.length == 0)
                        {
                            break;
                        }
                        var index = Math.floor(cc.random0To1()*redChessPiecesArr.length);
                        chessScript.setChessType(GLB.PLAYER_FLAG.RED, redChessPiecesArr[index]);
                        stepNodeScrip.setChessType(GLB.PLAYER_FLAG.RED, redChessPiecesArr[index]);
                        chessInfo.type = GLB.PLAYER_FLAG.RED;
                        chessInfo.index = redChessPiecesArr[index];
                        this.chessBoardList[j][k] = redChessPiecesArr[index];
                        redChessPiecesArr.splice(index, 1);
                    }
                    else
                    {
                        var index = Math.floor(cc.random0To1()*blueChessPiecesArr.length);
                        chessScript.setChessType(GLB.PLAYER_FLAG.BLUE, blueChessPiecesArr[index]);
                        stepNodeScrip.setChessType(GLB.PLAYER_FLAG.BLUE, blueChessPiecesArr[index]);
                        chessInfo.type = GLB.PLAYER_FLAG.BLUE;
                        chessInfo.index = blueChessPiecesArr[index];
                        this.chessBoardList[j][k] = blueChessPiecesArr[index];
                        blueChessPiecesArr.splice(index, 1);
                    }

                }
                else if(xx < 0.5)
                {
                    if(redChessPiecesArr.length == 0)
                    {
                        if(blueChessPiecesArr.length == 0)
                        {
                            break;
                        }
                        var index = Math.floor(cc.random0To1()*blueChessPiecesArr.length);
                        chessScript.setChessType(GLB.PLAYER_FLAG.BLUE, blueChessPiecesArr[index]);
                        stepNodeScrip.setChessType(GLB.PLAYER_FLAG.BLUE, blueChessPiecesArr[index]);
                        chessInfo.type = GLB.PLAYER_FLAG.BLUE;
                        chessInfo.index = blueChessPiecesArr[index];
                        this.chessBoardList[j][k] = blueChessPiecesArr[index];
                        blueChessPiecesArr.splice(index, 1);
                    }
                    else{
                        var index = Math.floor(cc.random0To1()*redChessPiecesArr.length);
                        chessScript.setChessType(GLB.PLAYER_FLAG.RED, redChessPiecesArr[index]);
                        stepNodeScrip.setChessType(GLB.PLAYER_FLAG.RED, redChessPiecesArr[index]);
                        chessInfo.type = GLB.PLAYER_FLAG.RED;
                        chessInfo.index = redChessPiecesArr[index];
                        this.chessBoardList[j][k] = redChessPiecesArr[index];
                        redChessPiecesArr.splice(index, 1);
                    }

                }
                this.showChessInfo.push(chessInfo);
            }
        }
        // TODO 派发事件
        var msg = {
            action: GLB.SEND_MAP_INFO,
            showChessInfo: this.showChessInfo,
            // chessBoardList: this.chessBoardList
            // mapInfo: {
            //     showChessInfo: this.showChessInfo,
            //     chessBoardList: this.chessBoardList
            // }
        };
        Game.GameManager.sendEventEx(msg);
        var msg02 = {
            action: GLB.SEND_MAP_INFO,
            chessBoardList: this.chessBoardList,
        }
        Game.GameManager.sendEventEx(msg02)
    },

    checkMoveDirection (param) {
        var stepNode = param.node ;
        var move = param.move;
        var cb = param.callback;
        if (this.oldChessNode) {
            if (this.oldChessNode.getAnimateStep()) {
                stepNode.getComponent(this.nextStep.name).clearMove();
                return;
            }
        }
        this.chessMove = move;//为true时是拿起棋子
        if (this.oldTag !== stepNode.tag) {
            if (this.oldStepNode) {
                this.oldStepNode.getComponent(this.nextStep.name).clearMove();
               // this.oldStepNode = null;
            }
        }
        if (this.chessMove === false) {
            console.log("放下棋子");
            if (this.oldChessNode) {
                this.oldChessNode.clearDirection();
                this.oldChessNode.animatPutDown();
                this.oldStepNode = null;
            }
            return;
        }

        var data ={left:false,right:false,up:false,down:false};
        this.data = data;
        if (this.oldChessNode) {
            this.oldChessNode.clearDirection(true);
            this.oldChessNode.animatPutDown();
        }


        var tag = stepNode.tag;
        this.oldTag = tag;
        var x = Math.floor(tag/this.columns);
        var y = tag%this.columns;
        if(y - 1 >= 0)
        {
            // this.checkLeft();
            var enemyChess = this.chessBoardList[parseInt((tag - 1)/4)][(tag - 1)%4];
            var ownerChess = this.chessBoardList[parseInt((tag)/4)][(tag)%4];
            data = this.isCanEatChess(enemyChess,ownerChess, data, "left");

        }
        if(y+1 <= this.columns - 1)
        {
            // this.checkRight();
            var enemyChess = this.chessBoardList[parseInt((tag + 1)/4)][(tag + 1)%4];
            var ownerChess = this.chessBoardList[parseInt((tag)/4)][(tag)%4];
            data = this.isCanEatChess(enemyChess,ownerChess, data,"right");
        }
        if(x-1 >= 0)
        {
            // this.checkUp();
            var enemyChess = this.chessBoardList[parseInt((tag - 4)/4)][(tag - 4)%4];
            var ownerChess = this.chessBoardList[parseInt((tag)/4)][(tag)%4];
            data = this.isCanEatChess(enemyChess,ownerChess, data,"up");
        }
        if(x+1 <= this.rows - 1)
        {
            var enemyChess = this.chessBoardList[parseInt((tag + 4)/4)][(tag + 4)%4];
            var ownerChess = this.chessBoardList[parseInt((tag)/4)][(tag)%4];
            data = this.isCanEatChess(enemyChess,ownerChess, data,"down");
        }

        this.currentChessNode = this.getChessNodeByTag(tag);
        this.oldStepNode = this.getStepNodeByTag(tag);
        this.oldChess = this.currentChessNode;
        this.oldChessNode =  this.currentChessNode.getComponent(this.currentChessNode.name);
        this.oldChessNode.setMoveDirection(data,cb);
    },

    //判断子粒大小
    isCanEatChess:function(enemyChess,ownerChess, data, parm) {
        if ((parseInt(enemyChess/10) !== parseInt(ownerChess/10)) || (enemyChess === 0)) {
            if (enemyChess === 0) {
                data[parm] = true;
                data["largeThan" + parm] = true;//
                return data;
            }
            var tag = this.getTagByIndex(enemyChess).tag;
            var stepNode = this.getStepNodeByTag(tag);
            var stepNodeScrip = stepNode.getComponent(this.nextStep.name);
            if (!stepNodeScrip.getIsOpen()) {
                return data;
            }
            data[parm] = true;
            if (enemyChess % 10 > ownerChess % 10) {
                data["largeThan" + parm] = false;//
            } else {
                data["largeThan" + parm] = true;//
            }

            if (enemyChess % 10 === 8 && ownerChess % 10 === 1) {
                data["largeThan" + parm] = true;//
            } else if (ownerChess % 10 === 8 && enemyChess % 10 === 1) {
                data["largeThan" + parm] = false;//
            }

        }
        return data;
    },

    eatForChess:function(isEatChess) {
        if (!this.chessMove) return;
        if (!this.oldChess) {
            return;
        }
        var oldTag = this.oldChess.tag;
        if(this.data.left)
        {
            if (typeof oldTag !== "undefined" && ((isEatChess.tag + 1) === oldTag)) {
                this.setEatfun(oldTag,isEatChess.tag,-1);
            }
        }
        if(this.data.right)
        {

            if (typeof oldTag !== "undefined" && (isEatChess.tag - 1 === oldTag)) {
                this.setEatfun(oldTag,isEatChess.tag,1);
            }
        }
        if(this.data.up)
        {
            if (typeof oldTag !== "undefined" && (isEatChess.tag + 4 === oldTag)) {
                this.setEatfun(oldTag,isEatChess.tag,-4);
            }
        }
        if(this.data.down)
        {
            if (typeof oldTag !== "undefined" && (isEatChess.tag - 4 === oldTag)) {
                this.setEatfun(oldTag,isEatChess.tag,4);
            }
        }
    },

    eatForOther (data) {
        if (data.eatTag !== null) {
            this.eatOther(data.oldTag,data.eatTag,data.tag);
            user.stepIfEatOrOpen(1);
        } else {
            this.moveToKong(data.oldTag,data.tag,data.clickPos);
            user.stepIfEatOrOpen(3);
        }
    },

    openForOther (tag) {
        var stepNode = this.getStepNodeByTag(tag);
        var chessNode = this.getChessNodeByTag(tag);
        var stepNodeScrip = stepNode.getComponent(this.nextStep.name);
        var chessNodeScrip = chessNode.getComponent(this.chess.name);
        if(stepNodeScrip.isOpen) return;
        stepNodeScrip.openChessPiece();
        chessNodeScrip.openChessPiece();
    },

    setEatfun:function(oldTag,eatTag,tag,clickPos){
        if (eatTag !== null) {
            // user.isMyTurn = false;
            var msg = {action: GLB.CHANGE_FLAG};
            Game.GameManager.sendEventEx(msg);
            this.eatOther(oldTag,eatTag,tag);//吃敌方
            user.stepIfEatOrOpen(1);
        } else {
            // user.isMyTurn = false;
            var msg = {action: GLB.CHANGE_FLAG};
            Game.GameManager.sendEventEx(msg);
            this.moveToKong(oldTag,tag,clickPos);//走空地
        }

        this.chessMove = false;

        // 发送被吃的消息
        // user.sendGameData(user.gameDataProto.eatOther, {
        //     oldTag:oldTag,eatTag:eatTag,tag:tag,clickPos:clickPos
        // });
        var msg = {
            action: GLB.EAT_FOR_OTHER,
            eatInfo: {
                oldTag: oldTag,eatTag: eatTag,tag: tag,clickPos: clickPos
            }
        };
        Game.GameManager.sendEvent(msg);

        if (eatTag === null) {
            user.stepIfEatOrOpen(3, true);
        }
    },

    moveToKong:function(oldChess,addTag,clickPos) {
        this.chessBoardList[parseInt(oldChess/4)][parseInt(oldChess%4)] = 0;
        var oldChessNode = this.getChessNodeByTag(oldChess);
        var oldStepNode = this.getStepNodeByTag(oldChess);
        oldChessNode.tag += addTag;
        oldStepNode.tag += addTag;
        var oldChessScrip = oldChessNode.getComponent(this.chess.name);
        var oldStepNodeScrip = oldStepNode.getComponent(this.nextStep.name);
        var y = clickPos.y;
        var x = clickPos.x;
        var pos = cc.p(-this.chessBoradWidth/2 + y*this.longX + this.longX/2, this.chessBoradHeight/2 - x*this.longY - this.longY/2);
        // oldChessScrip.getNode().setPosition(pos);
        oldChessScrip.getNode().runAction(cc.sequence(cc.moveTo(0.2,pos),cc.callFunc(function() {
            // TODO 播放音乐
            user.setAudio("pieceClick");
            this.clearOldChessNode(function(){
                oldStepNodeScrip.getNode().setPosition(pos);
                this.chessBoardList[clickPos.x][clickPos.y] = oldChessScrip.index + 1;
                this.isGameOver();
            }.bind(this));
        }.bind(this))));
        // oldChessScrip.getNode().runAction(cc.moveTo(0.2,pos));
    },

    eatOther:function(oldTag, eatTag,tag) {
        var isEatChess = this.getChessNodeByTag(eatTag).getComponent(this.chess.name);
        var isEatStepChess = this.getStepNodeByTag(eatTag).getComponent(this.nextStep.name);
        var ownerChess = this.getChessNodeByTag(oldTag).getComponent(this.chess.name);
        var ownerStepChess = this.getStepNodeByTag(oldTag).getComponent(this.nextStep.name);
        if (isEatChess.index % 10 > ownerChess.index % 10) {
            console.log("被吃掉");
            if ((isEatChess.index % 10 + 1) === 8 && (ownerChess.index % 10 + 1) === 1) {
                this.eatChangePosition(ownerChess, ownerStepChess, isEatChess, isEatStepChess, 1, tag);
            } else {
                this.eatChangePosition(ownerChess, ownerStepChess, isEatChess, isEatStepChess, -1, tag);
            }

        } else if (isEatChess.index % 10 + 1 === ownerChess.index % 10 + 1) {
            this.eatChangePosition(ownerChess, ownerStepChess, isEatChess, isEatStepChess, 0, tag);
            console.log("换掉");
            user.stepIfEatOrOpen(1);
        } else {
            if (isEatChess.index % 10 + 1 === 1 && ownerChess.index % 10 + 1 === 8) {
                this.eatChangePosition(ownerChess, ownerStepChess, isEatChess, isEatStepChess, -1, tag);
            } else {
                this.eatChangePosition(ownerChess, ownerStepChess, isEatChess, isEatStepChess, 1, tag);
            }

            console.log("吃掉对方");
        }

    },

    eatChangePosition:function(ownerChess,ownerStepChess,isEatChess,isEatStepChess, parm,tag) {
        var pos = isEatChess.getPosition();
        var pos2 = isEatStepChess.getPosition();
        var ownerNode = ownerChess.getNode();
        if (parm > 0) {
            ownerNode.runAction(cc.sequence(cc.moveTo(0.2,pos),cc.callFunc(function() {
                // TODO 播放音乐
                user.setAudio("eat");
                this.clearOldChessNode(function(){
                    ownerNode.tag += tag;
                    var ownerStepNode = ownerStepChess.getNode();
                    ownerStepNode.tag += tag;
                    ownerNode.runAction(cc.moveTo(0.2,pos));
                    // ownerChess.setPosition(pos);
                    ownerStepChess.setPosition(pos2);
                    var index2 = isEatChess.getIndex();
                    var index = ownerChess.getIndex();
                    this.shiftForBoardList(index);
                    this.shiftForBoardList(index2,index);
                    isEatChess.setDestory();
                    isEatStepChess.setDestory();
                    this.chessSetDestory(null,null,isEatChess,isEatStepChess);
                    this.isGameOver();
                }.bind(this));
            }.bind(this))));
        } else if (parm === 0) {
            ownerNode.setLocalZOrder(100);
            ownerNode.runAction(cc.sequence(cc.moveTo(0.2,pos),cc.callFunc(function() {
                // TODO 播放音乐
                user.setAudio("allDie");
                this.clearOldChessNode(function(){
                    var index = isEatChess.getIndex();
                    this.shiftForBoardList(index);
                    index = ownerChess.getIndex();
                    this.shiftForBoardList(index);
                    isEatChess.setDestory();
                    isEatStepChess.setDestory();
                    ownerChess.setDestory();
                    ownerStepChess.setDestory();
                    this.chessSetDestory(ownerChess,ownerStepChess,isEatChess,isEatStepChess);
                    this.isGameOver();
                }.bind(this),1);
            }.bind(this))));
        } else {
            ownerNode.setLocalZOrder(100);
            ownerNode.runAction(cc.sequence(cc.moveTo(0.2,pos),cc.callFunc(function(){
                // TODO 播放音乐
                user.setAudio("eat");
                this.clearOldChessNode(function(){
                    var index = ownerChess.getIndex();
                    this.shiftForBoardList(index);
                    ownerChess.setDestory();
                    ownerStepChess.setDestory();
                    this.chessSetDestory(ownerChess,ownerStepChess,null,null);
                    this.isGameOver();
                }.bind(this), 1);
            }.bind(this))));

        }

    },

    isGameOver:function(){
        var x,y;
        var arrX = [], arrY = [];
        var i;
        for (i = 0; i < this.chessBoardList.length; i++) {
            for (var j = 0; j < this.chessBoardList[i].length; j++) {
                if (this.chessBoardList[i][j] <=0) {
                    continue;
                }

                // 判断是否有未开的棋子
                var isOpen = this.getStepByIndex(this.chessBoardList[i][j]).getComponent("nextStep").getIsOpen();
                if (!isOpen) {
                    return;
                }

                // 判断是否只有一方的棋子
                if (this.chessBoardList[i][j] >= 10) {      // 红色
                    x = true;
                    arrX.push(this.chessBoardList[i][j]);
                } else if (this.chessBoardList[i][j] > 0){      // 蓝色
                    y = true;
                    arrY.push(this.chessBoardList[i][j]);
                }
            }
        }

        // 判断是否只剩下两个开着的子
        if (arrX.length === 1 && arrY.length === 1) {
            if (arrX[0] - 10 > arrY[0]) {
                y = false;
            } else if (arrX[0] - 10 < arrY[0]) {
                x = false;
            } else {
                x = false;
                y = false;
            }
        }

        if (!x || !y) {
            // TODO 判断输赢
            console.log('游戏结束')
            var winFlag = null;
            var userIsWin = false;
            // user.gameOver = true;
            // Game.GameManager.gameState = GameState.Over;
            if (!x && !y) {
                console.log("和局");
                // clientEvent.dispatchEvent("resultDown","2");
            } else {
                if (!GLB.isRoomOwner && !y) {  // 红方赢了
                    console.log("你输了");
                    winFlag = GLB.PLAYER_FLAG.RED;
                //    clientEvent.dispatchEvent("resultDown","3");
                } else if (GLB.isRoomOwner && !x) {  // 蓝色方赢了
                    console.log("你输了");
                    winFlag = GLB.PLAYER_FLAG.BLUE;
                //    clientEvent.dispatchEvent("resultDown","3");
                } else {
                    console.log("你赢了");
                    var userIsWin = true;
                //    clientEvent.dispatchEvent("resultDown","1");
                }
            }
            if (userIsWin) {
                if (GLB.isRoomOwner) {
                    winFlag = GLB.PLAYER_FLAG.RED;
                } else {
                    winFlag = GLB.PLAYER_FLAG.BLUE;
                }
            }
            var msg = {
                action: GLB.GAME_OVER_EVENT,
                winFlag: winFlag
            }
            Game.GameManager.sendEventEx(msg);
            clientEvent.dispatch(clientEvent.eventType.stopTimeWarnAnim);
        }
    },

    chessSetDestory:function(ownerChess,ownerStepChess,isEatChess,isEatStepChess) {
        if (ownerChess !== null && ownerStepChess !== null) {
            var ownerNode = ownerChess.getNode();
            ownerNode.tag = 100;
            var ownerStepNode = ownerStepChess.getNode();
            ownerStepNode.tag = 100;
        }
        if (isEatChess !== null && isEatStepChess !== null) {
            var isEatNode = isEatChess.getNode();
            isEatNode.tag = 100;
            var isEatStepNode = isEatStepChess.getNode();
            isEatStepNode.tag = 100;
        }
    },

    shiftForBoardList:function(index,index2) {
        for (var i = 0; i < this.chessBoardList.length;i++) {
            for (var j = 0; j < this.chessBoardList[i].length;j++) {
                if (this.chessBoardList[i][j] === index) {
                    if (index === 0) {
                        console.log("this.chessBoardList[i][j]出错");
                    }
                    if (index2) {
                        this.chessBoardList[i][j] = index2;
                    } else {
                        this.chessBoardList[i][j] = 0;
                    }

                }
            }

        }
    },

    clearOldChessNode:function(cb,parm) {
        if (this.oldStepNode) {
            this.oldStepNode.getComponent(this.nextStep.name).clearMove();
            this.oldStepNode = null;
        }
        if (this.oldChessNode) {
            this.oldChessNode.clearDirection();
            this.oldChessNode.animatPutDown(cb,parm);
        } else {
            if (cb){
                cb();
            }
        }
    },

    getChessNodeByTag:function (tag) {
        for(var i = 0; i < this.showChessArr.length; i++)
        {
            if(this.showChessArr[i].tag === tag)
            {
                return this.showChessArr[i];
            }
        }
    },

    getStepNodeByTag:function (tag) {
        for(var i = 0; i < this.showStepArr.length; i++)
        {
            if(this.showStepArr[i].tag === tag)
            {
                return this.showStepArr[i];
            }
        }
    },

    getStepByIndex:function (index) {
        for(var i = 0; i < this.showStepArr.length; i++)
        {
            var scrip = this.showStepArr[i].getComponent(this.nextStep.name);
            if(scrip.getIndex() === index)
            {
                return this.showStepArr[i];
            }
        }
    },

    getTagByIndex:function (index) {
        for(var i = 0; i < this.showChessArr.length; i++)
        {
            var scrip = this.showChessArr[i].getComponent(this.chess.name);
            if(scrip.getIndex() === index)
            {
                return this.showChessArr[i];
            }
        }
    },

    onDestroy () {
        console.log('******chessBoardPanelOndestroy******');
        clientEvent.off(clientEvent.eventType.mapInit, this.mapInitEvent, this);
        clientEvent.off(clientEvent.eventType.eatForChess, this.eatForChessEvent, this)
        clientEvent.off(clientEvent.eventType.eatForOther, this.eatForOther, this);
        clientEvent.off(clientEvent.eventType.openForOther, this.openForOther, this);
        clientEvent.off(clientEvent.eventType.openChessPiece, this.openChessPieceEvent, this);
        clientEvent.off(clientEvent.eventType.checkMoveDirection, this.checkMoveDirection, this);
        clientEvent.off(clientEvent.eventType.isGameOver, this.isGameOver, this);
        clientEvent.off(clientEvent.eventType.getMap, this.getMap, this);
        clientEvent.off(clientEvent.eventType.gameOver, this.overClear, this);
        clientEvent.off(clientEvent.eventType.clearChess, this.overClear, this);
        // this.node.off('touchend', this.touchBoardEvent, this);
    }
    // start () {
    //
    // },

    // update (dt) {},
});
