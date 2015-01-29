waitUntil { time > 1 };

while { true } do {
	sleep 10;
	
	_units = entities "CAManBase";
	{
		if !(isPlayer _x) then {
			if (isNil { _x getVariable "dzn_isEquipedAfterSpawn" }) then {
				player sideChat format ["Working with %1", str(_x)];
				_x setVariable ["dzn_isEquipedAfterSpawn", true];
				
				removeAllWeapons _x;
				player sideChat "Dobe";
			};		
		};
	} forEach _units;
}
