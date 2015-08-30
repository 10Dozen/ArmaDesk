// Convert mission parameters classes to variables with the smae name - e.g. @class par_alliedForces_amount to @par_alliedForces_amount
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

dzn_fnc_setWeather = {
	// [@MisPar, @Mapping] call dzn_fnc_setWeather
	if !(isServer || isDedicated) exitWith {};
	
	if (_this select 0 > 0) then {
		{
			if (_this select 0 == _x select 0) exitWith {
				0 setOvercast (_x select 1);
			};
		} forEach (_this select 1);
	} else {
		0 setOvercast ( ((_this select 1) call BIS_fnc_selectRandom) select 1 );
	};
	
	switch (_this select 0) do {
		case 4: { 0 setRain 0.5; };
		case 5: { 0 setRain 1; };
	};
	
	forceWeatherChange
};

dzn_fnc_setFog = {
	// [@MisPar, @Mapping] call dzn_fnc_setFog
	if !(isServer || isDedicated) exitWith {};
	
	if (_this select 0 > 0) then {
		0 setFog ([_this select 1, _this select 0] call dzn_fnc_getValueByKey);
	} else {
		0 setFog ((_this select 1 call BIS_fnc_selectRandom) select 1);
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

dzn_fnc_isInArea2d = {
	// @Boolean = [ @Object or @Pos3d to check, @Pos3d, @Distance ] call dzn_fnc_isInArea2d;
	private["_cPos"];
	_cPos = if (typename (_this select 0) == "ARRAY") then { _this select 0 } else { getPosASL (_this select 0) };
	
	if (_cPos distance2D (_this select 1) <= _this select 2) then {
		true
	} else {
		false
	};	
};

dzn_fnc_unitsInArea2d = {
	// @Boolean = [ @Units, @Pos3d, @Distance] call dzn_fnc_unitsInArea2d
	private["_result"];
	_result = false;
	{
		if ([_x, _this select 1, _this select 2] call dzn_fnc_isInArea2d) exitWith {
			_result = true;
		};
	} forEach (_this select 0);

	_result
};


