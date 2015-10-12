if (player distance (getMarkerPos "respawn_west") < 5) then {
	// Respawn at respawn point
	[player, player getVariable "dzn_gear", false] spawn dzn_fnc_gear_assignKit;
} else {
	// Revive respawn
};
	
