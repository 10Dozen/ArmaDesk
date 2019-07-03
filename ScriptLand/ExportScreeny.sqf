enableSaving [false, false];
player addAction ["Arsenal", {["Open",true] call BIS_fnc_arsenal; }];

USE_GUI_INFO = false;
/*
	Author: Karel Moricky, modifications made by reyhard

	Description:


	Parameter(s):
		0: BOOL - decides if interface with settings should be opened
		1: NUMBER - duration in seconds for which an objects remains on the screen before its screen is captured (default: 1 s)
		2: NUMBER - fov modifier. Use values above 1 to capture larger weapons (default: 1.0)
		3: NUMBER - aperture modifier.  The closer the number is to 0, the more light will be let into the lens, meaning picture will be more bright (default: 45)
		4: ARRAY of NUMBERs - offset  (default: [0,0,0])
		5: ARRAY of STRINGs - list of CfgMods classes. Only objects belonging to these mods will be used (default: all mods)
		6: ARRAY of STRINGs - list of CfgPatches classes. Only objects belonging to these addons will be used (default: all addons)
		7: ARRAY of STRINGs - list of CfgWeapons/CfgMagazines classes. Only these objects will be used (default: all classes)
		8: ARRAY of NUMBERs - Pitch and Bank to rotate; Pitch is 0 when the object is level; 90 when pointing straight up; and -90 when pointing straight down. Bank is 0 when level; 90 when the object is rolled to the right, -90 when rolled to the left, and 180 when rolled upside 
		                      Defaults: 	[105,-165]
			               Recommended:
						Pointer (Top): 	[-70,155]
						Pointer (Cross):	[-70,15]
						Magazine: 		[-90,180]
		9: RGBA - (optional) color of background in RGBA format
				        	
	Returns:
	Nothing

	Example:
	[false,1.5,1,15,[0,0,0],[],[],["optic_Aco"], [-70,15]] spawn fnc_ExportImgs
*/
fnc_ExportImgs = {
params[
	["_menu",		false,		[false]	],
	["_delay",		2.5,		[0]		],
	["_fov",		1,			[0]		],
	["_aperture",	45,			[0]		],
	["_offset",		[0,0,0],	[[]]	],
	["_mods",		[],			[[]]	],
	["_patches",	[],			[[]]	],
	["_classes",	[],			[[]]	],
	["_pitchBank",	[], 			[[]]],
	["_bgColor",	[],			[[]]]
];

//--- Convert CfgMods classes to lower case for comparison
_mods = +_mods;
{
	_mods set [_foreachindex,tolower _x];
} foreach _mods;
_allMods = count _mods == 0;

//--- Convert CfgPatches classes to lower case for comparison
_patches = +_patches;
{
	_patches set [_foreachindex,tolower _x];
} foreach _patches;
_allPatches = count _patches == 0;

//--- Convert vehicle classes classes to lower case for comparison
_classes = +_classes;
{
	_classes set [_foreachindex,tolower _x];
} foreach _classes;
_allClasses = count _classes == 0;

//--- Get the list of affected objects
_cfgAll = configfile >> "cfgWeapons" >> "default";
_restrictedModels = [""];
_blacklist = [];

//--- Decide DLC folders
_dlcTable = [];
_fnc_getDlc = {
	_dlc = "";
	_addonList = configsourceaddonlist _this;
	if (count _addonList > 0) then {
		_dlcList = configsourcemodlist (configfile >> "cfgpatches" >> (_addonList select 0)); //--- Check mod of first object's addon to get the first occurance
		_dlc = "";
		if (count _dlcList > 0) then {
			_dlc = _dlcList select 0;
			{
				if (_dlc == (_x select 0)) exitwith {_dlc = _x select 1;};
			} foreach _dlcTable;
		};
	};
	_dlc
};


//--- Get the list of affected objects
_cfgWeapons = [];
_cfgMagazines = [];
if (_classes isEqualTo []) then {
 _cfgWeapons= "
	getnumber (_x >> 'scope') > 0
	&&
	{
		_class = configname _x;
		(_allMods || {(tolower _x) in _mods} count (configsourcemodlist _x) > 0)
		&&
		{
			(_allPatches || {(tolower _x) in _patches} count (configsourceaddonlist _x) > 0)
			&&
			{
				(_allClasses || {(tolower _class) in _classes})
				&&
				{
					!(gettext (_x >> 'model') in _restrictedModels)
					&&
					{
						inheritsfrom _x != _cfgAll
						&&
						{
							{_class iskindof [_x,configFile >> 'cfgWeapons']} count _blacklist == 0
						}
					}
				}
			}
		}
	}
" configclasses (configfile >> "cfgWeapons");
} else {
	{
		if (isClass (configFile >> "CfgWeapons" >> _x)) then {
			_cfgWeapons pushBack (configFile >> "CfgWeapons" >> _x);
		} else {
			if (isClass (configFile >> "CfgMagazines" >> _x)) then {
				_cfgMagazines pushBack (configFile >> "CfgMagazines" >> _x);
			};
		};	
	} forEach _classes;
};
_cfgWeaponsCount = count _cfgWeapons;
_cfgMagazinesCount = count _cfgMagazines;

if (_cfgWeaponsCount == 0 && _cfgMagazinesCount == 0) exitwith {["No classes found!"] call bis_fnc_error;};

private _pos = [1024,1024,250];
private _weaponHolder = "GroundWeaponHolder_Scripted" createVehicle _pos;
private _background = "Sphere_3DEN" createVehicle _pos;
private _cam = "camera" camcreate _pos;

_background setPosASL _pos;
if !(_bgColor isEqualTo []) then {
	private _tex = ["#(rgb,8,8,3)color(%1,%2,%3,%4)"] + _bgColor;
	_background setObjectTexture [0, format _tex];
	_background setObjectTexture [1, format _tex];
};

private _pos = [1024,1024,350];
_weaponHolder setPosASL _pos;
_weaponHolder setVectorDirAndUp [[0,0,1],[0,1,0]];


_cam cameraeffect ["internal","back"];
//_cam campreparetarget (_weaponHolder modeltoworld [0,0,0]);
_cam setposASL ((_pos vectoradd [-0.17,-19.5,0.5]) vectorDiff _offset);
_cam setdir 180;
_cam campreparetarget (_weaponHolder modeltoworld ([0.17,0,-0.5]) vectoradd _offset);
_cam campreparefocus [-1,-1];
_cam campreparefov (0.0315*_fov);
_cam camcommitprepared 0;
showcinemaborder false;

setaperture _aperture;

//--- Prepare the UI
_display = [] call bis_fnc_displayMission;
_ctrlInfoW = 0.5;
_ctrlInfoH = 0.2;
_ctrlInfo = _display ctrlcreate ["RscStructuredText",-1];
_ctrlInfo ctrlsetposition [
	safezoneX + 0.1,//safezoneX + safezoneW - _ctrlInfoW - 0.1,
	safezoneY + safezoneH - _ctrlInfoH,
	safezoneW - 0.2,//_ctrlInfoW,
	_ctrlInfoH
];
//_ctrlInfo ctrlsetbackgroundcolor [0,0,0,1];
//_ctrlInfo ctrlsetfontheight (_ctrlInfoH * 0.7);
_ctrlInfo ctrlcommit 0;

_ctrlProgressH = 0.01;
_ctrlProgress = _display ctrlcreate ["RscProgress",-1];
_ctrlProgress ctrlsetposition [
	safezoneX,
	safezoneY + safezoneH - _ctrlProgressH,
	safezoneW,
	_ctrlProgressH
];
_ctrlProgress ctrlcommit 0;

_screenTop = safezoneY;
_screenBottom = safezoneY + safezoneH;
_screenLeft = safezoneX;
_screenRight = safezoneX + safezoneW;

if (!USE_GUI_INFO) then {
	_ctrlInfo ctrlShow false;
	_ctrlProgress ctrlShow false;
};

_pitchBankReverse = [];

{
	//--- Restart date so every screenshot is taken in same light conditions
	setdate [2035,5,28,18,54];

	_class = configname _x;

	//--- Get filename
	_dlc = _x call _fnc_getDlc;
	if (_dlc != "") then {_dlc = _dlc + "\";};

	//--- Add weapon/item to container
	clearItemCargo _weaponHolder;
	clearWeaponCargo _weaponHolder;
	_weaponHolder setVectorDirAndUp [[0,0,1],[0,1,0]];
	
	private _type = getNumber (_x >> "type");
	switch(_type)do
	{
		// Weapons
		case 1;
		case 2;
		case 3;
		case 4: 
		{
			if (_dlc != "") then {_dlc = _dlc + "Weapons\";};
			
			[_weaponHolder, _class] call fnc_addWeaponWithMag;
			_weaponHolder setVectorDirAndUp [[0,0,1],[0,1,0]];
			
			// _weaponHolder addWeaponCargo [_class,1];
			if !(_pitchBank isEqualTo []) then {
				[_weaponHolder, _pitchBank # 0, _pitchBank # 1] call BIS_fnc_setPitchBank;
			};
			
			_cam setposASL ((_pos vectoradd [-0.17,-19.5,0.5]) vectorDiff _offset);
			_cam campreparetarget (_weaponHolder modeltoworld ([0.17,0,-0.5]) vectoradd _offset);			
			_cam campreparefov (0.0315*_fov);
		};
		
		// Items
		case 131072: 
		{
			_type = getNumber (_x >> "ItemInfo" >> "type");
			

			switch(_type)do
			{
				// Heagear
				case 605: 
				{
					if (_dlc != "") then {_dlc = _dlc + "Headgear\";};
					_weaponHolder addItemCargo [_class, 1];
					_weaponHolder setVectorDirAndUp [[0,-0.28,0.75],[sin(-30),cos(-30),0]];
					_cam campreparefov (0.0195*_fov);
					_cam setposASL ((_pos vectoradd [-0.17-2.6,-19.5,-2.75]) vectorDiff _offset);
					_cam campreparetarget (_weaponHolder modeltoworld ([0.17+2.0,1.15,-3.05]) vectoradd _offset);
				};
				// Vests
				case 701: 
				{
					if (_dlc != "") then {_dlc = _dlc + "Vest\";};
					_weaponHolder addItemCargo [_class, 1];
					_weaponHolder setVectorDirAndUp [[0,-0.28,0.75],[sin(-24),cos(-24),0]];
					_cam campreparefov (0.0335*_fov);
					_cam setposASL ((_pos vectoradd [-0.17-2.6,-19.5,-2.75]) vectorDiff _offset);
					_cam campreparetarget (_weaponHolder modeltoworld ([0.17+1.7,0.83,-3.15]) vectoradd _offset);
				};
				// Uniforms
				case 801: 
				{
					if (_dlc != "") then {_dlc = _dlc + "Uniform\";};

				};
				// Accessories
				case 101;
				case 201;
				case 302: {
					_weaponHolder addItemCargo [_class, 1];
					
					_pitchBankToUse = if (_pitchBank isEqualTo []) then { [105,-165] } else { _pitchBank };
					[_weaponHolder, _pitchBankToUse # 0, _pitchBankToUse # 1] call BIS_fnc_setPitchBank;
					
					_cam campreparefov (0.0315*_fov);
					_cam setposASL ((_pos vectoradd [-0.17,-19.5,0.5]) vectorDiff _offset);
					_cam campreparetarget (_weaponHolder modeltoworld ([0.17,0,-0.5]) vectoradd _offset);
				};
				// Accessories: Pointer
				case 301: {
					_weaponHolder addItemCargo [_class, 1];
					
					_pitchBankToUse = if (_pitchBank isEqualTo []) then { [-70,15] } else { _pitchBank };			
					[_weaponHolder, _pitchBankToUse # 0, _pitchBankToUse # 1] call BIS_fnc_setPitchBank;
					
					_cam campreparefov (0.0315*_fov);
					_cam setposASL ((_pos vectoradd [-0.17,-19.5,0.5]) vectorDiff _offset);
					_cam campreparetarget (_weaponHolder modeltoworld ([0.17,0,-0.5]) vectoradd _offset);
				};
			};
		};
		
		
	};
	//--- Prepare camera before shot
	_cam camcommitprepared 0;
	sleep (0.05 + _delay);

	//--- Final filename
	_fileName = format ["WeaponPictures\%2%1_ca.png",_class,_dlc];

	//--- Update UI
	_ctrlInfo ctrlsetstructuredtext parsetext format ["Saving screenshot to<br /><t font='EtelkaMonospaceProBold' size='0.875'>[Arma 3 Profile]\Screenshots\%1</t><br />Note: The text overlay will not be saved. <br />Estimated time left: %2 seconds",_fileName,((_cfgWeaponsCount-_foreachindex))*_delay];
	_ctrlProgress progresssetposition (_foreachindex / _cfgWeaponsCount);

	//--- Take screenshot
	screenshot _fileName;
	sleep 0.05;
}foreach _cfgWeapons;


{
	//--- Restart date so every screenshot is taken in same light conditions
	setdate [2035,5,28,18,54];
	_class = configname _x;

	//--- Add weapon/item to container
	clearItemCargo _weaponHolder;
	clearWeaponCargo _weaponHolder;
	clearMagazineCargo _weaponHolder;
	_weaponHolder setVectorDirAndUp [[0,0,1],[0,1,0]];
	
	_weaponHolder addMagazineCargo [_class,1];
	
	_pitchBankToUse = if (_pitchBank isEqualTo []) then { [-90,180] } else { _pitchBank };
	[_weaponHolder, _pitchBankToUse # 0, _pitchBankToUse # 1] call BIS_fnc_setPitchBank;
	
	_cam setposASL ((_pos vectoradd [-0.17,-19.5,0.5]) vectorDiff _offset);
	_cam campreparetarget (_weaponHolder modeltoworld ([0.17,0,-0.5]) vectoradd _offset);			
	_cam campreparefov (0.0315*_fov);
	
	//--- Prepare camera before shot
	_cam camcommitprepared 0;
	sleep (0.05 + _delay);

	//--- Final filename
	_fileName = format ["MagazinePictures\%1_ca.png",_class];

	//--- Update UI
	_ctrlInfo ctrlsetstructuredtext parsetext format ["Saving screenshot to<br /><t font='EtelkaMonospaceProBold' size='0.875'>[Arma 3 Profile]\Screenshots\%1</t><br />Note: The text overlay will not be saved. <br />Estimated time left: %2 seconds",_fileName,((_cfgMagazinesCount-_foreachindex))*_delay];
	_ctrlProgress progresssetposition (_foreachindex / _cfgMagazinesCount);

	//--- Take screenshot
	screenshot _fileName;
	sleep 0.05;
} forEach _cfgMagazines;

_cam cameraeffect ["terminate","back"];
camdestroy _cam;
deleteVehicle _weaponHolder;
deleteVehicle _background;
ctrldelete _ctrlInfo;
ctrldelete _ctrlProgress;
setaperture -1;

if (is3DEN) then {
	get3dencamera cameraeffect ["internal","back"];
	["showinterface",true] call bis_fnc_3DENInterface;
};
};


fnc_addWeaponWithMag = {
	params ["_container", "_class"];

	private "_u";
	
	private _cPos = getPosATL _container;
	
	private _pos = [_cPos # 0, _cPos # 1, 0];
	_container setPosATL _pos;
	
	ContainerLoaded = false;

	if (isNil { player getVariable "ContainerLoader" }) then {
		_u = (createGroup civilian) createUnit ["C_man_1",position _container,[],0,"CAN_COLLIDE"];
		[_u, true] remoteExec ["hideObjectGlobal", 2];
		_u hideObject true;
		_u disableCollisionWith player;
		_u allowDamage false;
		_u disableAI "ANIM";
		_u switchMove "amovppnemstpsnonwnondnon";
		_u disableAI "ALL";
		_u addBackpack "B_Carryall_khk";
		_u addEventHandler ["Put", { (_this select 0) setPos [0,0,0]; ContainerLoaded = true;}];
		player setVariable ["ContainerLoader", _u];
	} else {
		_u = player getVariable "ContainerLoader";
		_u setPos _pos;
	};
	
	[_u, _class, 1] call BIS_fnc_addWeapon;
	_u action ["DropWeapon",_container,_class];
	
	waitUntil { ContainerLoaded };
	_container setPosATL _cPos;
};

