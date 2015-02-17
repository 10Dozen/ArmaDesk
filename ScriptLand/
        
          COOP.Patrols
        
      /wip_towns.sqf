[] spawn { { player setPos (locationPosition _x); hint str(text _x); sleep 5; } forEach (nearestLocations [ position player, ["NameCity","NameCityCapital","NameVillage"], 10000]); }
