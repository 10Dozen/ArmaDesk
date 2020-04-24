_doHandle = [] call {
    private _v = vehicle player;
    private _allTurrets = allTurrets [_v,true];
    
    private _tid = _allTurrets findIf {(_v turretUnit _x) isEqualTo player};
    
    if (_tid < 0) exitWith { 
        hint "C0: Not in turret. Don't handle NVG"; 
        false
    };
    
    private _doHandleNVG = false;
    private _turretOptics = toLower (getText ([typeof _v, _allTurrets # _tid] call BIS_fnc_turretConfig >> "gunnerOpticsModel"));
    
    if (_turretOptics in ["","\a3\weapons_f\reticle\optics_empty"]) then {
        hint "C1: Not in turret with scope. Handle NVG";
        _doHandleNVG = true;
    } else {
        if (isTurnedOut player) then {
            hint "C2: Turned out from turret. Handle NVG";
            _doHandleNVG = true;
        } else {
            hint "C3: In turret with scope. Don't handle NVG";
            _doHandleNVG = false;
        };
    };
    
    _doHandleNVG
};
