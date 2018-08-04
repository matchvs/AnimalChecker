var engine;
var response = {};
var MsMatchInfo;
var MsCreateRoomInfo;
try {
    engine = Matchvs.MatchvsEngine.getInstance();
    MsMatchInfo = Matchvs.MsMatchInfo;
    MsCreateRoomInfo = Matchvs.MsCreateRoomInfo;
} catch (e) {
    try {
        var jsMatchvs = require("matchvs.all");
        engine = new jsMatchvs.MatchvsEngine();
        response = new jsMatchvs.MatchvsResponse();
        MsMatchInfo = jsMatchvs.MsMatchInfo;
        MsCreateRoomInfo = jsMatchvs.MsCreateRoomInfo;
    } catch (e) {
        var MatchVSEngine = require('MatchvsEngine');
        engine = new MatchVSEngine();
    }
}
module.exports = {
    engine: engine,
    response: response,
    MatchInfo: MsMatchInfo,
    CreateRoomInfo: MsCreateRoomInfo,
};