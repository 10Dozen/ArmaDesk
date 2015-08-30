// **************************
// Tasks
// **************************
for "_k" from 0 to 11 do {
	if (_k == 0) then {
		call compile format [
			'[east,["task%1"],["Reach Form Up Point and report","Reach FUP",""],getMarkerPos "mrkPatrolFUP",1,8,true,"",true] call BIS_fnc_taskCreate;'
			,str(_k)
		];
	} else {
		call compile format [
			'[east,["task%1"],["Reach and Check CP%1","Check CP%1",""],getMarkerPos "mrkCP%1",1,0,true,"",true] call BIS_fnc_taskCreate;'
			,str(_k)
		];		
	};	
	
	"task0" call BIS_fnc_taskSetCurrent;
};





// **************************
// IEDS
// **************************
waitUntil { time > 0 };
[] spawn {
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
	
	// Roadside IEDs
	_roadMap = [];
	{		
		_nearestRoads = (waypointPosition _x) nearRoads 50;
		_roadMap = _roadMap + _nearestRoads;
		xroads = _roadMap;
		
	} forEach (waypoints path_0);
	
	_iedTypes = [
		"Land_Tyres_F"
		,"Land_GarbageWashingMachine_F"
		,"Land_GarbageBags_F"
		,"Land_JunkPile_F"
	];
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
			_ied setVariable ["isIED", 3, true];	//isIED: 0 - is not; 1 - it is, disarmed; 2 - it is, spotted, can be defused; 3 - it is, unspotted;
			[_ied] execFSM "iedTrigger.fsm";
			
			_markerstr = createMarker ["markername",[_iedPos select 0, _iedPos select 1]];
			_markerstr setMarkerShape "ICON";
			_markerstr setMarkerType "hd_dot";
		};
		
		_iedEH = _ied addEventHandler ["HandleDamage", {
			private["_ied","_dam","_proj"];
			_ied = _this select 0;
			_dam = _this select 2;
			_proj = _this select 4;
			
			if ( _proj == "DemoCharge_Remote_Ammo" && (_ied getVariable "isIED" < 3 ) ) then {
				_ied setVariable ["isIED", 0, true];
			} else {
				if ( _proj == "SatchelCharge_Remote_Ammo" ) exitWith { 
					deleteVehicle _ied; 
				};
			};
		}];
	};
};


// **************************
// DYNAI ZONES
// **************************

[] spawn {
	waitUntil { time > 20 };
	private["_zone"];
	waitUntil {!isNil "dzn_fnc_dynai_activateZone"};
	waitUntil {!isNil "hpzs"};
	
	for "_i" from 0 to 5 do {
		_zone = hpzs call BIS_fnc_selectRandom;		
		hpzs = hpzs - [_zone];
			
		waitUntil { !isNil { (call compile (_zone)) getVariable "initialized"} };
		(call compile (_zone)) call dzn_fnc_dynai_activateZone;	
	};
};

// **************************
// RESPAWNS AND ROLES
// **************************




listOfDead = [];
publicVariable "listOfDead";
[] spawn {
	waitUntil { !(listOfDead isEqualTo []) };
	casPilot = listOfDead select 0;
	publicVariable "casPilot";
	
	waitUntil { count listOfDead > 2);
	medevacPilot = listOfDead select 1;
	
	waitUntil { count listOfDead > 3);	
};

