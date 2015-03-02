dzn_servicePoint_create = {
	/*
		[ type, pos ] spawn dzn_servicePoint_create
		0:	STRING			- Type of service
		1:	POS3D or OBJECT		- Base point position or Object to attach to
		
	*/
	
	private["_type","_pos","_supplyList","_veh"];
	_type = _this select 0;
	_pos = if (typename (_this select 1) == "ARRAY") then { _this select 1 } ;
	_obj = if (isNil {_pos}) then { _this select 1 };
	
	// Тут определить массив машинок пустых 
	_supplyList = switch (_this select 0) do {
		case "SERVICE_GROUND": {	[TRUCK_FUEL, TRUCK_AMMO,TRUCK_REPAIR]	};
		case "SERVICE_OUTPOST": {	[TRUCK_FUEL, TRUCK_AMMO]		};
	};
	
	{
		_veh = objNull;
		if (isNil {_pos}) then {
			_veh = _x createVehicle [0,0,0];
			_veh attachTo [_obj, [0, 3*_forEachIndex, 0]];
		} else {
			_veh = _x createVehicle _pos;
		};
		
		_veh hideObjectGlobal true;
		_veh allowDamage false;
		_veh lock true;
		[_veh, _forEachIndex] spawn {
			// call FSM
		};
	} forEach _supplyList;	
};
