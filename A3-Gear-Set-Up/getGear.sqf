waitUntil { time > 0 };
hint "Started";

dzn_getEquipment = {
	// "uniform" / "vest" / "headgear" / "glasses" / "backpack" spawn dzn_getWeapons
	// OUT: null, dump name-classname to log
	
	_type = 0;
	_config = "cfgWeapons";
	hint "X";
	
	switch (_this) do {
		case "uniform"		{ _type = 801; };
		case "vest"		{ _type = 701; };
		case "headgear":	{ _type = 605; };
		case "glasses":		{ _config = "cfgGlasses"; };
		case "backpack":	{ _config = "cfgVehicles"; };
	};
	
	_cfg = switch (_config) do {
		case "cfgWeapons": {
			("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'itemInfo' >> 'type') == _type") configclasses (configfile >> _config);
		};
		case "cfgGlasses": {
			("isclass _x && getnumber (_x >> 'scope') == 2") configclasses (configfile >> _config);
		};
		case "cfgVehicles": {
			("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'isBackpack') == 1") configclasses (configfile >> "cfgvehicles");
		};	
	};
	
	for "_i" from 0 to (count _cfg)-1 do {
		_item = _cfg select _i;
		_CName = configName(_item);
		_DName = getText(configFile >> _config >> _CName >> "displayName");
		hintSilent format ["Item:\n%1\n%2", _DName, _CName];
		diag_log [_DName, _CName];	
	};
};

dzn_getWeapons = {
	// "primary" / "handgun" / "launcher" / "mags" spawn dzn_getWeapons
	_config = "cfgWeapons";
	
	_type = 0;
		
	switch ( _this ) do {
		case "primary":		{ _type =  1; };
		case "handgun":		{ _type = 2; };
		case "launcher":	{ _type = 4; };	
		case "mags":		{ _config = "cfgMagazines"; };
	};

	_cfg = switch ( _config ) do {
		case "cfgWeapons": {	
			("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'type') == _type") configclasses (configfile >> _config)
		};
		case "cfgMagazines": {
			("isclass _x && getnumber (_x >> 'scope') == 2 && getText (_x >> 'picture') != ''") configclasses (configfile >> _config)
		};
	};
	
	_namelist = [];
	_opticsList = [];
	_muzzleList = [];
	_pointerList = [];


	
	
	for "_i" from 0 to (count _cfg)-1 do {
		_item = _cfg select _i;
		_CName = configName(_item);
		_DName = getText(configFile >> _config >> _CName >> "displayName");
		
		if !(_DName in _namelist) then {
			_namelist = _namelist + [_DName];
			hintSilent format ["Item:\n%1\n%2", _DName, _CName];
			diag_log [_DName, _CName];
			
			if (_this in ["primary", "handgun"]) then {
				
				_optics = getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "CowsSlot" >> "compatibleItems");
				{
					if !( _x in _opticsList) then { _opticsList = _opticsList  + [_x]; };
				} forEach _optics;
				
				_muzzle = getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "MuzzleSlot" >> "compatibleItems");
				_pointer = getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "PointerSlot" >> "compatibleItems");
			};
		};
	};

	diag_log "OPTICS ATTACHES";
	{
		diag_log _x;
	} forEach _opticsList;
};

dzn_getAttachments = {
	//"muzzle" / "optic" / "launcher" / "mags" spawn dzn_getWeapons
	_opticsAll = ("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'itemInfo' >> 'optics') == 1") configclasses (configfile >> "cfgWeapons");
	_muzzleAll = ("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'itemInfo' >> 'type') == 101") configclasses (configfile >> "cfgWeapons");
	_pointerAll = ("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'itemInfo' >> 'type') == 301") configclasses (configfile >> "cfgWeapons");
	
	
};
