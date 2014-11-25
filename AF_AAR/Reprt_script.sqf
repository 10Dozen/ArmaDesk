/*
	-------------------------------------------
	INIT
	-------------------------------------------
*/
dzn_aar_unitList = [ /*list of units*/ ];
waitUntil { time > 20 };
{
	_type = if (vehicle _x == _x) then { 0 } else { 6 }; // if (isKindOf "Man") then { 0 } else { 6 };
	
	_id = 	(_forEachIndex + 1)
	_pos = getPosASL _x;
	_dir = getDir _x;
	
	_unit setVariable ["dzn_aar_id", _id, true];
	_unit setVariable ["dzn_aar_type", (if (_type == 0) then { 0 } else { 7 }), true];
	
	
	if (_type == 0) then {
		diag_log format[
			"<AAR>%1,%2,%3,%4,1,%5,%6,%7,0,1", 
			_type, 
			_id,
			side _x, 
			name _x, 
			_pos select 0,
			_pos select 1, 
			_dir
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
	
	if (isPlayer _x) then {
		[[[_x],"dzn_report.fsm"],"BIS_fnc_execFSM",_x] call BIS_fnc_MP;
	} else {
		_x execFSM "dzn_report.fsm";
	};
} forEach dzn_aar_unitList;
[] execFSM "dzn_dumpReport.fsm";


/*
	-------------------------------------------
	dzn_report.fsm 
	Runned for each unit
	_this = unt
	------------------------------------------- 
*/

// Start -> True
_unit = _this;
_unitID = _unit getVariable "dzn_aar_id";
_unitType = _unit getVariable "dzn_aar_type"; // if (isKindOf "Man") then { 0 } else { 7 };
_timing = if (isPlayer _unit) then { 1.1 } else { 3.1 };

 
// FiredEH
// EvendHandler on each unit (maybe without AI units)
dzn_aar_fireEH = _unit addEventHandler ["Fired", {
	[ _this select 0, _this select 4, _this select 6] spawn {
		_unit = _this select 0;
		_ammo = _this select 1;
		_proj = _this select 2;
		
		_timeStart = floor(time);
		_posStart = getPosASL _proj;
		waitUntil { time + 1.1 > _timeStart };
		_posEnd = getPosASL _proj;
		
		_shotLineStart = format[
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
	};
}];


// True -> Report
// Report -> Timer
_lastTimeStamp = floor(time);
_pos = getPosASL _unit;
if (_unitType == 0) then {
	_stepReport = format[
		"<%2_AAR>%1,%2,%3,%4,%5,%6,0",
		_unitType,
		_unitID,
		_pos select 0,
		_pos select 1,
		getDir _unit,
		if (vehicle _unit == _unit) then { 0 } else { 1 }
	];
} else {
	_crew = ((crew _unit) select 0);
	_crewID = if (!isNil {_crew getVariable "dzn_aar_id"}) then { _crew getVariable "dzn_aar_id" } else { -1 };
	_stepReport = format[
		"<%2_AAR>%1,%2,%3,%4,%5,%6,0",
		_unitType,	// Тип юнита? 1 - пихот, 7 - коробчка, 2 - пуля
		_unitID,	// ID of Unit
		_crewID,	// ID экипажа
		count(crew _unit),	// Число членов экипажа
		_pos select 0,		// X-coord
		_pos select 1,		// Y-coord
		getDir _unit		// Direction
	];
};

call compile format [
	"_unit setVariable ['dzn_aar_ts_%1', _stepReport, true];",
	_lastTimeStamp
];

// Timer -> Report
// (time - _lastTimeStamp > _timing)




/*
	-------------------------------------------
	dzn_dumpReport.fsm
	Running on server
	_this = null
	-------------------------------------------
*/

// Start -> True
// True -> GetStackedReport
// GetStackedReport -> Timer
{
	// Spawn?
	_x spawn {
		_timeStamp = floor(time);
		for "_i" from 0 to _timeStamp do {
			call compile format [
				"if (isNil {dzn_aar_timeStack_%1}) then {
					dzn_aar_timeStack_%1 = ['5,%1'];
				};
				
				if (!isNil {_this getVariable 'dzn_aar_ts_%1'}) then {
					_aarLine = _this getVariable 'dzn_aar_ts_%1';
					dzn_aar_timeStack_%1 = dzn_aar_timeStack_%1 + _aarLine;
					_this setVariable ['dzn_aar_ts_%1', nil, true];
				}",
				_timeStamp
			];
		};
	}
} forEach dzn_aar_unitList;
_timer = time + 5;


// Timer -> DumpReport
// (time > _timer)

// DumpReport
_timeStamp = floor(time);
_fromTime = if ((_timeStamp - 20) > 0) then { _timeStamp - 20 } else { 0 };
_toTime = _timeStamp - 1;

for "_i" from _fromTime to _toTime do {
	// Spawn whole step? Or move to GetStackedReport
	call compile format[
		"if (!isNil {dzn_aar_timeStack_%1}) then {
			{
				diag_log _x; //Spawn line?
			} forEach dzn_aar_timeStack_%1;
			dzn_aar_timeStack_%1 = nil;
		}",
		_i
	];
}
_timer = time + 5;

// Timer2 -> GetStackedReport
// (time > _timer)
