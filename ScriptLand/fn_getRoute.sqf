/*
	[@Object, ([@Option, @Radius, @ClassnameFilter])] call dzn_fnc_getRoute
	Object's waypoints will be collected as Pos3d. If option is given - roads or building  will be collected in given radius (or waypointCompleteRadius)
	INPUT:
		0: OBJECT - object with waypoints
		1: 
			OPTION - "Roads", "Buildings"
			RADIUS - Radius in meters to check option, if 0 then waypointCompleteRadius will be used
			CLASSFILTERS - array of classnames to filter
	OUTPUT: @Array of positions  OR  [ @Array of positions, @Array of objects by options ]
*/

params ["_core", ["_option", ["none", 0, []]]];
_output = [];
_outputWP = [];

_wps = waypoints _core;
{
	_outputWP pushBack (waypointPosition _x);
} forEach _wps;

if (_option select 0 != "none") then {
	{
		switch toLower(_option select 0) do {
			case "roads": {
			
			};
			case "buildings": {
			
			};
		};
	} forEach _wps;
};

_output
