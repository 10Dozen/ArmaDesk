// Copy to clipboard set of unit's gear in format according to
// https://github.com/10Dozen/ArmaDesk/blob/master/A3-Gear-Set-Up/Kit%20Examples.sqf

player addAction ["<t color='#8AD2FF'>Copy Current Gear to Clipboard</t>",
	{
		_unit = _this select 1;
		_output = [];
		
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
			[
				["PrimaryWeaponMagazineClassname", 10],
				["SecondaryWeaponMagazineClassname", 10],
				["HandguyWeaponMagazineClassname", 10],
				["Magazine1Classname", 10],
				["Magazine2Classname", 10],
				["Magazine3Classname", 10],
				["Magazine4Classname", 10],
				["Magazine5Classname", 10],
				["Magazine6Classname", 10]
			],
			/* Items */
			[
				["Item1Classname", 10],
				["Item2Classname", 10],
				["Item3Classname", 10],
				["Item4Classname", 10],
				["Item5Classname", 10],
				["Item6Classname", 10]
			],
			/* Person and Insignia */
			/*["Insignia","Face","Voice"]*/
		];
		
		
		
	}
];
