dzn_fnc_convertTriggerToLocation = {
	// trigger call dzn_fnc_convertTriggerToLocation
	private ["_trg","_trgArea","_loc"];
	_trg = _this;
	_trgArea = triggerArea _trg; // result is [200, 120, 45, false]
	
	_loc = createLocation ["Name", getPosATL _trg, _trgArea select 0, _trgArea select 1];
	_loc setDirection (_trgArea select 2);
	_loc setRectangular (_trgArea select 3);
	
	deleteVehicle _trg;
	
	_loc
};

// Killerzone Kid's
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
