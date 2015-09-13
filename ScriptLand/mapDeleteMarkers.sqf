[] spawn {
	waitUntil { time > 0 };
	listOfMarkersOnStart = allMapMarkers;
	listOfMarkersTimer = time + 2;
	["markerCheckId", "onEachFrame", {		
		if (time > listOfMarkersTimer && { !(listOfMarkersOnStart isEqualTo allMapMarkers) })then {
			listOfMarkersTimer = time + 2;
			{
				if !(_x in listOfMarkersOnStart) then {
					deleteMarker _x;
				};
			} forEach allMapMarkers;
		};
	}] call BIS_fnc_addStackedEventHandler;
};
