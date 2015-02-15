// player sideChat "INIT!";
call compile preprocessFileLineNumbers "dzn_gearSetup.sqf";


waitUntil { time > 0 };
removeAllWeapons player;
[] spawn {
	_logics = entities "Logic";
	// player sideChat format ["Logics: %1 ", str(_logics)];
	if (count _logics == 0) exitWith {};	
	{	
		// player sideChat format ["Name match: %1", str(["dzn_gear_", str(_x), false] call BIS_fnc_inString)];
		if (["dzn_gear_", str(_x), false] call BIS_fnc_inString) then {
			_kitName = str(_x) select [9];
			
			// player sideChat format ["Kitname: %1", str(_kitName)];
			
			_synUnits = synchronizedObjects _x;
			// player sideChat format ["SU: %1", str[_synUnits]];
			
			{
				// player sideChat format ["Is Infantry: %1", str(_x  isKindOf "CAManBase")];
				if (_x  isKindOf "CAManBase") then {
					[ _x, _kitName ] spawn dzn_gearSetup;
					sleep 0.2;
				};
			} forEach _synUnits;
			deleteVehicle _x;
		};
	} forEach _logics;
};
