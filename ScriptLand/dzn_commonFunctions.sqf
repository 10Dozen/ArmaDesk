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
