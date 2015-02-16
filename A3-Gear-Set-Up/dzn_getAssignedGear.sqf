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
						"_item%1 = [_item, _count];",
						count _duplicates
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
		
		// primaryWeaponMagazine _unit
		// secondaryWeaponMagazine _unit
		// handgunMagazine _unit
		
		
		
		
		
		
		
		kitName = [
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
			assignedItems _unit,
			/*["ItemNVG","ItemRadio","ItemGPS","ItemMap","ItemWatch","ItemCompass"],*/
			/* Magazines */
			/*[
				["PrimaryWeaponMagazineClassname", 10],
				["SecondaryWeaponMagazineClassname", 10],
				["HandguyWeaponMagazineClassname", 10],
				["Magazine1Classname", 10],
				["Magazine2Classname", 10],
				["Magazine3Classname", 10],
				["Magazine4Classname", 10],
				["Magazine5Classname", 10],
				["Magazine6Classname", 10]
			],*/
			
			
			
			/* Items */
			/*[
				["Item1Classname", 10],
				["Item2Classname", 10],
				["Item3Classname", 10],
				["Item4Classname", 10],
				["Item5Classname", 10],
				["Item6Classname", 10]
			],*/
			items _unit,
			
			/* Person and Insignia */
			/*["Insignia","Face","Voice"]*/
		];
		
		// Copying to clipboard
		copyToClipboard text;
		
		// Hint here or title
		hint "Gear copied to clipboard";
	}
];
