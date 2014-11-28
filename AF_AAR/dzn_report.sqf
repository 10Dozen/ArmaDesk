waitUntil {time > 0};
/*
	-------------------------------------------
	INIT
	-------------------------------------------
*/

dzn_aar_unitList = [ 
	player,
	hitman1,
	hitman2	
];
dzn_aar_unitList = dzn_aar_unitList + units (group uhitman1) + 	units (group uhitman2);
waitUntil { time > 1 };
{
	_type = if (vehicle _x == _x) then { 0 } else { 6 }; // if (isKindOf "Man") then { 0 } else { 6 };
	
	_id = (_forEachIndex + 1);
	_pos = getPosASL _x;
	_dir = getDir _x;
	_inVehicle = if (vehicle _x == _x) then { 0 } else { 1 };
	_isPlayer = if (isPlayer _x) then { 1 } else { 0 };
	
	_x setVariable ["dzn_aar_id", _id, true];
	_x setVariable ["dzn_aar_type", (_type + 1), true];

	if (_type == 0) then {
		diag_log format[
			"<AAR>%1,%2,%3,%4,1,%5,%6,%7,%8,%9", 
			_type, 
			_id,
			side _x, 
			name _x, 
			_pos select 0,
			_pos select 1, 
			_dir,
			_inVehicle,
			_isPlayer
		];
	} else {
		diag_log format[
			"<AAR>%1,%2,%3,2,-1,0,%4,%5,%6", 
			_type, 
			_id,
			name _x, 
			_pos select 0,
			_pos select 1, 
			_dir
		];
	};
	hint "Poomp";
	if (isPlayer _x) then {
	//	[[[_x],"dzn_report.fsm"],"BIS_fnc_execFSM",_x] call BIS_fnc_MP;
		_x execFSM "dzn_report.fsm";
	} else {
		_x execFSM "dzn_report.fsm";
	};
} forEach dzn_aar_unitList;

[] execFSM "dzn_dumpReport.fsm";
