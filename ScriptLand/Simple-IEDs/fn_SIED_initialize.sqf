/*
	SERVER SIDE
*/
#define IED_DEBUG		false
#define IED_CLASSNAMES		"Land_Tyres_F" \
				,"Land_GarbageWashingMachine_F" \
				,"Land_GarbageBags_F" \
				,"Land_JunkPile_F"



fnc_s_ied_vehiclesNear = {
	// @Boolean = [ @Side, @Pos, @Distance ] call fnc_s_ied_vehiclesNear;
	private["_result"];
	_result = false;
	{
		if (side _x == (_this select 0) && alive _x && { [ _x, _this select 1, _this select 2 ] call dzn_fnc_isInArea2d}) exitWith {
			_result = true;
		};		
	} forEach vehicles;	
	_result
};

private["_roadMap", "_nearestRoads", "_roadPiece","_iedPos","_ied","_iedType","_j"];
_iedTypes = [ IED_CLASSNAMES ];
_roadMap = [];

// Roadside IEDs
{		
	_nearestRoads = (waypointPosition _x) nearRoads 50;
	_roadMap = _roadMap + _nearestRoads;
} forEach (waypoints path_0);

for "_j" from 0 to 15 do {
	_roadPiece = _roadMap call BIS_fnc_selectRandom;
	_roadMap = _roadMap - [_roadPiece];

	_iedPos = _roadPiece modelToWorld [6,0,0];
	_iedPos = [_iedPos select 0, _iedPos select 1, 0];

	_iedType = _iedTypes call BIS_fnc_selectRandom;		
	
	_ied = _iedType createVehicle [0,0,0];		
	_ied setPosATL _iedPos;
	_ied setDir (random 360);
		
	if (round(random 100) > 25) then {
		/* NO IED */
		_ied setVariable ["isIED", 0, true];
	} else {
		/* ARMED */
		_ied setVariable ["isIED", 3, true];	//isIED: 0 - is not; 1 - it is, disarmed; 2 - it is, spotted, can be defused; 3 - it is, unspotted, 4 - triggered;
		[_ied] execFSM "iedTrigger.fsm";
		
		if (IED_DEBUG) then {
			_markerstr = createMarker [format ["markername%1", _iedPos select 0],[_iedPos select 0, _iedPos select 1]];
			_markerstr setMarkerShape "ICON";
			_markerstr setMarkerType "hd_dot";
		};
	};
};
