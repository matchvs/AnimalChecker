cc.Class({
    extends: cc.Component,

    properties: {
        ID: {
            default: 0
        }
    },

    onLoad() {
        this.gameManager = cc.find('Canvas').getComponent('gameManager');
        this.animation = this.node.getComponent(cc.Animation);
        this.animation.on('finished', this._finished, this);
        this.hitAnimName = 'beat1'
        this.beHitedAnimName = 'beingBeaten';
        this.standUpAnimName = 'bescold';
        this.complacentAnimName = 'dese';
        this.sitDownAnimName = 'lunges';
        this.playerState = Player_State.None;
        clientEvent.on(clientEvent.eventType.hitEvent, this.hitEvent, this);
        clientEvent.on(clientEvent.eventType.standUpEventMed, this.standUpEvent, this);
        clientEvent.on(clientEvent.eventType.complacentEvent, this.complacentEvent, this);
        clientEvent.on(clientEvent.eventType.sitDown, this.sitDown, this);
    },
    complacentEvent(param) {
        if (param.ID === this.ID) {
            this.complacent();
        }
    },
    standUpEvent(param) {
        if (param.ID === this.ID) {
            this.standUp();
        }
    },
    sitDown() {
        this.playerState = Player_State.SitDown;
        this.animation.play(this.sitDownAnimName);
    },
    hitEvent(param) {
        if (param.ID === this.ID) {
            this.hit();

        } else {
            this.beingHit();
        }
    },
    hit() {
        this.node.setSiblingIndex(999);
        this.playerState = Player_State.Hit;
        this.animation.play(this.hitAnimName);
    },
    beingHit() {
        this.node.setSiblingIndex(0);
        this.playerState = Player_State.BeingHit;
        this.animation.play(this.beHitedAnimName);
    },
    standUp() {
        this.playerState = Player_State.StandUp;
        this.animation.play(this.standUpAnimName);
    },
    complacent() {
        this.playerState = Player_State.Complacent;
        this.animation.play(this.complacentAnimName);
    },
    _finished(event) {
        this.playerState = Player_State.none;
    },
    onDestroy() {
        this.animation.off('finished', this._finished, this);

        clientEvent.off(clientEvent.eventType.hitEvent, this.hitEvent, this);
        clientEvent.off(clientEvent.eventType.standUpEventMed, this.standUpEvent, this);
        clientEvent.off(clientEvent.eventType.complacentEvent, this.complacentEvent, this);
        clientEvent.off(clientEvent.eventType.sitDown, this.sitDown, this);
    }

});
