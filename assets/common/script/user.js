var GLB = require("Glb");
window.user = {

}

user.init = function () {
    user.stepNoEat = 0;
    user.allOpenNum = 0;
    user.allEatNum = 0;
    user.isMyTurn = null;
};

// 1：吃，2：翻，3：空
user.stepIfEatOrOpen = function(isEatOrOpen, isSelf) {
    if (isEatOrOpen === 1) {
        this.stepNoEat = 0;
        this.allEatNum++;
        return;
    } else if (isEatOrOpen === 2){
        this.stepNoEat = 0;
        this.allOpenNum++;
        return;
    } else if (isEatOrOpen === 3){
        this.stepNoEat++;
    }

    if (this.stepNoEat >= GLB.needStepNoEat) {
        // 判断是否符合条件 棋子全开，小于等于4个子
        if (this.allOpenNum < 16) {// 全开
            this.stepNoEat = 0;
            return;
        }

        if (this.allEatNum < 12) {// 小于等于4个子
            this.stepNoEat = 0;
            return;
        }

        if (isSelf) {
            setTimeout(function() {
                this.setAudio("draw");
                console.log("12步未吃");
                var msg = {
                    action: GLB.GAME_OVER_EVENT,
                    winFlag: null
                }
                Game.GameManager.sendEventEx(msg);
            }.bind(this), 700);
        }
    }
};

user.setAudio = function(name) {
    var url = cc.url.raw("resources/sound/"+name+".mp3");
    cc.audioEngine.play(url, false, 1);
};