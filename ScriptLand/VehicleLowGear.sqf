/**
 *	Adds extra torque/low gear to vehicle while key is pressed:
 *	left shift 	-> forward gear
 *	right shift	 -> backward gear
 *
 *	Helps to get out when stucked :D
 */


	
// List of classnames compatible with feature
dzn_logGear_compatibleVehicles = ["CUP_B_Challenger2_2CW_BAF"];

// M/s and timeout to apply low gear effects
dzn_logGear_torqueTimeout = 0.5;
dzn_logGear_torquePower = 3;
dzn_lowGear_isKeyPressed = false;

// Functions and initialization
[
	{ !(isNull (findDisplay 46)) }
	,{ (findDisplay 46) displayAddEventHandler ["KeyDown", "_handled = _this call dzn_lowGear_fnc_lowGearHandle"]; }
	, []
] call CBA_fnc_waitUntilAndExecute;

dzn_lowGear_fnc_lowGearHandle = {
	if (
		dzn_lowGear_isKeyPressed
		|| { 
			!alive player
			|| vehicle player == player
			|| !local (vehicle player)
		}
	) exitWith {};
	
	private["_key","_shift","_crtl","_alt","_handled"];	
	_key = _this select 1;
	_handled = false;

	switch _key do {
		// LShift button
		case 42: {
			dzn_lowGear_isKeyPressed = true;
			["forward"] call dzn_lowGear_fnc_applyTorque;
			_handled = true;
		};
		// RShit
		case 54: {
			dzn_lowGear_isKeyPressed = true;
			["backward"] call dzn_lowGear_fnc_applyTorque;
			_handled = true;
		};
	};
	
	[{ dzn_lowGear_isKeyPressed = false; }, [], dzn_logGear_torqueTimeout] call CBA_fnc_waitAndExecute;
	
	_handled
};

dzn_lowGear_fnc_applyTorque = {
	params ["_direction"];
	private _veh = vehicle player;
	
	if (dzn_logGear_compatibleVehicles findIf { _x == typeOf _veh } < 0) exitWith {};
	
	private ["_msg","_dirMultiplier"];
	
	if (_direction == "forward") then {
		_dirMultiplier = 1;
		_msg = "Low-gear: Forward";
	} else {
		_dirMultiplier = -1;
		_msg = "Low-gear: Backward";
	};
	
	if (
		(speed _veh > 0 && _dirMultiplier < 0) 
		|| (speed _veh < 0 && _dirMultiplier > 0) 
	) exitWith {};
	
	_veh setVelocityModelSpace [0, dzn_logGear_torquePower * _dirMultiplier, 0.1];
	
	private _v = velocity _veh;
	_veh setVelocity [_v # 0, _v # 1, 0.01];		
	
	501 cutText [_msg,"PLAIN DOWN", 0.5];
};
