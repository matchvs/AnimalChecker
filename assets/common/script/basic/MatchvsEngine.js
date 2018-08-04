function MatchvsEngine() {
    console.log('MatchvsEngine init');
}

MatchvsEngine.prototype.init = function(matchVSResponses, channel, platform, gameid){
    this.responses = matchVSResponses;
    return 0;
};

MatchvsEngine.prototype.registerUser = function() {
    this._forEachResponse(function(res) {
        setTimeout(function(){
            var userInfo = {
                userID: 10086,
                token: 'jkfldjalfkdjaljfs',
                name: '张三',
                avatar: 'http://d3819ii77zvwic.cloudfront.net/wp-content/uploads/2015/02/child-fist-pump.jpg'
            };
            res.registerUserResponse && res.registerUserResponse(userInfo);
        }, 100);
    });
    return 0;
};

MatchvsEngine.prototype.login = function(userID,token,gameid,gameVersion,appkey, secret,deviceID,gatewayid){
    return 0;
};

MatchvsEngine.prototype.joinRandomRoom = function(){
    this._forEachResponse(function(res) {
        setTimeout(function(){
            var roomInfo = {
                status: 0,
                userInfoList: [
                    {userID: 10086,userProfile: '张三'},
                    {userID: 10087,userProfile: '李四'},
                    {userID: 10088,userProfile: '王五'},
                ],
                roomInfo: {
                    rootID: 1028374,
                    rootProperty: "好房间",
                    owner: 10086,
                }
            };
            res && res.roomJoinResponse(roomInfo);
        }, 100);
    });
    return 0;
};

MatchvsEngine.prototype._forEachResponse = function(func) {
    if (this.responses) {
        for(var i = 0; i<this.responses.length; i++) {
            this.responses[i] && func(this.responses[i]);
        }
    }
};

MatchvsEngine.prototype.joinOver = function(){
    return 0;
};

MatchvsEngine.prototype.sendEvent = function(event){
    var mockEventId = new Date().getTime();
    this._forEachResponse(function(res){
        setTimeout(function(){
            res.sendEventRsp && res.sendEventRsp({"status": 0, "seq": mockEventId});
        }, 100);
    });
    return {status: 0, seq: mockEventId};
};

module.exports = MatchvsEngine;