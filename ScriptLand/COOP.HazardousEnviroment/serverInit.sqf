// Будет запущено только на сервере
if (!isNil "dzn_srv_missionStarted") exitWith {};
dzn_srv_missionStarted = true;
waitUntil { !isNil "dzn_c_delayTime" };
waitUntil { !isNil "dzn_c_desactivationTimeLimit"};
waitUntil { !isNil "dzn_c_gpsPlacingTimeLimit"};

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
publicVariable "dzn_task_deactivationLimit";
dzn_task_deactivationTime = str(dzn_task_deactivationLimit * 60);
publicVariable "dzn_task_deactivationTime";

//GPS Маркер
dzn_bioweaponItem setVariable ["dzn_placingGPS", false, true];
dzn_task_gpsPlaced = false;
dzn_task_gpsPlacingTime = str(dzn_c_gpsPlacingTimeLimit * 60);

// Живость специалистов
dzn_task_specialistsCount = -1;
publicVariable "dzn_task_specialistsCount";
dzn_task_specialistsDeadCount = 0;
publicVariable "dzn_task_specialistsAreDead";

// Деактивация не удалась, ставим ГПС передатчик
dzn_task_addDestroyObjectTask = false;
dzn_task_destroyed = false;
dzn_task_extracted = false;

// Убегание после бомбежки
dzn_task_runaway = false;

[] spawn {
	// Проверяем условия для завершения миски
	
	
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
	waitUntil { time > dzn_c_delayTime };
	waitUntil { !alive dzn_launchPod_1 };
	
	dzn_task_launchPodDestroyed = true;
	[ "dzn_plrTask0", "Уничтожить ПУ" ] call dzn_gm_completeTaskNotif;
};

[] spawn {
	// Дезактивация Образца
	private ["_time"];
	waitUntil { time > dzn_c_delayTime };
	waitUntil { dzn_bioweaponItem getVariable "dzn_isDeactivating" };
	
	// Проверка набигания врагов с целью сломать дезактивацию
	[] spawn {
		private ["_trg"];
		_trg = createTrigger ["EmptyDetector",getPosASL(dzn_bioweaponItem)];
		_trg setTriggerArea [20,20,0,false];
		_trg setTriggerActivation ["EAST","PRESENT",false];
		_trg setTriggerStatements [
			"this", 
			"dzn_task_deactivationCancelled = true; publicVariable 'dzn_task_deactivationCancelled';",
			""
		];
	};
	
	_time = 0;
	while { (_time < (dzn_task_deactivationLimit * 60)) && { !dzn_task_deactivationCancelled } } then {
		sleep 1;
		_time = _time + 1;
		dzn_task_deactivationTime = ((dzn_task_deactivationLimit * 60) - _time) call dzn_fnc_convertToTimestring;
		publicVariable "dzn_task_deactivationTime";
	};
	
	if !(dzn_task_deactivationCancelled) then {
		dzn_task_deactivated = true;
		[ "dzn_plrTask1", "Обезвредить образец" ] call dzn_gm_completeTaskNotif;
	} else {
		// Отключили враги деактивацию
	};
};

[] spawn {
	// Установка на образец ГПС передатчика
	waitUntil { time > dzn_c_delayTime + 120 };
	// Все специалисты убиты и не начата дезактивация
	waitUntil { (dzn_task_specialistsCount <= dzn_task_specialistsDeadCount)
		&& { !dzn_bioweaponItem getVariable 'dzn_isDeactivating' } };
		
	dzn_task_addDestroyObjectTask = true;
	publicVariable "dzn_task_addDestroyObjectTask";
	
	// Устанавливаем ГПС маркер
	waitUntil { dzn_bioweaponItem getVariable "dzn_placingGPS" };
	
	// Проверка набигания врагов с целью сломать GPS-маркер
	[] spawn {
		private ["_trg"];
		_trg = createTrigger ["EmptyDetector",getPosASL(dzn_bioweaponItem)];
		_trg setTriggerArea [20,20,0,false];
		_trg setTriggerActivation ["EAST","PRESENT",false];
		_trg setTriggerStatements [
			"this", 
			"dzn_task_gpsPlacingCancelled = true; publicVariable 'dzn_task_gpsPlacingCancelled';",
			""
		];
	};
	
	private ["_time"];
	_time = 0;
	while { (_time < (dzn_c_gpsPlacingTimeLimit * 60)) && { !dzn_task_gpsPlacingCancelled } } then {
		sleep 1;
		_time = _time + 1;
		dzn_task_gpsPlacingTime = ((dzn_c_gpsPlacingTimeLimit * 60) - _time) call dzn_fnc_convertToTimestring;
		publicVariable "dzn_task_deactivationTime";
	};
	
	if !(dzn_task_gpsPlacingCancelled) then {
		dzn_task_gpsPlaced = true;
		[ "dzn_plrTask3", "Установить GPS-маркер" ] call dzn_gm_completeTaskNotif;
		
		sleep (dzn_c_strikeDelay);
		
	} else {
		// Отключили враги деактивацию
	};
};
