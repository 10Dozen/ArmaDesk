// Copy to clipboard set of unit's gear in format according to
// https://github.com/10Dozen/ArmaDesk/blob/master/A3-Gear-Set-Up/Kit%20Examples.sqf

player addAction ["<t color='#8AD2FF'>Copy Current Gear to Clipboard</t>",
	{
		_unit = _this select 1;
		
		// Нужно получить все айтемы и собрать их в стеки
		_item1 = ['no', 0];
		_item2 = ['no', 0];
		_item3 = ['no', 0];
		_item4 = ['no', 0];
		_item5 = ['no', 0];
		_item6 = ['no', 0];
		
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
						"_item%1 = [%2, %3];",
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
		_pwMags = ["no", 0];
		_swMags = ["no", 0];
		_hgMags = ["no", 0];
		_mag1 = ["no", 0];
		_mag2 = ["no", 0];
		_mag3 = ["no", 0];
		_mag4 = ["no", 0];
		_mag5 = ["no", 0];
		_mag6 = ["no", 0];
		
		_mags = magazines _unit;
		_duplicates = [];
		
		_pwMag = primaryWeaponMagazine _unit;
		_swMag = secondaryWeaponMagazine _unit;
		_hgMag = handgunMagazine _unit
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
				} forEach _items;
				
				switch (_item) do {
					case _pwMag: {
						_pwMags = [_item, _count];
					};
					case _swMag: {
						_swMags = [_item, _count];
					};
					case _hgMag: {
						_hgMags = [_item, _count];
					};
					case default: {
						call compile format [
							"_mag%1 = [%2, %3];",
							_magSlot,
							_item,
							_count
						];
						_magSlot = _magSlot + 1;
					};
				};
			};
		} forEach _mags;
		
		outputKit = [
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
				primaryWeapon _unit,
				(primaryWeaponItems _unit) select 2,
				(primaryWeaponItems _unit) select 0,
				(primaryWeaponItems _unit) select 1
			],
			/* Secondary Weapon */
			[
				secondaryWeapon _unit
			],
			/* Handgun Weapon */
			[
				handgunWeapon _unit,
				(handgunItems _unit) select 2,
				(handgunItems _unit) select 0,
				(handgunItems _unit) select 1
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
		copyToClipboard text;
		
		// Hint here or title
		hint "Gear copied to clipboard";
	}
];
