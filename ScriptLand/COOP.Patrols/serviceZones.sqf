dzn_servicePoint_create = {
	/*
		[ type, pos ] spawn dzn_servicePoint_create
		0:	STRING	Type of service
		1:	POS3D	Base point position
	*/
	
	private["_type","_pos","_supplyList","_veh"];
	_type = _this select 0;
	_pos = _this select 1;
	
	_supplyList = switch (_this select 0) do {
		case "SERVICE_GROUND": {	[TRUCK_FUEL, TRUCK_AMMO,TRUCK_REPAIR]	};
		case "SERVICE_OUTPOST": {	[TRUCK_FUEL, TRUCK_AMMO]		};
	};
	
	{
		_veh = _x createVehicle (_this select 1);
		_veh hideObjectGloval true;
		_veh enableSimulation false;
		[_veh, _forEachIndex] spawn {
			// call FSM
		};
	} forEach _supplyList;
	
	
};
