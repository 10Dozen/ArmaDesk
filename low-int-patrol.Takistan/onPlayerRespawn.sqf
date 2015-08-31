if (player distance (getMarkerPos "respawn_east") < 5) then {
	[] spawn {		
		sleep 0.3;
		[player, player getVariable "dzn_gear"] call dzn_fnc_gear_assignKit;
		call fnc_addEarplugs;
	};
} else {
	// Revived	
};

call fnc_addDefuseActions;
call fnc_addKilledMPEH;
