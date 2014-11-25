// START
// Start -> True
_unit = _this;
_unitID = _unit getVariable "dzn_aar_id";
_type = _unit getVariable "dzn_aar_type"; // if (isKindOf "Man") then { 0 } else { 7 };
_timing = if (isPlayer _unit) then { 1.1 } else { 3.1 };

 
// FiredEH
// EvendHandler on each unit (maybe without AI units)
dzn_aar_fireEH = _unit addEventHandler ["Fired", {
	[ _this select 0, _this select 4, _this select 6] spawn {
		_unit = _this select 0;
		_ammo = _this select 1;
		_proj = _this select 2;
		
		_timeStart = floor(time);
		_posStart = getPosASL _unit;
		waitUntil { time + 1.1 > _timeStart };
		_posEnd = getPosASL _proj;
		
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
	};
}];


/*
  REPORT SAVE
*/
_lastTimeStamp = floor(time);
_pos = getPosASL _unit;
_stepReport = "";

if (_type == 1) then {
	_stepReport = format[
		"<%2_AAR_Inf>%1,%2,%3,%4,%5,%6,0",
		_type,
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
		"<%2_AAR_Veh>%1,%2,%3,%4,%5,%6,0",
		_type,	// Òèï þíèòà? 1 - ïèõîò, 7 - êîðîá÷êà, 2 - ïóëÿ
		_unitID,	// ID of Unit
		_crewID,	// ID ýêèïàæà
		count(crew _unit),	// ×èñëî ÷ëåíîâ ýêèïàæà
		_pos select 0,		// X-coord
		_pos select 1,		// Y-coord
		getDir _unit		// Direction
	];
};

call compile format [
	"_unit setVariable ['dzn_aar_ts_%1', _stepReport, true];
	hintSilent 'AAR_%1' ;
	",
	_lastTimeStamp
];

/*
	Loop
*/
(time - _lastTimeStamp > _timing)
