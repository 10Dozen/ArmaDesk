// Init of dzn_gear
private["_editMode"];

// EDIT MODE
_editMode = _this select 0;

if (_editMode) then {
	// Add virtual arsenal action
	player addAction [
		"<t color='#00B2EE'>Open Virtual Arsenal</t>",
		{['Open',true] spawn BIS_fnc_arsenal;}
	];
  
	// Copy to clipboard set of unit's gear in format according to
	// https://github.com/10Dozen/ArmaDesk/blob/master/A3-Gear-Set-Up/Kit%20Examples.sqf
	player addAction ["<t color='#8AD2FF'>Copy Current Gear to Clipboard</t>",
		{
			private[
				"_unit","_item1","_item2","_item3","_item4","_item5","_item6","_items",
				"_pwMags","_swMags","_hgMags","_mag1","_mag2","_mag3","_mag4","_mag5","_mag6",
				"_mags","_magSlot","_pwMag","_swMag","_hgMag",
				"_duplicates","_item","_count","_outputKit"
			];
			
			_unit = _this select 1;
			
			// Нужно получить все айтемы и собрать их в стеки
			_item1 = ["", 0];
			_item2 = ["", 0];
			_item3 = ["", 0];
			_item4 = ["", 0];
			_item5 = ["", 0];
			_item6 = ["", 0];
			
			_items = items _unit;
			_duplicates = [];
			{
				if !(_x in _duplicates) then {
					_item = _x;
					_count = 0;
		
					_duplicates = _duplicates + [_item];
					{
						if (_x == _item) then {
							_count = _count + 1;
						};
					} forEach _items;
					
					if !(count _duplicates > 6) then {
						call compile format [
							"_item%1 = ['%2', %3];",
							count _duplicates,
							_item,
							_count
						];
					} else {
						hint "Maximum of 6 item slots were exceeded";
					};	
				};
			} forEach _items;
		
			// Нужно получить все магазины и собрать их в стеки
			_pwMags = ["", 0];
			_swMags = ["", 0];
			_hgMags = ["", 0];
			_mag1 = ["", 0];
			_mag2 = ["", 0];
			_mag3 = ["", 0];
			_mag4 = ["", 0];
			_mag5 = ["", 0];
			_mag6 = ["", 0];
			
			_mags = magazines _unit;
			_duplicates = [];
			
			_pwMag = if (count (primaryWeaponMagazine _unit) > 0) then {primaryWeaponMagazine _unit  select 0} else { "" };
			_swMag = if (count (secondaryWeaponMagazine _unit) > 0) then {secondaryWeaponMagazine _unit  select 0} else { "" };
			_hgMag = if (count (handgunMagazine _unit) > 0) then {handgunMagazine _unit  select 0} else { "" };
			_magSlot = 1;

			{
				if !(_x in _duplicates) then {
					_item = _x;
					_count = 0;				
					_duplicates = _duplicates + [_item];
					{	
						if (_x == _item) then {
							_count = _count + 1;
						};
					} forEach _mags;
					
					switch (_item) do {
						case _pwMag: {
							_pwMags = [_item, _count + 1];
						};
						case _swMag: {
							_swMags = [_item, _count + 1];
						};
						case _hgMag: {
							_hgMags = [_item, _count + 1];
						};
						default {
							call compile format [
								"_mag%1 = ['%2', %3];",
								_magSlot,
								_item,
								_count
							];
							_magSlot = _magSlot + 1;
						};
					};
				};
			} forEach _mags;
			
			#define hasPrimaryThen(PW)		if (primaryWeapon _unit != "") then {PW} else {""}
			#define hasSecondaryThen(SW)	if (secondaryWeapon _unit != "") then {SW} else {""}
			#define hasSHandgunThen(HW)		if (handgunWeapon _unit != "") then {HW} else {""}
			_outputKit = [
				/* Equipment */
				[
					uniform _unit,
					vest _unit,
					backpack _unit,
					headgear _unit,
					goggles _unit
				],
				/* Primary Weapon */
				[
					hasPrimaryThen(primaryWeapon _unit),
					hasPrimaryThen((primaryWeaponItems _unit) select 2),
					hasPrimaryThen((primaryWeaponItems _unit) select 0),
					hasPrimaryThen((primaryWeaponItems _unit) select 1)					
				],
				/* Secondary Weapon */
				[
					hasSecondaryThen(secondaryWeapon _unit)
				],
				/* Handgun Weapon */
				[
					hasSHandgunThen(handgunWeapon _unit),
					hasSHandgunThen((handgunItems _unit) select 2),
					hasSHandgunThen((handgunItems _unit) select 0),
					hasSHandgunThen((handgunItems _unit) select 1)
				],
				/* Personal Items */
				/*["ItemNVG","ItemRadio","ItemGPS","ItemMap","ItemWatch","ItemCompass"],*/
				assignedItems _unit,
				
				/* Magazines */
				[
					_pwMags,
					_swMags,
					_hgMags,
					_mag1,
					_mag2,
					_mag3,
					_mag4,
					_mag5,
					_mag6
				],
				
				/* Items */
				[
					_item1,
					_item2,
					_item3,
					_item4,
					_item5,
					_item6
				],
				
				/* Person and Insignia */
				/*["Insignia","Face","Voice"]*/
				[]
			];
			
			// Copying to clipboard
			copyToClipboard ("_kitName = " + str(_outputKit) + ";");
			
			// Hint here or title
			#define COLORS ["F","C","B","3","6","9"]
			hintSilent parseText format[      
				"<t size='1.25' color='#%1%2%3%4%5%6'>Gear has been copied to clipboard</t>",     
				COLORS call BIS_fnc_selectRandom,COLORS call BIS_fnc_selectRandom,
				COLORS call BIS_fnc_selectRandom,COLORS call BIS_fnc_selectRandom,
				COLORS call BIS_fnc_selectRandom,COLORS call BIS_fnc_selectRandom
			];  		
		}
	];
};

waitUntil { 1 > 0 };
if !(isServer) exitWith {};

// FUNCTIONS
waitUntil { !isNil "BIS_fnc_selectRandom" };
// Assign kit from given
// [ UNIT, KIT or ARRAY OF KITS ] spawn dzn_gear_assignKit
dzn_gear_assignKit = {
	private ["_kit","_randomKit"];
	(_this select 0) setVariable ["dzn_gear_assigned", _this select 1];
	
	_kit = [];
	if (!isNil {call compile (_this select 1)}) then {
		
		_kit = call compile (_this select 1);
		
		if (typename (_kit select 0) != "ARRAY") then {
			_randomKit =  (_kit call BIS_fnc_selectRandom);
			(_this select 0) setVariable ["dzn_gear_assigned", _randomKit];
			_kit = call compile _randomKit;
		};		
		
		[_this select 0, _kit] call dzn_gear_assignGear;
	} else {
		diag_log format ["There is no kit with name %1", (_this select 1)];
		player sideChat format ["There is no kit with name %1", (_this select 1)];
	};
};

// Assign gear from given kit
// [ UNIT, GEAR_ARRAY ] spawn dzn_gear_assignKit
dzn_gear_assignGear = {
	// Here is function assigning gear to unit	
	#include "dzn_gear_assignGear.sqf";
};


// GEARS
#include "dzn_gear_kits.sqf"

// INITIALIZATION
waitUntil { time > 0 };
private ["_logics", "_kitName", "_synUnits","_units","_crew"];

// Logics
_logics = entities "Logic";
if !(_logics isEqualTo []) then {	
	{
		
		if (["dzn_gear_", str(_x), false] call BIS_fnc_inString || !isNil {_x getVariable "dzn_gear"}) then {
			_kitName = if (!isNil {_x getVariable "dzn_gear"}) then {
				_x getVariable "dzn_gear"
			} else {
				str(_x) select [9]
			};
			
			_synUnits = synchronizedObjects _x;
			{
				if (_x  isKindOf "CAManBase") then {
					[_x, _kitName] spawn dzn_gear_assignKit;
				} else {
					private ["_crew"];
					_crew = crew _x;
					if !(_crew isEqualTo []) then {
						{
							[_x, _kitName] spawn dzn_gear_assignKit;
							sleep 0.1;
						} forEach _crew;
					};
				};
				sleep 0.2;
			} forEach _synUnits;
			deleteVehicle _x;
		};
	} forEach _logics;
};

// Units
_units = allUnits;
{
	if (!isNil {_x getVariable "dzn_gear"}) then {
		_kitName = _x getVariable "dzn_gear";
		if (_x isKindOf "CAManBase" && isNil {_x getVariable "dzn_gear_done"}) then {
			[_x, _kitName] spawn dzn_gear_assignKit;
		} else {
			_crew = crew _x;
			if !(_crew isEqualTo []) then {
				{
					if (isNil {_x getVariable "dzn_gear_done"}) then {
						[_x, _kitName] spawn dzn_gear_assignKit;
					};
					sleep 0.1;
				} forEach _crew;
			};
		};
	};
	sleep 0.2;
} forEach _units;
