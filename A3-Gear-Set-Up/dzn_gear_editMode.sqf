	// FUNCTIONS
	
	dzn_gear_editMode_getGear = {
		private[
			"_unit","_item1","_item2","_item3","_item4","_item5","_item6","_items",
			"_pwMags","_swMags","_hgMags","_mag1","_mag2","_mag3","_mag4","_mag5","_mag6",
			"_mags","_magSlot","_pwMag","_swMag","_hgMag",
			"_duplicates","_item","_count","_outputKit"
		];
			
		_unit = _this;
		
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
		#define hasHandgunThen(HW)		if (handgunWeapon _unit != "") then {HW} else {""}
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
				hasHandgunThen(handgunWeapon _unit),
				hasHandgunThen((handgunItems _unit) select 2),
				hasHandgunThen((handgunItems _unit) select 0),
				hasHandgunThen((handgunItems _unit) select 1)
			],
			/* Personal Items */
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
		
		
		_outputKit
	};
	
	dzn_gear_editMode_copyToClipboard = {
		private ["_colorString"];
		
		// Copying to clipboard
		copyToClipboard ("_kitName = " + str(_this) + ";");
	
		// Hint here or title
		#define COLORS ["F","C","B","3","6","9"]
		_colorString = format [
			"#%1%2%3%4%5%6", 
			COLORS call BIS_fnc_selectRandom,COLORS call BIS_fnc_selectRandom,COLORS call BIS_fnc_selectRandom,
			COLORS call BIS_fnc_selectRandom,COLORS call BIS_fnc_selectRandom,COLORS call BIS_fnc_selectRandom
		];
		
		hintSilent parseText format[      
			"<t size='1.25' color='%1'>Gear has been copied to clipboard</t>",     
			_colorString
		];
		
		_colorString
	};
	
	dzn_gear_editMode_createKit = {
		private ["_outputKit","_colorString"];
		_outputKit = _this call dzn_gear_editMode_getGear;		
		_colorString = _outputKit call dzn_gear_editMode_copyToClipboard;
		
		player addAction [
			format [
				"<t color='%1'>Kit with %2 %3</t>",
				_colorString,
				round(time),
				_outputKit select 1 select 0
			],
			{
				[(_this select 1), _this select 3 ] call dzn_gear_assignGear;
				(_this select 3) call dzn_gear_editMode_copyToClipboard;
			},
			_outputKit
		];		
	};
	
	// ACTIONS
	
	// Add virtual arsenal action
	player addAction [
		"<t color='#00B2EE'>Open Virtual Arsenal</t>",
		{['Open',true] spawn BIS_fnc_arsenal;}
	];
  
	// Copy to clipboard set of unit's gear in format according to
	// https://github.com/10Dozen/ArmaDesk/blob/master/A3-Gear-Set-Up/Kit%20Examples.sqf
	player addAction ["<t color='#8AD2FF'>Copy Current Gear to Clipboard</t>",
		{(_this select 1) call dzn_gear_editMode_createKit;}
	];
