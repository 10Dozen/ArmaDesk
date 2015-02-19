// Choose mission areas (name -> text (location)):
_locationsForSeize = nearestLocations [ [0,0,0], ["NameCity","NameCityCapital"], 20000];
_locationsForRecon = nearestLocations [ [0,0,0], ["NameCity","NameVillage"], 20000];

dzn_seizeLocations = [];   // Locations for Seize mission
dzn_reconLocations = [];   // Locations for Recon mission

// 2 for Seize
for "_i" from 0 to 1 do {
	_loc = _locationsForSeize select round(random(count _locationsForSeize - 1));
	dzn_seizeLocations = dzn_seizeLocations + [_loc];
	_locationsForSeize = _locationsForSeize - [_loc];
	if (_loc in _locationsForRecon) then {
		_locationsForRecon = _locationsForRecon - [_loc];
	};
};

// 3 for Recon
for "_i" from 0 to 2 do {
	_loc = _locationsForRecon select round(random(count _locationsForRecon - 1));
	dzn_reconLocations = dzn_reconLocations + [_loc];
	_locationsForRecon = _locationsForRecon - [_loc];
};

dzn_reconToSeizeLocation = dzn_reconLocations call BIS_fnc_selectRandom;
dzn_reconLocations = dzn_reconLocations - [dzn_reconToSeizeLocation];

//
// Spawning DAC camps and Areas
//

dzn_createDACZone = {
	// [posX, posY, x, y, isCamp, zoneName
  
	_trg = createTrigger ["EmptyDetector", (_this select 0), (_this select 1)];
	_trg setTriggerArea [(_this select 2), (_this select 3), 0, false];
	_trg setTriggerActivation ["LOGIC", "PRESENT", true];
  
	if (_this select 4) then {
		_trg setTriggerStatements [
			"true", 
			str(SEIZE_AREA_SPAWN((_this select 5),(_this select 2),(_this select 3))), 
			""
		]; 
	} else {
	  	_trg setTriggerStatements [
			"true", 
			str(SEIZE_CAMP_SPAWN((_this select 5),(_this select 2),(_this select 3))), 
			""
		];
	};
};

{

} forEach (dzn_seizeLocations + [dzn_reconToSeizeLocation]);

//
// 
//
