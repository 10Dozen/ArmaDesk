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

	dzn_getAllLinkedAccessories = {
		// [ClassName, Type] call dzn_getAllLinkedAccessories
		// TYPE: "muzzle" / "optic" / "pointer"
		private ["_CName","_cfgItems","_linked"];
		
		_CName = _this select 0;
		_cfgItems = switch ( _this select 1 ) do {
			case "muzzle": {
				getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "CowsSlot" >> "compatibleItems")
			};
			case "optic": {
				getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "MuzzleSlot" >> "compatibleItems")
			};
			case "pointer": {
				getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "PointerSlot" >> "compatibleItems")
			};
		};
		
		_linked = [];
		{
			if !(_x in _linked) then {
				_linked = _linked + [_x];
			};
		} forEach _cfgItems;
		
		_linked
	};
	
	for "_i" from 0 to (count _cfg)-1 do {
		_item = _cfg select _i;
		_CName = configName(_item);
		_DName = getText(configFile >> _config >> _CName >> "displayName");
		
		if !(_DName in _namelist) then {
			_namelist = _namelist + [_DName];
			hintSilent format ["Item:\n%1\n%2", _DName, _CName];
			diag_log [_DName, _CName];
			
			if (_this in ["primary", "handgun"]) then {
				_opticsList =  [_CName, "optics"] call dzn_getAllLinkedAccessories;
				_muzzleList =  [_CName, "muzzle"] call dzn_getAllLinkedAccessories;
				_pointerList =  [_CName, "pointer"] call dzn_getAllLinkedAccessories;
			};
		};
	};
	
	diag_log "ATTACHES:";
	{
		//[_classlist, _namelist]
		
		diag_log _x;
	} forEach _opticsList;
};

dzn_getAttachments = {
	//"muzzle" / "optic" / "pointer" spawn dzn_getWeapons
	// OUT: Array of all attachement's [classname, DisplayName];
	private ["_config","_cfg","_classlist","_namelist","_item"];
	
	_config = "cfgWeapons";
	_cfg = switch (_this) do {
		case "muzzle": {
			 ("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'itemInfo' >> 'type') == 101") configclasses (configfile >> _config);
		};
		case "optic": {
			("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'itemInfo' >> 'optics') == 1") configclasses (configfile >> _config);
		};
		case "pointer": {
			("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'itemInfo' >> 'type') == 301") configclasses (configfile >> _config);
		};
	};
	
	_classlist = [];
	_namelist = [];
	for "_i" from 0 to (count _cfg)-1 do {
		_item = _cfg select _i;
		_classlist = _classlist + [configName(_item)];
		_namelist = _namelist + [getText(configFile >> _config >> _CName >> "displayName")];
	};
	hintSilent "Attachements dumped";
	
	[_classlist, _namelist]
};
