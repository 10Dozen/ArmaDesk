// Should be ran on DAC-host side (Server or HC) only

// User-defined script for spawned units: reference to unit = _this
dzn_dac_customScriptWEST = { player sideChat format ["Script for WEST unit %1", str(_this)]};
dzn_dac_customScriptEAST = { player sideChat format ["Script for EAST unit %1", str(_this)]};
dzn_dac_customScriptINDEP = { player sideChat format ["Script for INDEP unit %1", str(_this)]};
dzn_dac_customScriptCIV = { player sideChat format ["Script for CIVILIAN unit %1", str(_this)]};

dzn_dac_overlayTimerStep = 10; // seconds
dzn_dac_overlayTimer = 0 + dzn_dac_overlayTimerStep; 

// Return all alive infantries
dzn_dac_getAliveInfantries = {
	private ["_units","_vehicles"];
	_units = entities "CAManBase";
	_vehicles = vehicles;
	{
		if (alive _x) then {
			_units = _units + (crew _x);
		};
	} forEach _vehicles;
	_units = _units - allDead;
	
	_units
};


// Get all editor-placed infantries and set variable for them
private ["_units"];
_units = call dzn_dac_getAliveInfantries;
{
	_x setVariable ["dzn_isEquipedAfterSpawn",true];
} forEach _units;

// Wait until mission starts and sciprt-placed units are spawned and apply custom script on them. 
// I think, it should be running on FSM, but here is script-version
waitUntil { time > 1 };


["DAC_overlayLoop", "onEachFrame", {
	if (time > dzn_dac_overlayTimer) then {
		_units = call dzn_dac_getAliveInfantries;
		{
			if ( isNil { _x getVariable "dzn_isEquipedAfterSpawn" } && { !(isPlayer _x) }) then {
				_x setVariable ["dzn_isEquipedAfterSpawn", true];
				_x spawn {
					switch (side _this) do {
						case west: {		_this call dzn_dac_customScriptWEST;	};
						case east: {		_this call dzn_dac_customScriptEAST;	};
						case resistance: {	_this call dzn_dac_customScriptINDEP;	};
						case civilian: {	_this call dzn_dac_customScriptCIV;	};
					};
				};
			};
		} forEach _units;
		
		dzn_dac_overlayTimer = dzn_dac_overlayTimer + dzn_dac_overlayTimerStep;
	};
}] call BIS_fnc_addStackedEventHandler;
