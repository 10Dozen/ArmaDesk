/*
	FIRED
	EventHandler
*/


dzn_aar_fireEH = player addEventHandler ["Fired", {
	if (!isNil {(_this select 0) getVariable "dzn_aar_fired"}) exitWith { hint "Bullet exists"; };
	(_this select 0) setVariable ["dzn_aar_fired", true];
	
	[ _this select 0, _this select 4, _this select 6] spawn {		
		_unit = _this select 0;
		_ammo = _this select 1;
		_proj = _this select 2;
		
		_timeStart = floor(time);
		_posStart = getPosASL _unit;
	//!(getPos _proj isEqualTo [0,0,0]) ||
		_posEnd = getPosASL _proj;
		
		dzn_checkShot = {
			_shot = _this select 0;
			_timestamp = _this select 1;
			_result = if ( ((getPosASL _shot) isEqualTo [0,0,0]) || (time > _timestamp + 0.6)) then { false } else { true };			
			
			_result
		};
		
		while {[_proj,_timeStart] call dzn_checkShot} do {
			_posEnd = getPosASL _proj;
			player sideChat str[getPosASL _proj];
		};
		
		player sideChat "SHOT END!";
		_shotLine = format[
			"<AAR>2,0,%1,%2,%3,%4,%5,1",
			_ammo,
			_posStart select 0,
			_posStart select 1,
			_posEnd select 0,
			_posEnd select 1
		];		
		
		for "_i" from _timeStart to (_timeStart + 1) do {
			call compile format [
				"if (!isNil {_unit getVariable 'dzn_aar_ts_%1'}) then {
					_unit setVariable ['dzn_aar_ts_%1', [_shotLine], true];
				} else {
					_unit setVariable ['dzn_aar_ts_%1', (_unit getVariable 'dzn_aar_ts_%1') + [_shotLine], true];
				};",
				_i
			];
		};
		(_this select 0) setVariable ["dzn_aar_fired",nil];
	};
}];
