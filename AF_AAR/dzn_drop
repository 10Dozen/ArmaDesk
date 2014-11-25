/*
	START
*/

/*
	GET STACKED REPORT
*/
{
	_x spawn {
		_timeStamp = floor(time);
		_fromTime = if ((_timeStamp - 20) > 0) then { _timeStamp - 20 } else { 0 };

		for "_i" from _fromTime to _timeStamp do {
			call compile format [
				"if (isNil {dzn_aar_timeStack_%1} && {  (!isNil {_this getVariable 'dzn_aar_ts_%1'})  } ) then {
					dzn_aar_timeStack_%1 = ['<AAR>5,%1'];
				};
	
				if (!isNil {_this getVariable 'dzn_aar_ts_%1'}) then {
					_aarLine = _this getVariable 'dzn_aar_ts_%1';
					dzn_aar_timeStack_%1 = dzn_aar_timeStack_%1 + [_aarLine];
					_this setVariable ['dzn_aar_ts_%1', nil, true];

					player sideChat format [
						'StackedReport: %1 :: %2',
						_i,
						str(dzn_aar_timeStack_%1)	
					];

				};
				",
				_i
			];
		};
	}
} forEach dzn_aar_unitList;

_timer = time + 5;

/*
	TIMER
*/
(time > _timer)

/*
	REPORT TO RPT
*/
_timeStamp = floor(time);
_fromTime = if ((_timeStamp - 20) > 0) then { _timeStamp - 20 } else { 0 };
_toTime = _timeStamp - 1;

//player sideChat str(_fromTime);
//player sideChat str(_toTime);

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
};
_timer = time + 5;

/*
	LOOP
*/
(time > _timer)
