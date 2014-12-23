// Будет запущено только на сервере
if (!isNil "dzn_srv_missionStarted") exitWith {};
dzn_srv_missionStarted = true;
waitUntil { !isNil "dzn_c_delayTime" };
waitUntil { !isNil "dzn_c_desactivationTimeLimit"};

// Пусковая установка
dzn_task_launchPodDestroyed = false;

// Отмена деактивации врагами
dzn_task_deactivationCancelled = false;


// Деактивация
dzn_bioweaponItem setVariable ["dzn_isDeactivating", false, true];
dzn_bioweaponItem setVariable ["dzn_placingGPS", false, true];
dzn_task_deactivated = false;
dzn_task_gpsPlaced = false;
// Максимум времени который нужно чтобы деактивировать образец
dzn_task_deactivationLimit = dzn_c_desactivationTimeLimit;
publicVariable "dzn_task_deactivationLimit";
dzn_task_deactivationTime = dzn_task_deactivationLimit * 60;
publicVariable "dzn_task_deactivationTime";

// Живость специалистов
dzn_task_specialistsCount = -1;
publicVariable "dzn_task_specialistsCount";
dzn_task_specialistsDeadCount = 0;
publicVariable "dzn_task_specialistsAreDead";

// Деактивация не удалась, ставим ГПС передатчик
dzn_task_addDestroyObjectTask = false;
dzn_task_destroyed = false;
dzn_task_extracted = false;


[] spawn {
	// Проверяем условия для завершения миски
};

// Time to string function
dzn_fnc_convertToTimestring = {
	// time
	private [];
	_minutes = (_this) / 60 - (_this) % 60;
	_seconds = (_this) - _minutes;
	_output = if (_minutes > 0) then {
		call compile format ["%1 мин %2 сек", _minutes, _seconds];
	} else {
		call compile format ["%1 сек", _seconds];
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
	private ["_i","_time"];
	waitUntil { time > dzn_c_delayTime };
	waitUntil { dzn_bioweaponItem getVariable "dzn_isDeactivating" };
	
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
	
};
