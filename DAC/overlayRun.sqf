// Get all editor-placed infantries and set variable for them
private ["_units"];
_units = entities "CAManBase";
{
	_x setVariable ["dzn_isEquipedAfterSpawn",true];
} forEach _units;


// Wait until mission started and sciprt-placed units are spawned and apply custom script on them. 
// I think, it should be running on FSM, but here is script-version
waitUntil { time > 1 };
while { true } do {
	sleep 10;
	
	_units = entities "CAManBase";
	{
		if !(isPlayer _x) then {
			if (isNil { _x getVariable "dzn_isEquipedAfterSpawn" }) then {
				// Spawning code
				[_x] spawn {
					player sideChat format ["Working with %1", str(_x)];
					_x setVariable ["dzn_isEquipedAfterSpawn", true];
					
					removeAllWeapons _x;
					player sideChat "Done";
				};
			};		
		};
	} forEach _units;
};
