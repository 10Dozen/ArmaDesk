// Choose mission areas (name -> text (location)):
_locationsForSeize = nearestLocations [ [0,0,0], ["NameCity","NameCityCapital"], 20000];
_locationsForRecon = nearestLocations [ [0,0,0], ["NameCity","NameVillage"], 20000];

_seizeLocations = [];   // Locations for Seize mission
_reconLocations = [];   // Locations for Recon mission

for "_i" from 0 to 1 do {
  _loc = _locationsForSeize select round(random(count _locationsForSeize - 1));
  _seizeLocations = _seizeLocations + [_loc];
  _locationsForSeize = _locationsForSeize - [_loc];
  if (_loc in _locationsForRecon) then {
    _locationsForRecon = _locationsForRecon - [_loc];
  };
};

for "_i" from 0 to 1 do {
  _loc = _locationsForRecon select round(random(count _locationsForRecon - 1));
  _reconLocations = _reconLocations + [_loc];
  _locationsForRecon = _locationsForRecon - [_loc];
};

