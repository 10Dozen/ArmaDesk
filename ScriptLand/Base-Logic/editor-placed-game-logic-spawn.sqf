#define PLACEMENT(OBJ)		private["_placement"]; _placement = OBJ; { switch (true) do {
#define	ITEM_GROUP(ITEM)	case ([ ITEM , str(_x), false ] call BIS_fnc_inString): 
#define PLACEMENT_END		};} forEach (synchronizedObjects _placement);


PLACEMENT( cas_placement )
	ITEM_GROUP("cas_lot") {
		_veh = [cas_className,_x] call _spawnVehicle;
		_veh setVariable ["cas_rrr_magazines", magazines _veh, true];			
	};
	
	ITEM_GROUP("cas_rrr") {
	
	};
PLACEMENT_END	
