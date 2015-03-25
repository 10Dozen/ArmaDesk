waitUntil { time > 0 };
hint "Started";

dzn_getEquipment = {
	// "uniform" / "vest" / "headgear" / "glasses" / "backpack" spawn dzn_getEquipment
	// OUT: null, dump name-classname to log
	
	_type = 0;
	_config = "cfgWeapons";
	hint "X";
	
	switch (_this) do {
		case "uniform":		{ _type = 801; };
		case "vest":		{ _type = 701; };
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
	// "primary" / "handgun" / "secondary" / "mags" spawn dzn_getWeapons
	_config = "cfgWeapons";
	
	_type = 0;
		
	switch ( _this ) do {
		case "primary":		{ _type =  1; };
		case "handgun":		{ _type = 2; };
		case "secondary":	{ _type = 4; };	
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
		// [ClassName, Type, TypeArray] call dzn_getAllLinkedAccessories
		// TYPE: "muzzle" / "optic" / "pointer"
		private ["_CName","_cfgItems","_linked"];
		
		_CName = _this select 0;
		_cfgItems = switch ( _this select 1 ) do {
			case "optics": {
				getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "CowsSlot" >> "compatibleItems")
			};
			case "muzzle": {
				getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "MuzzleSlot" >> "compatibleItems")
			};
			case "pointer": {
				getArray (configfile >> "CfgWeapons" >> _CName >> "WeaponSlotsInfo" >> "PointerSlot" >> "compatibleItems")
			};
		};
		
		_linked = _this select 2; // Array of all linked accessories of the chosen type
		{
			if !(_x in _linked) then {
				_linked = _linked + [_x];
				diag_log _x;
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
				_opticsList =  [_CName, "optics", _opticsList] call dzn_getAllLinkedAccessories;				
				_muzzleList =  [_CName, "muzzle", _muzzleList] call dzn_getAllLinkedAccessories;
				_pointerList =  [_CName, "pointer", _pointerList] call dzn_getAllLinkedAccessories;
			};
		};
	};
	if (_this in ["primary", "handgun"]) then {
		diag_log "ATTACHES:";
		{
			//[_classlist, _namelist]
			_allConfigAccessories = [];
			
			switch (_forEachIndex) do {
				case 0: { 
					_allConfigAccessories = "optics" call dzn_getAttachments;
					diag_log "OPTICS ITEMS";
				};
				case 1: { 
					_allConfigAccessories = "muzzle" call dzn_getAttachments;
					diag_log "MUZZLE ITEMS";
				};
				case 2: { 
					_allConfigAccessories = "pointer" call dzn_getAttachments;
					diag_log "POINTER ITEMS";
				};
			};
			
			_accClassnames = _allConfigAccessories select 0;
			_accDisplayName = _allConfigAccessories select 1;		
			
			_linkedItems = _x;
			{
				_itemClassname = _x;
				_itemDisplayName = "";
				//diag_log _itemClassname;
				
				_index = _accClassnames find _itemClassname;
				if (_index > -1) then {
					_itemDisplayName = _accDisplayName select _index;
					diag_log [_itemDisplayName, _itemClassname];
				};
			} forEach _linkedItems;
		} forEach [_opticsList, _muzzleList, _pointerList];
	};
};

dzn_getAttachments = {
	//"muzzle" / "optics" / "pointer" call dzn_getAttachments
	// OUT: Array of all attachement's [classname, DisplayName];
	private ["_config","_cfg","_classlist","_namelist","_item"];
	
	_config = "cfgWeapons";
	_cfg = switch (_this) do {
		case "muzzle": {
			("isclass _x && getnumber (_x >> 'scope') == 2 && getnumber (_x >> 'itemInfo' >> 'type') == 101") configclasses (configfile >> _config);			
		};
		case "optics": {			
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
		_namelist = _namelist + [getText(configFile >> _config >> configName(_item) >> "displayName")];		
	};
	hintSilent "Attachements dumped";
	

	
	[_classlist, _namelist]
};
