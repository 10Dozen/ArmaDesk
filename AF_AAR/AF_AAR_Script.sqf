waitUntil {time > 0};

report_log = [];

// INIT

//0,1,EAST,[SQ] nicro,1,4764.16,10217.2,55.114,0,1
// TYPE, ID, SIDE, NAME, 1, X, Y, DIR, 0, 1
_type = if (vehicle player == player) then { 0 };
_id = 1;
_side = side player;
_name = name player;
_pos = getPosASL player;
_x = _pos select 0;
_y = _pos select 1;
_dir = direction player;

_initLine = format["%1,%2,%3,%4,1,%5,%6,%7,0,1", _type, _id, _side, _name, _x, _y, _dir];
report_log = report_log + [_initLine];


dzn_getReportInfo = {
// 1,1,4764.16,10217.2,55.1283,0,0
// TYPE, ID, X, Y, DIR, VISIBILITY, STATUS
	_unitType = 1;
	_unitId = 1;
	
	_pos = getPosASL player;
	_x = _pos select 0;
	_y = _pos select 1;
	_dir = direction player;
	_vis = if (vehicle player == player) then { 0 } else { 1 };

	_timestamp = format["5,%1",str(floor(time))];
	report_log = report_log + [_timestamp];
	_stepLine = format["%1,%2,%3,%4,%5,%6,0",_unitType,_unitId,_x,_y,_dir,_vis];
	report_log = report_log + [_stepLine];	
};

dzn_onFrame = {
	if (time % 1 < 0.01) then {
		[] spawn dzn_getReportInfo;
	};
};

lastTimeStamp = 0;

_eh = ["BIS_id", "onEachFrame", {
	if (time - lastTimeStamp > 1) then {
		lastTimeStamp = floor(time);
		[] spawn dzn_getReportInfo;
	}
}] call BIS_fnc_addStackedEventHandler; 

dzn_dump = {
/*	_string = "";	
	{
		_string  = _string + _x + "\n";
	} forEach report_log; 
	diag_log _string; */
	{
		diag_log _x;
	} forEach report_log; 
}

