// Should be ran from init of server: 0 = [] execVM "dzn_serviceTrucks.sqf";
// Will add action 'Unload wheel' which will spawn agm spare wheel for repair.

private ["_supportVehicles","_wheelsCount","_vehicles"];
// Supported Vehicle classes
_supportVehicles = [
	"B_Truck_01_Repair_F",
	"O_Truck_03_repair_F",
	"O_Truck_02_box_F"
];
_wheelsCount = 4; // Count of wheels per truck

_vehicles = vehicles; // Get all vehicles in mission

// For each vehicle:
{
	// Is class of vehicle is one of the classes from array above (_supportVehicles) and custom wheels weren't added
	if (((typeOf _x) in _supportVehicles ) && (isNil {_x getVariable "dzn_serviceTruck_wheels"})) then {
		// Assign a number of wheel for vehicle
		_x setVariable ["dzn_serviceTruck_wheels", _wheelsCount, true];
		// Add an action available for everyone: unload 1 wheel from added by this script
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
