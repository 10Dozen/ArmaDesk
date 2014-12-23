// Будет запущено только на сервере

// Условия победы и поражения
dzn_task_launchPodDestroyed = false;
dzn_task_deactivated = false;
dzn_task_destroyed = false;
dzn_task_extracted = false;

// Максимум времени который нужно чтобы деактивировать образец
dzn_task_deactivationLimit = dzn_c_desactivationTimeLimit;
publicVariable "dzn_task_deactivationLimit";

dzn_task_deactivationTime = dzn_c_desactivationTimeLimit * 60;
publicVariable "dzn_task_deactivationTime";

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
	waitUntil { time > 0 };
	waitUntil { !alive dzn_launchPod_1 && { !alive dzn_launchPod_2 } };
	
	dzn_task_launchPodDestroyed = true;
	[ "dzn_plrTask0", "Уничтожить ПУ" ] call dzn_gm_completeTaskNotif;
};

[] spawn {
	// Образец
	private ["_i","_time"];
	waitUntil { time > 0 };
	waitUntil { dzn_bioweaponItem getVariable "dzn_isDeactivating" };
	
	_time = 0;
	while { _time < (dzn_task_deactivationLimit * 60) } then {
		sleep 1;
		_time = _time + 1;
		
		dzn_task_deactivationTime = ((dzn_task_deactivationLimit * 60) - _time) call dzn_fnc_convertToTimestring;
		publicVariable "dzn_task_deactivationTime";
	};
	
	[ "dzn_plrTask1", "Обезвредить образец" ] call dzn_gm_completeTaskNotif;
};
