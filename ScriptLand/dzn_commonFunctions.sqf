dzn_fnc_convertTriggerToLocation = {
	// [trigger, delete trigger?] call dzn_fnc_convertTriggerToLocation
	private ["_trg","_deleteTrg","_trgArea","_loc"];
	_trg = _this select 0;
	_deleteTrg = if ( isNil {_this select 1} ) then { true } else { _this select 1 };
	
	_trgArea = triggerArea _trg; // result is [200, 120, 45, false]

	_loc = createLocation ["Name", getPosATL _trg, _trgArea select 0, _trgArea select 1];
	_loc setDirection (_trgArea select 2);
	_loc setRectangular (_trgArea select 3);
	
	if (_deleteTrg) then { deleteVehicle _trg; };
	
	_loc
};

KK_fnc_onEachFrame = {
    private "_oef";
    if (typeName _this isEqualTo "CODE") then {
        _this = format ["%1", _this];
        _this = _this select [1, count _this - 2];
    };
    _oef = "EmptyDetector" createVehicleLocal [0, 0, 0];
    _oef setTriggerArea [0, 0, 0, false];
    _oef setTriggerStatements [_this, "", ""];
    _oef
};

dzn_fnc_getMissionParametes = {
	//Params
	if (isNil "paramsArray") then {
		if (isClass (missionConfigFile/"Params")) then {
			for "_i" from 0 to (count (missionConfigFile/"Params") - 1) do {
				_paramName = configName ((missionConfigFile >> "Params") select _i);
				missionNamespace setVariable [_paramName, getNumber (missionConfigFile >> "Params" >> _paramName >> "default")];
			};
		};
	} else {
		for "_i" from 0 to (count paramsArray - 1) do {
			missionNamespace setVariable [configName ((missionConfigFile >> "Params") select _i), paramsArray select _i];
		};
	}; 
};

#define DZN_SELECT_RANDOM(X,Y,Z)	X = Y call BIS_fnc_selectRandom; if (Z) then {Y = Y - [X];};

// dzn_selectRandom(_hq,_allPlayers,true) ->
// _hq = _allPlayer call BIS_fnc_selectRandom; if (true) then {_allPlayer = _allPlayer - [_hq];};



dzn_fnc_getValueByKey = {
	// [@Array, @Key] call dzn_fnc_getValueByKey
	private["_output","_default"];
	_default = "@Wrong key";
	_output = _default;
	
	{
		if ( [_this select 1, _x select 0] call BIS_fnc_areEqual ) exitWith { _output = _x select 1; };
	} forEach (_this select 0);
	
	if (typename _output == typename _default && {_output == _default}) then { 
		hintSilent format ["dzn_fnc_getValueByKey :: Failed to find %1 key. Will return FALSE.", str(_this select 1)];
		diag_log format ["dzn_fnc_getValueByKey :: Failed to find %1 key. Will return FALSE.", str(_this select 1)];
		_output = false;
	};
	
	_output
};

dzn_fnc_setValueByKey = {
	//[@Array, @Key, @NewValue] call dzn_fnc_setValueByKey	
	private ["_array","_key","_value","_default"];
	
	_array = _this select 0;
	_key = _this select 1;
	_value = _this select 2;
	_default = false;
	{
		if ( [_key, _x select 0] call BIS_fnc_areEqual ) exitWith {
			_array set [ _forEachIndex, [_key, _value] ];
			_default = true;
		};
	} forEach _array;
	
	if !(_default) exitWith {
		hintSilent format ["dzn_fnc_setValueByKey :: Failed to find %1 key. Array is not updated.", str(_key)];
		diag_log format ["dzn_fnc_setValueByKey :: Failed to find %1 key. Array is not updated.", str(_key)];
	};
};

dzn_fnc_getAllPlayers = {
	// [@SP/MP/Both, (ExcludeArray)] call dzn_fnc_getAllPlayers
	// Output: dzn_allPlayers:ARRAY
	private["_type","_exclude","_code"];
	_type = _this select 0;
	_exclude = if (isNil {_this select 1}) then { [] } else { _this select 1 };
	
	dzn_allPlayers = [];
	
	_code = "{
		if((isPlayer _x) && !(_x in dzn_allPlayers) && !(_x in _exclude)) then {dzn_allPlayers pushBack _x;};
	} forEach %1;";
	
	switch (_type) do {
		case "SP": {call compile format [_code, "switchableUnits"];};
		case "MP": {call compile format [_code, "playableUnits"];};
		case "All": {
			call compile format [_code, "switchableUnits"];
			call compile format [_code, "playableUnits"];
		};
	};
};


dzn_fnc_setWeather = {
	// this call dzn_fnc_setWeather
	if !(isServer || isDedicated) exitWith {};
	
	if (_this > 0) then {
		{
			if (_this == _x select 0) exitWith {
				0 setOvercast (_x select 1);
			};
		} forEach dzn_weatherSettingsMapping;
	} else {
		0 setOvercast ( (dzn_weatherSettingsMapping call BIS_fnc_selectRandom) select 1 );
	};
	
	switch (_this) do {
		case 4: { 0 setRain 0.5; };
		case 5: { 0 setRain 1; };
	};
	
	forceWeatherChange
};

dzn_fnc_setFog = {
	// _this call dzn_fnc_setFog
	if !(isServer || isDedicated) exitWith {};
	
	if (_this > 0) then {
		0 setFog ([dzn_fogSettingsMapping, _this] call dzn_fnc_getValueByKey);
	} else {
		0 setFog ((dzn_fogSettingsMapping call BIS_fnc_selectRandom) select 1);
	};
};

dzn_fnc_setDateTime = {
	//[par_daytime, par_month, par_year] call dzn_fnc_setDateTime
	private["_time","_day","_month","_year"];
	
	_time = _this select 0;
	_month = _this select 1;
	_year = _this select 2;
	_day = round(random 28);
	
	if (_time == 0) then { _time = floor(random 23); };
	if (_month == 0) then { _month = 1 + floor(random 12); };

	setDate [_year, _month, _day, _time, 0];
};

dzn_fnc_cache = {};

dzn_unhideUnit = {
	// call dzn_unhideUnit
	{
		_x enableSimulationGlobal true; 
		_x hideObjectGlobal false;
	} forEach (call BIS_fnc_listPlayers);
};

dzn_fnc_ra_getSquadLeader = {
	// "squadId" call dzn_fnc_ra_getSquadLeader
	if (isNil "dzn_assignedSquads") exitWith {
		player globalChat "dzn_fnc_ra_getSquadLeader: dzn_assignedSquads is not initialized!";
	};

	private["_squad"];
	
	_squad = [dzn_assignedSquads, _this] call dzn_fnc_getValueByKey;
	if (typename _squad != "ARRAY") exitWith { 
		player globalChat format ["dzn_fnc_ra_getSquadLeader: There is no unit for squad with ID %1", _this];
		objNull
	};
	
	if (isNil {_squad select 0}) exitWith { player globalChat "dzn_fnc_ra_getSquadLeader: No squad leader"; objNull };
	
	_squad select 0
};


dzn_fnc_convertToTimestring = {
	// Time to string function
	//time(seconds) call dzn_fnc_convertToTimestring
	private ["_minutes","_seconds"];
	_minutes = floor(_this / 60);
	_seconds = _this - _minutes * 60;
	_output = "";
	
	#define DZN_TODOUBLEDIGIT(X)	if (count str(X) == 2) then { str(X) } else { "0" + str(X) }	
	if (_minutes > 0) then {
		_output = "00:" + (DZN_TODOUBLEDIGIT(_minutes)) + ":" + (DZN_TODOUBLEDIGIT(_seconds));
	} else {
		_output = "00:00:" + (DZN_TODOUBLEDIGIT(_seconds));
	};
	_output
};


dzn_fnc_getPosOnGivenDir = {
	/*
		Return position on given direction and distance from base point
		EXAMPLE: [getPos player, 270, 1000] call dzn_fnc_getPosOnGivenDir
		INPUT:
			0: Pos3d 		- StartPos
			1: Number 		- Direction from start pos
			2: Number		- Distance from start pos
		OUTPUT:	ARRAY Pos3d
	*/
	private ["_pos", "_dir", "_dist", "_newPos"];
	_pos = _this select 0;
	_dir = _this select 1;
	_dist = _this select 2;
	_newPos = [
		(_pos select 0) + ((sin _dir) * _dist),
		(_pos select 1) + ((cos _dir) * _dist),
		_pos select 2
	];
	
	_newPos
};
