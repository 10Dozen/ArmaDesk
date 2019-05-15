/* ----------------------------------------------------------------------------
Function: CUP_fnc_handleFireButton

Description:
	Script to add cap decouple before missile launch
	
Parameters:
	_mode -- function execution mode <STRING>
	_arg -- arguments for execution in selected mode <ANY>
Returns:
	Function result <ANY>
	
Examples:
    (begin example)
		["RELOADED"] call CUP_fnc_handleFireButton;
    (end)
	
Author:
	10Dozen
---------------------------------------------------------------------------- */

params ["_mode", ["_arg",[]]];

private _result = false;

switch (toUpper _mode) do {
	case "CHECK_CONDITION": {
		private _weapon = secondaryWeapon player;
		private _muzzle  = str(currentMuzzle player) splitString '""' joinString '';
		
		_result = true 
			&& (_muzzle == _weapon) 
			&& (player ammo _weapon > 0)
			&& {
				[player, _weapon] call CBA_fnc_canUseWeapon			
				&& (configFile >> "CfgWeapons" >> _weapon >> "CUP_conatinerCapShotOnLaunch") call BIS_fnc_getCfgData > 0
			};
			
	};
	case "RELOADED": {
		// Add LMB handler once gun ready to use
		_arg params ["_unit", "_weapon", "_muzzle", "_newMagazine", "_oldMagazine"];
		
		hint "RELOADED";
		if (isPlayer _unit) then {
			CUP_PreventLauncherFireID = player addAction [
				"", {
					["FIRE", secondaryWeapon player] call CUP_fnc_handleFireButton;
				}, "", 0, false, true, "DefaultAction"
				, "[""CHECK_CONDITION""] call CUP_fnc_handleFireButton"
			];
		};
	};	
	case "REMOVE_HANDLER": {
		hint "HANDLER REMOVED";
		// Remove LMB handler after shot done
		if (!isNil "CUP_PreventLauncherFireID") then {
			player removeAction CUP_PreventLauncherFireID;
			CUP_PreventLauncherFireID = nil;			
		};
	};
	case "FIRE": {
		private _weapon = _arg;		
		hint "FIRED";
		
		["REMOVE_HANDLER"] call CUP_fnc_handleFireButton;
		private _h = ((ASLtoATL (eyePos player)) select 2) - 0.1;
		
		playSound3D ['a3\sounds_f\weapons\Other\dry9.wss', player];
		["FX_CAP", _h] call CUP_fnc_handleFireButton;
		["FX_SMOKE", _h] spawn CUP_fnc_handleFireButton;
		
		hint "POP";
		
		uiSleep 0.6;
	
		player forceWeaponFire [_weapon, "Single"];
		player forceWeaponFire [_weapon, _weapon];
	};
	case "FX_SMOKE": {
		// _arg -- height
		for "_i" from 1 to 20 do {
			drop [
				["\A3\data_f\ParticleEffects\Universal\Universal", 16, 7, 48],
				"",
				"Billboard",
				0, 
				0.5 + random 0.5,
				[0.25, 0.75, _arg],
				[-1 + random 2, -1 + random 2, 0],
				1,
				0.05,
				0.04,
				0, 
				[0.25, 0.25 + random 1],
				[
					[0,0,0,0.1],
					[0,0,0,0.3],
					[1,1,1,0.1],
					[1,1,1,0.03],
					[1,1,1,0.01],
					[1,1,1,0.003],
					[1,1,1,0.001],
					[1,1,1,0]
				],
				[1],
				0.1,
				0.1,
				"",
				"",
				player,
				random 360,
				true,
				0.1
			];
		};
	};
	case "FX_CAP": {
		// _arg -- height		
		private _capModel = (configFile >> "CfgWeapons" >> secondaryWeapon player >> "CUP_containerCapModel") call BIS_fnc_getCfgData;
		if (isNil "_capModel") then { _capModel = "\CUP\Weapons\CUP_Weapons_Ammunition\9M113_AT5\AT5_zaslepka.p3d"; };
		
		drop [
			[_capModel, 1, 0, 1]
			, ""
			, "SpaceObject"
			, 1
			, 10
			, [0.25, 0.75, 1.75]
			, [0, 5, 1.5]
			, 1
			, 20
			, 2
			, 0.075
			, [1, 1, 1]
			, [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]
			, [0.08]
			, 1
			, 0
			, ""
			, ""
			, player
			,0,true,0.1,[[0,0,0,0]]
		];
	};
};

(_result)
