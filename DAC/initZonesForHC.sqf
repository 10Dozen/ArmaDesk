// Recreates triggers with zones for DAC for HC use
// Should be SPAWNED or EXECVM from init of HC
// EDITOR: onAct of trigger there is a line with: dac_hc = [ ... ]  OR  triggerText = dac_hc

if !(name player == "HC") exitWith {};

dzn_dachc_initialized = false;
publicVariable "dzn_dachc_initialized";

private ["_allTriggers","_statements"];
_allTriggers = allMissionObjects "EmptyDetector";

{
	_statements = (triggerStatements _x);
	if ( (["dac_hc", _statements select 1, false] call BIS_fnc_inString) || (triggerText _x == "dac_hc") ) then {
		[_x, _statements] spawn {
			private ["_sourceTrg","_sourceState", "_trg"];
			_sourceTrg = _this select 0;
			_sourceState = _this select 1;

			_trg = createTrigger ["EmptyDetector",getPosASL _sourceTrg];
			_trg setTriggerArea (triggerArea _sourceTrg);
			_trg setTriggerStatements _sourceState;
			
			deleteVehicle _sourceTrg;
		};
	}
	sleep 0.1
} forEach _allTriggers;

dzn_dachc_initialized = true;
publicVariable "dzn_dachc_initialized";
