	/*
		[ unit, gearSetName ] spawn dzn_gearSetup;
		0:	OBJ		Unit for which gear will be set
		1:	ARRAY	Set of gear
		
		Function will change gear of chosen unit with chosen gear set.	
	*/
	private ["_unit","_kit","_category","_i"];
	
	_unit = _this select 0;
	_kit = _this select 1;
	
	// Clear Gear
	removeUniform _unit;
	removeVest _unit;
	removeBackpack _unit;
	removeHeadgear _unit;
	removeGoggles _unit;
	{
		_unit unassignItem _x;
		_unit removeItem _x;
	} forEach ["NVGoggles", "NVGoggles_OPFOR", "NVGoggles_INDEP", "ItemRadio", "ItemGPS", "ItemMap", "ItemCompass", "ItemWatch"];
	removeAllWeapons _unit;
	
	waitUntil { (items _unit) isEqualTo [] };
	
	// Adding gear
	#define cItem(INDEX)		(_category select INDEX)
	#define isItem(INDEX)		(typename cItem(INDEX) == "STRING")
	#define NotEmpty(INDEX)		(cItem(INDEX) != "")
	#define getRandom(INDEX)	(cItem(INDEX) call BIS_fnc_selectRandom)
	#define assignGear(IDX, ACT)	if isItem(IDX) then { if NotEmpty(IDX) then { _unit ACT cItem(IDX); }; } else { _unit ACT getRandom(IDX); };
	
	// Adding UVBHG
	_category = _kit select 0;
	assignGear(0, forceAddUniform)
	assignGear(1, addVest)
	assignGear(2, addBackpack)
	assignGear(3, addHeadgear)
	assignGear(4, addGoggles)

	// Add Primary, Secondary and Handgun Magazines
	_category = _kit select 5;
	for "_i" from 0 to 2 do {
		if !(cItem(_i) select 0 == "") then {_unit addMagazines cItem(_i);};
	};
	
	// Add Primary Weapon and accessories
	_category = _kit select 1;
	assignGear(0, addWeapon);
	for "_i" from 1 to count(_category) do {
		assignGear(_i, addPrimaryWeaponItem);
	};
	
	// Add Secondary Weapon
	_category = _kit select 2;
	assignGear(0, addWeapon);
	
	// Add Handgun and accessories
	_category = _kit select 3;
	assignGear(0, addWeapon);
	for "_i" from 1 to count(_category) do {
		assignGear(_i, addHandgunItem);
	};
	
	// Add items
	_category = _kit select 4;
	for "_i" from 0 to count(_category) do {
		assignGear(_i, addWeapon);
	};
	
	// Add Magazines and Grenades
	_category = _kit select 5;
	for "_i" from 3 to count(_category) do {
		if !(cItem(_i) select 0 == "") then {_unit addMagazines cItem(_i);};
	};
	
	// Add additional Items
	_category = _kit select 6;
	for "_i" from 0 to count(_category) do {
		if !(cItem(_i) select 0 == "") then {
			for "_j" from 0 to (cItem(_i) select 1) do {
				_unit addItem (cItem(_i) select 0);
			};
		};		
	};
