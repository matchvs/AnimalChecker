

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {},

    start () {

    },
    init (pool) {
        this.animation = this.node.getComponent(cc.Animation);
        this.animation.on('finished', this.finished, this);
        this.pool = pool;
        this.animation.play();
    },
    finished () {
        this.pool.put(this.node);
    }
    // update (dt) {},
});
