// Should be ran from init of server: 0 = [] execVM "dzn_serviceTrucks.sqf";
// Will add action 'Unload wheel' which will spawn agm spare wheel for repair.

private ["_supportVehicles","_wheelsCount","_vehicles"];
_supportVehicles = [
	"B_Truck_01_Repair_F",
	"O_Truck_03_repair_F",
	"O_Truck_02_box_F"
];
_wheelsCount = 4;

_vehicles = vehicles;

{
	if (((typeOf _x) in _supportVehicles ) && (isNil {_x getVariable "dzn_serviceTruck_wheels"})) then {
		_x setVariable ["dzn_serviceTruck_wheels", _wheelsCount, true];
		_x setVariable [
			"dzn_serviceTruck_unloadWheel", 
			_x addAction [
				"Unload wheel",
				"(_this select 0) setVariable ['dzn_serviceTruck_wheels', ((_this select 0) getVariable 'dzn_serviceTruck_wheels') - 1, true];
				_wheel = 'AGM_SpareWheel' createVehicle [0,0,100];
				_wheel setPosASL ((_this select 1) modelToWorld [0, +2, 0]);",
				[], 6, false, true, "", 
				"(alive _target) && { (_target distance _this < 10) && (_target getVariable 'dzn_serviceTruck_wheels' > 0) }"
			],
			true
		];
	};
} forEach _vehicles;
