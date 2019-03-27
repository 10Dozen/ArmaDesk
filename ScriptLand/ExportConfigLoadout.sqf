dzn_fnc_exportInventoryConfig = {
	/*
		Return formatted config data
		INPUT:
		0 (OBJECT)	- (optional) unit to grab data from (default: player)
		
		RETURN: String (loadout data) formtted to be used in config
	*/
	
	params [["_u",player]];
	
	private _fnc_arrayToStr = {
		str(_this) select [1, count str(_this) -2]
	};
	
	private _outputFormat = "uniform = ""%1"";
backpack = ""%2"";

weapons[] = {%3""Throw"",""Put""};
respawnWeapons[] = {%3""Throw"",""Put""};

magazines[] = {%4};
respawnMagazines[] = {%4};

items[] = {%5};

linkedItems[] = {%6};
respawnLinkedItems = {%6};";

	private _weapons = "";
	{
		if !(_x isEqualTo "") then { 
			_weapons = format ["%1""%2"",", _weapons, _x]; 
		};
	} forEach [primaryWeapon _u, secondaryWeapon _u, handgunWeapon _u];

	private _mags = [];
	{
		private _weaponMags = _x;
		if !(_weaponMags isEqualTo []) then { 
			{ _mags pushBack _x } forEach _weaponMags;
		};
	} forEach [
		primaryWeaponMagazine _u
		, handgunMagazine _u
	];
	_mags = _mags + magazines _u;
	
	private _items = items _u;
	private _linkedItems = [];
	{
		_linkedItems pushBack _x;
	} forEach ([vest _u, headgear _u, goggles _u] + (assignedItems player));
	
	format [
		_outputFormat
		, uniform _u
		, backpack _u
		, _weapons
		, _mags call _fnc_arrayToStr
		, _items call _fnc_arrayToStr
		, _linkedItems call _fnc_arrayToStr
	]
};

dzn_fnc_handleArsenalDisplay = {
	/*
		Adds Export Config button to Arsenal UI and handles copying of config data on click
	*/
	dzn_HandleArsenal = true;
	uinamespace setVariable ["dzn_ButtonControl", controlNull];
	
	while { uiSleep 0.1; dzn_HandleArsenal } do {
		waitUntil { !isNull ( uinamespace getvariable "RSCDisplayArsenal") };
		
		private _display = uinamespace getvariable "RSCDisplayArsenal";
		private _oldButton = (uinamespace getVariable "dzn_ButtonControl");
		private _ctrl = if (isNull _oldButton) then {
			_display ctrlCreate ["RscButton", -1]
		} else {
			_oldButton
		};
		
		_ctrl ctrlSetText  "EXPORT CONFIG";
		_ctrl ctrlSetPosition [0.375,1,0.25,0.05];
		_ctrl ctrlCommit 0;
		
		_ctrl ctrlAddEventHandler ["ButtonClick", {
			params ["_control"];
			
			copyToClipboard ([player] call dzn_fnc_exportInventoryConfig);
			
			_control ctrlSetText "COPYED";
			_control ctrlEnable false;
			_control ctrlCommit 0;
			
			[_control] spawn {
				params ["_control"];
				uiSleep 1.5;
				
				_control ctrlSetText  "EXPORT CONFIG";
				_control ctrlEnable true;
				_control ctrlCommit 0;
			};
		}];
		
		waitUntil { isNull ( uinamespace getvariable "RSCDisplayArsenal") };
	};
};


player addAction ["Arsenal", { ["Open",true] call BIS_fnc_arsenal; }];
[] spawn dzn_fnc_handleArsenalDisplay;
