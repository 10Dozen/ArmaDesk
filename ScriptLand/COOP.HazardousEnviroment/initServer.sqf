// Будет запущено только на сервере
if (!isNil "dzn_srv_missionStarted") exitWith {};
dzn_srv_missionStarted = true;
waitUntil { !isNil "dzn_c_delayTime" };
waitUntil { !isNil "dzn_c_desactivationTimeLimit"};
waitUntil { !isNil "dzn_c_gpsPlacingTimeLimit"};
waitUntil { !isNil "dzn_c_playerLostLimit"};

// Пусковая установка
dzn_task_launchPodDestroyed = false;

// Отмена деактивации врагами
dzn_task_deactivationCancelled = false;
dzn_task_gpsPlacingCancelled = false;

// Деактивация
dzn_bioweaponItem setVariable ["dzn_isDeactivating", false, true];
dzn_task_deactivated = false;

// Максимум времени который нужно чтобы деактивировать образец
dzn_task_deactivationLimit = dzn_c_desactivationTimeLimit;
dzn_task_deactivationTime = str(dzn_task_deactivationLimit * 60);

//GPS Маркер
dzn_bioweaponItem setVariable ["dzn_placingGPS", false, true];
dzn_task_gpsPlaced = false;
dzn_task_gpsPlacingTime = str(dzn_c_gpsPlacingTimeLimit * 60);

// Живость специалистов
dzn_task_specialistsCount = -1;
dzn_task_specialistsDeadCount = 0;
dzn_task_players = [];
dzn_totalPlayersCount = 0;

// Деактивация не удалась, ставим ГПС передатчик
dzn_task_addDestroyObjectTask = false;

dzn_task_destroyed = false;
dzn_task_extracted = false;

// Убегание после бомбежки
dzn_task_ranaway = false;

//Публикуем переменные
publicVariable "dzn_task_deactivated";
publicVariable "dzn_task_deactivationCancelled";
publicVariable "dzn_task_deactivationTime";
publicVariable "dzn_task_deactivationLimit";
publicVariable "dzn_task_specialistsCount";
publicVariable "dzn_task_specialistsDeadCount";
publicVariable "dzn_task_specialistsAreDead";
publicVariable "dzn_task_addDestroyObjectTask";
publicVariable "dzn_task_gpsPlaced";
publicVariable "dzn_task_gpsPlacingCancelled";
publicVariable "dzn_task_players";
publicVariable "dzn_totalPlayersCount";

[] spawn {
	// Создаем локации зон смерти после выброса
	waitUntil { time > dzn_c_delayTime + floor(random 5) };
	private ["_pos", "_dir", "_a", "_b"];
	_pos = [3605,3642,0];
	_dir = -139.84;
	_a = 1200;
	_b = 800;
	
	dzn_impactDeathZone = createLocation ["NameVillage", _pos, _a / 3, _b / 3];
	dzn_impactZone = createLocation ["NameVillage", _pos, _a, _b];
	
	dzn_impactDeathZone setDirection _dir;
	dzn_impactZone setDirection _dir;
	
	publicVariable "dzn_impactDeathZone";
	publicVariable "dzn_impactZone";
};

[] spawn {
	// Проверяем условия для завершения миски
	waitUntil { time > dzn_c_delayTime + floor(random 5) };
	dzn_cond_launchPod = 0;
	dzn_cond_deactivate = 0;
	dzn_cond_gps = 0;
	dzn_cond_escape = 0;

	waitUntil { dzn_task_deactivated || dzn_task_gpsPlaced };
	if ( dzn_task_deactivated  ) then {
		dzn_cond_deactivate = 1;
		
		// ПУ уничтожена
		waitUntil { dzn_task_launchPodDestroyed };
		dzn_cond_launchPod = 1;
		
		sleep 5;
		// Радио сообщение
		dzn_msg_missionWin = true; publicVariable "dzn_msg_missionWin";
		
		sleep 15;
		dzn_missionResult = "Win1";
	} else {
		dzn_cond_gps = 1;
		// Рактеы пошли
		waitUntil { dzn_task_destroyed };
		// Ракеты пришли и пацаны должны были убижать
		waitUntil { dzn_task_extracted };
		sleep 5;
		waitUntil { dzn_task_ranaway };
		if (dzn_cond_escape > 0) then {
			sleep 5;
			// Радио сообщение
			dzn_msg_missionWin2 = true; publicVariable "dzn_msg_missionWin2";
			
			sleep 15;
			dzn_missionResult = "Win2";
		} else {
			sleep 5;
			// Радио сообщение
			dzn_msg_missionFailed = true; publicVariable "dzn_msg_missionFailed";

			sleep 15;
			dzn_missionResult = "Failed";
		};
	};
	
	
	
};

// Time to string function
dzn_fnc_convertToTimestring = {
	private ["_minutes","_seconds"];
	_minutes = floor(_this / 60);
	_seconds = _this - _minutes * 60;
	_output = "";
	if (_minutes > 0) then {
		_output = str(_minutes) + " мин " + str(_seconds) + " сек";
	} else {
		_output = str(_seconds) + " сек";
	};
	_output
};

[] spawn {
	// Уничтожение ПУ
	waitUntil { time > dzn_c_delayTime + floor(random 5) };
	// Уничтожена
	waitUntil { !alive dzn_launchPod_1 };
	if (!isNil "dzn_msg_destroyAll") exitWith {};
	
	sleep 3;
	dzn_task_launchPodDestroyed = true;
	// Радио сообщение
	dzn_msg_launchPodDestroyed = true; publicVariable "dzn_msg_launchPodDestroyed";
};

[] spawn {
	// Дезактивация Образца
	private ["_time"];
	waitUntil { time > dzn_c_delayTime + floor(random 5) };
	// Начали дезактивацию
	waitUntil { dzn_bioweaponItem getVariable "dzn_isDeactivating"};
	if (!isNil "dzn_msg_destroyAll") exitWith {};
	
	// Проверка набигания врагов с целью сломать дезактивацию
	[] spawn {
		private ["_trg"];
		_trg = createTrigger ["EmptyDetector",getPosASL(dzn_bioweaponItem)];
		_trg setTriggerArea [6,6,0,false];
		_trg setTriggerActivation ["EAST","PRESENT",false];
		_trg setTriggerStatements [
			"this && (dzn_bioweaponItem getVariable 'dzn_isDeactivating') && !dzn_task_deactivated && !dzn_task_deactivationCancelled", 
			"dzn_task_deactivationCancelled = true; publicVariable 'dzn_task_deactivationCancelled';",
			""
		];
		
		// Враги таки сломали дезактивацию
		waitUntil { dzn_task_deactivationCancelled };
		dzn_bioweaponItem setVariable ['dzn_isDeactivating',false,true];
		// Радио сообщение
		dzn_msg_bioDeactivationFailed = true; publicVariable "dzn_msg_bioDeactivationFailed";
	};
	
	// Радио сообщение
	dzn_msg_bioDeactivationStarted = true; publicVariable "dzn_msg_bioDeactivationStarted";
	
	_time = 0;
	while { (_time < (dzn_task_deactivationLimit * 60)) && { !dzn_task_deactivationCancelled } } do {
		sleep 1;
		_time = _time + 1;
		dzn_task_deactivationTime = ((dzn_task_deactivationLimit * 60) - _time) call dzn_fnc_convertToTimestring;
		publicVariable "dzn_task_deactivationTime";
	};
	
	if !(dzn_task_deactivationCancelled) then {
		dzn_task_deactivated = true;
		// Радио сообщение
		dzn_msg_bioDeactivationSuccessful = true; publicVariable "dzn_msg_bioDeactivationSuccessful";
	} else {
		// Отключили враги деактивацию
	};
};

[] spawn {
	// Установка на образец ГПС передатчика
	waitUntil { time > dzn_c_delayTime + floor(random 5) + dzn_c_specialistsDelayTime };
	// Все специалисты убиты и не начата дезактивация
	waitUntil { 
		( (dzn_task_specialistsCount <= dzn_task_specialistsDeadCount) && !(dzn_bioweaponItem getVariable 'dzn_isDeactivating') )
		|| ( dzn_task_deactivationCancelled )
	};
	if (!isNil "dzn_msg_destroyAll") exitWith {};
	
	dzn_task_addDestroyObjectTask = true;
	publicVariable "dzn_task_addDestroyObjectTask";
	
	// Радио сообщение
	dzn_msg_gpsTaskAdded = true; publicVariable "dzn_msg_bioDeactivationSuccessful";

	// Начата установка ГПС маркера
	waitUntil { dzn_bioweaponItem getVariable "dzn_placingGPS" };
	
	// Проверка набигания врагов с целью сломать GPS-маркер
	[] spawn {
		private ["_trg"];
		_trg = createTrigger ["EmptyDetector",getPosASL(dzn_bioweaponItem)];
		_trg setTriggerArea [20,20,0,false];
		_trg setTriggerActivation ["EAST","PRESENT",false];
		_trg setTriggerStatements [
			"this && (dzn_bioweaponItem getVariable 'dzn_placingGPS') && !(dzn_bioweaponItem getVariable 'dzn_isDeactivating') && !dzn_task_gpsPlacingCancelled && !dzn_task_destroyed", 
			"dzn_task_gpsPlacingCancelled = true; publicVariable 'dzn_task_gpsPlacingCancelled';",
			""
		];
		// Враги таки набижали
		waitUntil { dzn_task_gpsPlacingCancelled };
		dzn_bioweaponItem setVariable ['dzn_placingGPS',false,true];
		
		// Радио сообщение
		dzn_msg_gpsTaskFailed = true; publicVariable "dzn_msg_gpsTaskFailed";
	};

	// Радио сообщение
	dzn_msg_gpsTaskStarted = true; publicVariable "dzn_msg_gpsTaskStarted";

	private ["_time"];
	_time = 0;
	while { (_time < (dzn_c_gpsPlacingTimeLimit * 60)) && { !dzn_task_gpsPlacingCancelled } } do {
		sleep 1;
		_time = _time + 1;
		dzn_task_gpsPlacingTime = ((dzn_c_gpsPlacingTimeLimit * 60) - _time) call dzn_fnc_convertToTimestring;
		publicVariable "dzn_task_gpsPlacingTime";
	};
	
	if !(dzn_task_gpsPlacingCancelled) then {
		dzn_task_gpsPlaced = true; 
		publicVariable "dzn_task_gpsPlaced";
		
		// Радио сообщение
		dzn_msg_gpsTaskSuccessful = true; publicVariable "dzn_msg_gpsTaskSuccessful";

		dzn_task_destroyed = true;
		sleep (dzn_c_strikeDelay);
		// Тут авиаудар
		[] spawn {
			sleep 10; 
			dzn_bioweaponItem hideObjectGlobal true; 
			dzn_bioweaponItem setVariable ["dzn_isDestroyed", true, true];
		};
		for "_i" from 0 to (6 + random(floor 5)) do {
			private ["_strikePos", "_mssl"];
			_strikePos = dzn_bioweaponItem modelToWorld [-80, random(floor (8 * _i)) - random(floor (8 * _i))+180 , +200]; 
			_mssl = "Missile_AGM_02_F" createVehicle _strikePos; 
			_mssl setDir ([_mssl,_strikePos] call BIS_fnc_dirTo); 
			_mssl setVectorUp [0,7,7];
			
			sleep 3;
		};
		deleteVehicle dzn_bioweaponItem;
		
		dzn_task_extracted = true;
		publicVariable "dzn_task_extracted";
		
		[] spawn {
			private ["_anySurvivors"];
			sleep 3;
			
			_anySurvivors = false;
			{
				if (!isNil { _x getVariable "dzn_playerSurvived" } ) then { _anySurvivors = true; };	
			} forEach dzn_task_players;
			
			dzn_cond_escape = if (_anySurvivors) then { 1 } else { -1 };
			dzn_task_ranaway = true;
		};
	} else {
		// Отключили враги деактивацию
	};
};


[] spawn {
	// Сломали и дезактивацию, и гпс маркер ИЛИ убили слишком много народу
	waitUntil { time > dzn_c_specialistsDelayTime };
	waitUntil { dzn_task_gpsPlacingCancelled || (dzn_totalPlayersCount < dzn_c_playerLostLimit) };
	sleep 5;
	
	// Радио сообщение
	dzn_msg_destroyAll = true; publicVariable "dzn_msg_destroyAll";

	[] spawn {
		private ["_anySurvivors"];
		_anySurvivors = false;
		{
			if (!isNil { _x getVariable "dzn_playerSurvived" } ) then { _anySurvivors = true; };	
		} forEach dzn_task_players;
		dzn_cond_escape = if (_anySurvivors) then { 1 } else { -1 };
	};

	sleep (dzn_c_strikeDelay);
	// Тут авиаудар (200 залпов) по расширяющемуся радиусу
	dzn_massiveStrike = {
		private ["_i","_mssl","_strikePos"];
		for "_i" from 0 to 200 do {
			_strikePos = [
				(_this select 0) + random(floor (6 * _i)) - random(floor (6 * _i)),
				(_this select 1) + random(floor (6 * _i)) - random(floor (6 * _i)),
				300
			];
			_mssl = "Bo_Mk82_MI08" createVehicle _strikePos; 
			_mssl hideObjectGlobal true;
			_mssl setDir ([_mssl,_strikePos] call BIS_fnc_dirTo); 
			_mssl setVectorUp [0,7,7];
			sleep floor(random 4);
		};
	};

	[] spawn {
		sleep 60; 
		dzn_bioweaponItem hideObjectGlobal true; 
		sleep 30;
		dzn_bioweaponItem setVariable ["dzn_isDestroyed", true, true];
	};
	(dzn_bioweaponItem modelToWorld [floor(random 150), floor(random 150), 0] ) spawn dzn_massiveStrike;
	sleep random(3);
	(dzn_bioweaponItem modelToWorld [-(floor(random 150)), -(floor(random 150)), 0]) spawn dzn_massiveStrike;
	sleep random(3);
	(dzn_bioweaponItem modelToWorld [0 + (floor (random 50)), 0 + (floor (random 50)), 0]) spawn dzn_massiveStrike;
	sleep 90;
	
	dzn_missionResult = "Failed";
};
