window.Game = {
    GameManager: null,
    BulletManager: null,
    DuckManger: null,
    PlayerManager: null,

    fireInterval: 1500,
    itemInterval: 8000,
    GameSeconds: 60
}

window.GameState = cc.Enum({
    None: 0,
    Pause: 1,
    Play: 2,
    Over: 3,
    End: 4
})

window.Player_State = {
    None: 0,
    Hit: 1,
    BeingHit: 2,
    HitAndBeingHit: 3,
    StandUp: 4,
    Complacent: 5,
    SitDown: 6
}
