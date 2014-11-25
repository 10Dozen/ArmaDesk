/*
  Report.fsm 
  Runned for each unit
  _this = unt
*/

// Start -> True
_unit = _this;
_unitID = _unit getVariable "dzn_aar_id";
_unitType = _unit getVariable "dzn_aar_type"; // if (isKindOf "Man") then { 0 } else { 6 };
_timing = if (isPlayer _unit) then { 1.1 } else { 3.1 };

// True -> Report
// Report -> Timer
_lastTimeStamp = floor(time);
if (_unitType == 0) then {
  _pos = getPosASL _unit;
  _stepReport = format[
    "<%2_AAR>%1,%2,%3,%4,%5,%6,0",
    _unitType,
    _unitID,
    _pos select 0,
    _pos select 1,
    getDir _unit,
    if (vehicle _unit == _unit) then { 0 } else { 1 }
  ];
  
  call compile format [
    "_unit setVariable ['dzn_aar_ts_%1', _stepReport, true];",
    _lastTimeStamp
  ];
};

// Timer -> Report
// (time - _lastTimeStamp > _timing)




/*
	dumpReport.fsm
	Running on server
	_this = null
*/

// Start -> True
// True -> GetStackedReport
// GetStackedReport -> Timer
{
	_timeStamp = floor(time);
	for "_i" from 0 to _timeStamp do {
		call compile format [
			"if (isNil {dzn_aar_timeStack_%1}) then {
				dzn_aar_timeStack_%1 = ['5,%1'];
			};
			
			if (!isNil {_x getVariable 'dzn_aar_ts_%1'}) then {
				_aarLine = _x getVariable 'dzn_aar_ts_%1';
				dzn_aar_timeStack_%1 = dzn_aar_timeStack_%1 + _aarLine;
				_x setVariable ['dzn_aar_ts_%1', nil, true];
			}",
			_timeStamp
		];
	};
} forEach dzn_aar_unitList;
_timer = time + 5;


// Timer -> DumpReport
// (time > _timer)

// DumpReport
_timeStamp = floor(time);
_fromTime = if ((_timeStamp - 20) > 0) then { _timeStamp - 20 } else { 0 };
_toTime = _timeStamp - 1;

for "_i" from _fromTime to _toTime do {
	call compile format[
		"if (!isNil {dzn_aar_timeStack_%1}) then {
			{
				diag_log _x;
			} forEach dzn_aar_timeStack_%1;
			dzn_aar_timeStack_%1 = nil;
		}",
		_i
	];
}
_timer = time + 5;

// Timer2 -> GetStackedReport
// (time > _timer)
