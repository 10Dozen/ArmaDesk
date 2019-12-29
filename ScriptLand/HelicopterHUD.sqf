/**
 *	Draws script based HUD for helicopter with some aiming info, speead and altitude idication.
 *	Plus [PULL UP] message on reaching > 15m/s of vertical speed
 *
 *	Helps to get out when stucked :D
 */

// List of classnames compatible with feature
dzn_HUD_compatibleVehicles = ["CUP_B_UH1D_gunship_GER_KSK"];

// --- Functions
dzn_HUD_drawHUD = {
	if !(alive player) exitWith { [] call dzn_HUD_removeDrawEH; };
	
	// Weapon Hud
	private _fov = getObjectFOV  player;
	private _color = [0.25, 0.9, 0.38,1];
	private _mark = [1.5, 1.35, 1.2, 1];
	
	private _name = ["M134","RKT","",""];
	private _nameScale = 0.025;
	private _nameOffset = [0.7, 0, -0.25];
	
	private _flightDataOffset = [3, 10, 1.5];
	
	if (_fov < 0.8) then {
		_mark = _mark apply { _x * 0.85 };
		_nameScale = 0.03;
		_nameOffset = [0.25, 0, -0.06];
		_flightDataOffset = [1.5, 10, 1.2];
	};
	
	for "_i" from 0 to 3 do {
		drawIcon3D [
			"", _color
			, player modelToWorldVisual [-0.025,10,_mark # _i]
			, 0, 0, 0
			, if (_i == 0) then { ".   .   ." } else { "." }
			, 1, 0.05, "PuristaMedium"
		];
		
		if (_name # _i != "") then {
			drawIcon3D [
				"", _color
				, player modelToWorldVisual [_nameOffset # 0 , 10, (_mark # _i) + (_nameOffset # 2)]
				, 0, 0, 0
				, _name # _i
				, 1, _nameScale, "PuristaMedium"
			];
		};
	};
	
	// Flight data HUD
	private _alt = round (getPosATL (vehicle player) # 2);
	private _vel = round speed (vehicle player);
	
	drawIcon3D [
		"", _color
		, player modelToWorldVisual [-1 * (_flightDataOffset # 0), _flightDataOffset # 1, _flightDataOffset # 2]
		, 0, 0, 0
		, format ["SPD: %1 kph", _vel]
		, 1, 0.03, "PuristaMedium"
	];
	drawIcon3D [
		"", _color
		, player modelToWorldVisual _flightDataOffset
		, 0, 0, 0
		, format ["ALT: %1 m", _alt]
		, 1, 0.03, if (_alt > 50) then { "PuristaMedium" } else { "PuristaBold" }
	];
	
	// Pull Up indicator
	if (velocity (vehicle player) # 2 < -15) then {
		drawIcon3D [
			"", _color
			, player modelToWorldVisual [0, 10, -0.5]
			, 0, 0, 0
			, "[ PULL UP ]"
			, 1, 0.05, "PuristaBold"
		];
	};
};
	
dzn_HUD_addDrawEH = {
	[] call dzn_HUD_removeDrawEH;
	private _pfhID = [{call dzn_HUD_drawHUD}] call CBA_fnc_addPerFrameHandler;
	player setVariable ["dzn_HUD_pfh", _pfhID];
};

dzn_HUD_removeDrawEH = {
	private _pfhID = player getVariable ["dzn_HUD_pfh", -1];
	if (_pfhID < 0) exitWith {};
	
	_pfhID call CBA_fnc_removePerFrameHandler;
	player setVariable ["dzn_HUD_pfh", -1];
};

// --- Init
private _getInEH = player getVariable ["dzn_HUD_getInEH",-1];
private _getOutEH = player getVariable ["dzn_HUD_getOutEH",-1];
[] call dzn_HUD_removeDrawEH;

if (_getInEH > -1) then {
	player removeEventHandler ["GetInMan", _getInEH];
	player removeEventHandler ["GetOutMan",_getOutEH];
};

_getInEH = player addEventHandler ["GetInMan", {
	params ["_unit", "_role", "_vehicle", "_turret"];
	
	if (typeOf _vehicle in dzn_HUD_compatibleVehicles && _role == "driver") then {
		[] call dzn_HUD_addDrawEH;
	};
}];
_getOutEH = player addEventHandler ["GetOutMan", {
	params ["_unit", "_role", "_vehicle", "_turret"];
	if (typeOf _vehicle in dzn_HUD_compatibleVehicles) then {
		[] call dzn_HUD_removeDrawEH;
	};
}];
