{
	hint "Olla";
	_spots = synchronizedObjects _x;
	{
		_x spawn {		
			#define checkClass(MARK, CLASS)	if ([MARK, str(_this), false] call BIS_fnc_inString) then { _defined = CLASS } else {
			#define closeCheckClass			};};};};};};};};};};};};};};};};};
			_defined = "";
				
			checkClass("RECON_CAR", RECON_CAR)
			checkClass("TRUCK_CARGO", TRUCK_CARGO)
			checkClass("ARMED_CAR", ARMED_CAR)
			checkClass("IFV", IFV)
			checkClass("APC", APC)
			checkClass("TANK", TANK)
			checkClass("CARGO_HELI", CARGO_HELI)
			checkClass("CAS_HELI", CAS_HELI)
			checkClass("CAS_PLANE", CAS_PLANE)
			checkClass("TRUCK_REPAIR", TRUCK_REPAIR)
			checkClass("TRUCK_FUEL", TRUCK_FUEL)
			checkClass("TRUCK_AMMO", TRUCK_AMMO)
			checkClass("BOX_AMMO", BOX_AMMO)
			checkClass("BOX_MEDIC", BOX_MEDIC)
			checkClass("SERVICE_AIR", SERVICE_AIR)
			checkClass("SERVICE_GROUND", SERVICE_GROUND)
			checkClass("SERVICE_OUTPOST", SERVICE_OUTPOST)
			closeCheckClass
				
			if !(isNil {_defined}) then {
				if (typename _defined == "ARRAY") then {
					_defined = _defined call BIS_fnc_selectRandom;
				};
					
				if (typename _defined == "STRING") then {
					_veh = _defined createVehicle (getPosATL _this);
					_veh setDir (getDir _this);
				} else {
					(getPosATL _this) spawn _defined;
				};
			} else {		
				player sideChat "No classname for this shit!";
			};
				
			deleteVehicle _this;
		};
		sleep .1;
	} forEach _spots;
} forEach (FOBs + OUTPOSTs);
