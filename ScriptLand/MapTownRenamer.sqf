

dzn_fnc_renameTownAtArea = {
	/*
		Strikes location name and add new name over default one. Dirty way to rename towns on map!
		
		INPUT:
		0: (TRIGGER or ARRAY)	- trigger or [@Pos3d, @Radius] to search location in
		1: (STRING)		- new name of the location
		
		OUTPUT: None	
	*/
	params ["_area", "_newName"];
	
	private ["_pos","_r","_newLoc"];
	
	if (typename _area == "ARRAY") then {
		_pos = _area # 0;
		_r = _area # 1;
	} else {
		_pos = getPos _area;
		_r = (triggerArea _area select 0) max (triggerArea _area select 1);
	};
	
	private _locs = nearestLocations [
		_pos
		, ["Name","CityCenter","Airport","NameMarine","NameCityCapital","NameCity","NameVillage","NameLocal"]
		, _r
	];
	
	private _loc = _locs # 0;
	private _locText = text _loc;
	private _locPos = locationPosition _loc;
	
	if (text _loc == "") exitWith {};
	private _chars = count _locText;
	
	private _vLines = "";
	private _hLines = "";
	for "_i" from 1 to _chars do {
		_vLines = _vLines + "||";
		_hLines = _hLines + "=";
	};
	
	{
		_newLoc = createLocation ["NameCityCapital", _locPos, 30, 30];
		_newLoc setText _x;
	} forEach [_vLines, _hLines];
	
	_newLoc = createLocation ["NameCityCapital", _locPos getPos [50, 0], 30, 30];
	_newLoc setText _newName;
};
