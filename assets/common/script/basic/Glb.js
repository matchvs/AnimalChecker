var obj = {
    RANDOM_MATCH: 1,  // 随机匹配
    PROPERTY_MATCH: 2,  // 属性匹配
    MAX_PLAYER_COUNT: 2,
    PLAYER_COUNTS: [2],
    COOPERATION: 1,
    COMPETITION: 2,
    GAME_START_EVENT: "gameStart",
    GAME_TIME: "gameTime",
    GAME_OVER_EVENT: "gameOver",
    ROUND_START: "roundStart",
    READY: "ready",
    channel: 'MatchVS',
    platform: 'alpha',
    IP: "wxrank.matchvs.com",
    PORT: "3010",

    PLAYER_FLAG: {
      RED: 1,
      BLUE: 2
    },

    ROUND_TIP: {
      OTHER: 2,
      SELF: 1,
    },

    gameId: 201554,
    gameVersion: 1,
    // GAME_NAME: 'game8',
    appKey: 'd4e29d00bd3a48e2acf4f6e7a5ffe270',
    secret: 'f0f7bd601d9f43db840091ac08a17002',

    gameType: 2,
    matchType: 1,
    tagsInfo: { "title": "A" },
    userInfo: null,
    playerUserIds: [],
    playerSet: new Set(),
    isRoomOwner: false,
    events: {},

    syncFrame: false,
    FRAME_RATE: 20,
    roomId: 0,
    playertime: 180,
    isGameOver: false,

    COUNT_TIME: "countTime",
    UPDATE_TIME: "updateTime",
    SEND_MAP_INFO: "sendMapInfo",
    SHOW_CHESS_INFO: "showChessInfo",
    CHESS_BOARD_LIST: "chessBoardList",
    CHANGE_FLAG: "changeFlag",
    OPEN_FOR_OTHER: "openForOther",
    EAT_FOR_OTHER: "eatForOther",
    CLEAR_CHESS: "clearChess",

    // 连着6回合 12步都没有进行吃的操作
    needStepNoEat: 12
};
module.exports = obj;