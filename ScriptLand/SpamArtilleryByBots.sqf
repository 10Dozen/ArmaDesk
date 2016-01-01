enableSaving[false,false];


_debug = false;
// Static - Mortar
myArty = myArtyUnit;
// HE for  Mortar. Can be retreived via getArtilleryAmmo [myArty] command
artilleryRoundType = "8Rnd_82mm_Mo_shells"; 
// Side of units who call arty
reporterSide = east;

["artiTargeting", "onEachFrame", {

	if (isNil "reported") then {
		if (_debug) then { player sideChat "Ready for report"; };
		
		_units = [allUnits, {side _x == reporterSide}] call BIS_fnc_conditionalSelect;
		
		{
			if (_debug) then { player sideChat format ["Reporting -- %1", _x call BIS_fnc_enemyTargets]; };
			
			if !((_x call BIS_fnc_enemyTargets) isEqualTo []) then {
				if (_debug) then { player sideChat "Reported"; };
				
				_tgt = (_x call BIS_fnc_enemyTargets) call BIS_fnc_selectRandom;
				if (_debug) then {  player sideChat format ["Reported -- %1", _tgt]; };
				myArty setVariable ["tgtPos", (getPos _tgt), true];
			};
		} forEach _units;
		
		[] spawn { 
		
			sleep 5;
			if ( !isNil { myArty getVariable "tgtPos" } ) then {
				if (_debug) then {  player sideChat "Arty Working"; };
				_tgtPos = myArty getVariable "tgtPos";
				
				
				if ( _tgtPos inRangeOfArtillery [[myArty], artilleryRoundType] ) then {
					myArty commandArtilleryFire [_tgtPos, artilleryRoundType, round(random 3)];
				};
				
				myArty setVariable ["tgtPos",nil,true];
			};
			
			sleep 15;
			if (_debug) then {  player sideChat "Reported nil"; };
			reported = nil;
		};
		
		reported = true;
	};
	
}] call BIS_fnc_addStackedEventHandler;


