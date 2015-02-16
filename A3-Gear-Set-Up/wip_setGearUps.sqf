// [ _unit, _gearSetName ] spawn dzn_gearSetup; 

dzn_gearSetup = {
	/*
		[ unit, gearSetName ] spawn dzn_gearSetup;
		0:	OBJ		Unit for which gear will be set
		1:	STRING	Name of gearSet from the list
		
		Function will change gear of chosen unit with chosen gear set.	
	*/
	private ["_unit","_gearSetName","_gearSet","_gearCat","_primaryMagazines"];
	
	_unit = _this select 0;
	_gearSetName = _this select 1;
	
	_gearSet = [];
	{
		if ( _x select 0 == _gearSetName) exitWith { _gearSet = _x; };
	} forEach dzn_gearString;
	
	if (_gearSet isEqualTo []) exitWith { hint format ['No gearset with name: "%1"', _gearSetName]; };
	
	
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
	// Adding UVBHG
	_gearCat = _gearSet select 1;
	if !(_gearCat select 0 == 'no') then { _unit forceAddUniform (_gearCat select 0); };
	if !(_gearCat select 1 == 'no') then { _unit addVest (_gearCat select 1); };
	if !(_gearCat select 2 == 'no') then { _unit addBackpack (_gearCat select 2); };
	if !(_gearCat select 3 == 'no') then { _unit addHeadgear (_gearCat select 3); };
	if !(_gearCat select 3 == 'no') then { _unit addGoggles (_gearCat select 4); };
	
	// Add Primary, Secondary and Handgun Magazines
	_gearCat = _gearSet select 6;
	_primaryMagazines = [ (_gearCat select 0), (_gearCat select 1), (_gearCat select 2) ];
	{
		if !(_x select 0 == 'no') then { _unit addMagazines _x; };
	} forEach _primaryMagazines;

	// Add Primary Weapon and accessories
	_gearCat = _gearSet select 2;
	if !(_gearCat select 0 == 'no') then { 
		_unit addWeapon (_gearCat select 0);
		{
			if !(_x == 'no') then { _unit addPrimaryWeaponItem _x; };
		} forEach (_gearCat select 1);
	};
	
	// Add Secondary Weapon
	_gearCat = _gearSet select 3;
	if !(_gearCat select 0 == 'no') then { _unit addWeapon (_gearCat select 0); };
	
	// Add Handgun and accessories
	_gearCat = _gearSet select 4;
	if !(_gearCat select 0 == 'no') then { 
		_unit addWeapon (_gearCat select 0); 
		{
			if !(_x == 'no') then { _unit addHandgunItem _x; };
		} forEach (_gearCat select 1);
	};
	
	// Add items
	_gearCat = _gearSet select 5;
	{
		if !(_x == 'no') then {
			_unit addItem _x;
			_unit assignItem _x;
		};
	} forEach _gearCat;
	
	// Add Magazines and Grenades
	_gearCat = _gearSet select 6;
	{
		if !(_x select 0 == 'no') then { _unit addMagazines _x; };
	} forEach (_gearCat - _primaryMagazines);
	
	// Add additional Items
	_gearCat = _gearSet select 7;
	{
		if !(_x select 0 == 'no') then { 
			for "_i" from 0 to (_x select 1) do {
				_unit addItem (_x select 0); 
			};
		};
	} forEach _gearCat;
	
	sleep .1;
	_unit switchMove '';
};
