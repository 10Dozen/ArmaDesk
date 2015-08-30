if (player distance (getMarkerPos "respawn_west") < 5) then {
	// Dead
	listOfDead pushBack player;
	publicVariable "listOfDead";
	
	[player, player getVariable "dzn_gear"] call dzn_fnc_gear_assignKit;
} else {
	// Revived
};
