// Init of dzn_gear
private["_editMode"];

// EDIT MODE
_editMode = _this select 0;

if (_editMode) then {
	#include "dzn_gear_editMode.sqf"
};

if !(isServer) exitWith {};

// FUNCTIONS
waitUntil { !isNil "BIS_fnc_selectRandom" };

// Assign kit from given
// [ UNIT, KIT or ARRAY OF KITS ] spawn dzn_gear_assignKit
dzn_gear_assignKit = {
	private ["_kit","_randomKit"];
	(_this select 0) setVariable ["dzn_gear_assigned", _this select 1];
	
	_kit = [];
	if (!isNil {call compile (_this select 1)}) then {
		
		_kit = call compile (_this select 1);
		
		if (typename (_kit select 0) != "ARRAY") then {
			_randomKit =  (_kit call BIS_fnc_selectRandom);
			(_this select 0) setVariable ["dzn_gear_assigned", _randomKit];
			_kit = call compile _randomKit;
		};		
		
		[_this select 0, _kit] call dzn_gear_assignGear;
	} else {
		diag_log format ["There is no kit with name %1", (_this select 1)];
		player sideChat format ["There is no kit with name %1", (_this select 1)];
	};
};

// Assign gear from given kit
// [ UNIT, GEAR_ARRAY ] spawn dzn_gear_assignKit
dzn_gear_assignGear = {
	// Here is function assigning gear to unit	
	#include "dzn_gear_assignGear.sqf";
};

// GEARS
#include "dzn_gear_kits.sqf"

// INITIALIZATION
waitUntil { time > 0 };
private ["_logics", "_kitName", "_synUnits","_units","_crew"];

// Logics
_logics = entities "Logic";
if !(_logics isEqualTo []) then {	
	{
		
		if (["dzn_gear_", str(_x), false] call BIS_fnc_inString || !isNil {_x getVariable "dzn_gear"}) then {
			_kitName = if (!isNil {_x getVariable "dzn_gear"}) then {
				_x getVariable "dzn_gear"
			} else {
				str(_x) select [9]
			};
			
			_synUnits = synchronizedObjects _x;
			{
				if (_x  isKindOf "CAManBase") then {
					[_x, _kitName] spawn dzn_gear_assignKit;
				} else {
					private ["_crew"];
					_crew = crew _x;
					if !(_crew isEqualTo []) then {
						{
							[_x, _kitName] spawn dzn_gear_assignKit;
							sleep 0.1;
						} forEach _crew;
					};
				};
				sleep 0.2;
			} forEach _synUnits;
			deleteVehicle _x;
		};
	} forEach _logics;
};

// Units
_units = allUnits;
{
	if (!isNil {_x getVariable "dzn_gear"}) then {
		_kitName = _x getVariable "dzn_gear";
		if (_x isKindOf "CAManBase" && isNil {_x getVariable "dzn_gear_done"}) then {
			[_x, _kitName] spawn dzn_gear_assignKit;
		} else {
			_crew = crew _x;
			if !(_crew isEqualTo []) then {
				{
					if (isNil {_x getVariable "dzn_gear_done"}) then {
						[_x, _kitName] spawn dzn_gear_assignKit;
					};
					sleep 0.1;
				} forEach _crew;
			};
		};
	};
	sleep 0.2;
} forEach _units;
