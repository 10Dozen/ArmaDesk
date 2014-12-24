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
dzn_task_deactivationTime = str(dzn_task_deactivationLimit * 60);

//GPS Маркер
dzn_bioweaponItem setVariable ["dzn_placingGPS", false, true];
dzn_task_gpsPlaced = false;
dzn_task_gpsPlacingTime = str(dzn_c_gpsPlacingTimeLimit * 60);

// Живость специалистов
dzn_task_specialistsCount = -1;
publicVariable "dzn_task_specialistsCount";
dzn_task_specialistsDeadCount = 0;
publicVariable "dzn_task_specialistsAreDead";

dzn_task_players = [];
publicVariable "dzn_task_players";

// Деактивация не удалась, ставим ГПС передатчик
dzn_task_addDestroyObjectTask = false;

dzn_task_destroyed = false;
dzn_task_extracted = false;

// Убегание после бомбежки
// dzn_task_runaway = false;

//Публикуем переменные
publicVariable "dzn_task_addDestroyObjectTask";
publicVariable "dzn_task_deactivated";
publicVariable "dzn_task_deactivationCancelled";
publicVariable "dzn_task_gpsPlaced";
publicVariable "dzn_task_gpsPlacingCancelled";
publicVariable "dzn_task_deactivationTime";
publicVariable "dzn_task_deactivationLimit";

[] spawn {
	waitUntil { dzn_task_deactivationCancelled  && dzn_task_gpsPlacingCancelled };
	sleep 5;
	[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Всем кто меня слышит - покиньте остров немедленно! На остров будут сброшены термобарический бомбы для зачистки!" ] call dzn_gm_sendMessage;

	sleep (dzn_c_strikeDelay);
	// Тут авиаудар (50 залпов по 2 ракеты) по расширяющемуся радиусу
	private ["_i","_j","_mssl","_strikePos"];
	for "_i" from 0 to 50 do {
		_strikePos = dzn_bioweaponItem modelToWorld [0, -100 + random(floor (20 * _i)) - random(floor (29 * _i)), +100];
		for "_j" from 0 to 1 do {
			if (!isNil {_mssl}) then {
				_strikePos =  _mssl modelToWorld [2,2,0];
			};
			_mssl = "Missile_AGM_02_F" createVehicle _strikePos; 
			_mssl setDir ([_mssl,_strikePos] call BIS_fnc_dirTo); 
			_mssl setVectorUp [0,7,7];
		}
		sleep 4;
	};
	
	dzn_missionResult = "Failed";
};

[] spawn {
	// Проверяем условия для завершения миски
	waitUntil { time > dzn_c_delayTime };
	waitUntil {dzn_task_launchPodDestroyed};
	dzn_cond_launchPod = 1;
	dzn_cond_deactivate = 0;
	dzn_cond_gps = 0;
	dzn_cond_escape = 0;
	
	waitUntil { dzn_task_deactivated || dzn_task_gpsPlaced };
	if ( dzn_task_deactivated ) then {
		dzn_cond_deactivate = 1;
	
		sleep 5;
		[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Это успех! Все задачи выполнены, поздравляю!" ] call dzn_gm_sendMessage;

		sleep 15;
		dzn_missionResult = "Win1";
	} else {
		dzn_cond_gps = 1;
		waitUntil { dzn_task_destroyed };
		waitUntil { dzn_task_extracted };
		if (dzn_task_players) then {
			sleep 5;
			[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Цель уничтожена! Повторяю, объект уничтожен! Всем выжившим - возвращайтесь на борт!" ] call dzn_gm_sendMessage;
			sleep 15;
			dzn_missionResult = "Win2";
		} else {
			sleep 5;
			[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Кто-нибудь меня слышит? Всем попавшим в облако заражения - запрещено покидать пределы острова! Остров под карантином!" ] call dzn_gm_sendMessage;

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
	waitUntil { time > dzn_c_delayTime };
	waitUntil { !alive dzn_launchPod_1 };
	
	sleep 3;
	
	dzn_task_launchPodDestroyed = true;
	[ "dzn_plrTask0", "Уничтожить ПУ" ] call dzn_gm_completeTaskNotif;
	[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. На картинке с разведчика остатки пусковой установке. Отличная работа!" ] call dzn_gm_sendMessage;
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
			"this && (dzn_bioweaponItem getVariable 'dzn_isDeactivating') && !dzn_task_deactivated && !dzn_task_deactivationCancelled", 
			"dzn_task_deactivationCancelled = true; publicVariable 'dzn_task_deactivationCancelled';",
			""
		];
		
		waitUntil { dzn_task_deactivationCancelled };
		[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Дезактивация прервана, нас отрезали от доступа к системе. Мы не можем больше ждать - необходимо дать целеуказание нашим ракетам!" ] call dzn_gm_sendMessage;
	};
	
	[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Подключились к их системе. Взлом и деактивация потребует времени. Не подпускайте противника к образцу пока мы не завершим работу!" ] call dzn_gm_sendMessage;
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
		[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Отлично, систем полностью под нашим контролем. Образец больше не представляет опасности." ] call dzn_gm_sendMessage;
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
	
	[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Разместите GPS-маркер на объекте и мы попробуем получить точные координаты цели. Не допускайте противника к устройству!" ] call dzn_gm_sendMessage;
	
	// Устанавливаем ГПС маркер
	waitUntil { dzn_bioweaponItem getVariable "dzn_placingGPS" };
	
	// Проверка набигания врагов с целью сломать GPS-маркер
	[] spawn {
		private ["_trg"];
		_trg = createTrigger ["EmptyDetector",getPosASL(dzn_bioweaponItem)];
		_trg setTriggerArea [20,20,0,false];
		_trg setTriggerActivation ["EAST","PRESENT",false];
		_trg setTriggerStatements [
			"this && !(dzn_bioweaponItem getVariable 'dzn_placingGPS') && !dzn_task_gpsPlacingCancelled && !dzn_task_destroyed", 
			"dzn_task_gpsPlacingCancelled = true; publicVariable 'dzn_task_gpsPlacingCancelled';",
			""
		];
		waitUntil { dzn_task_gpsPlacingCancelled };
		[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Мы потеряли сигнал! Сожалею, но нам придется нанести массированный удар по острову. Попытайтесь покинуть остров как можно быстрее." ] call dzn_gm_sendMessage;
	};
	
	[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Получаем сигнал, начинает уточнение. Держите противника подальше от устройства, но будьте готовы быстро уйти после того как мы закончим." ] call dzn_gm_sendMessage;
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
		publicVariable "dzn_task_gpsPlaced";
		[ "dzn_plrTask2", "Установить GPS-маркер" ] call dzn_gm_completeTaskNotif;
		[ dzn_c_radioMan, 0, "Всем отрядам, это Папаша-Медведь. Координаты получены, удар последует менее, чем через 5 минут! Мы ожидаем биоопасный выброс, поэтому немедленно покиньте остров!" ] call dzn_gm_sendMessage;
		
		dzn_task_destroyed = true;
		sleep (dzn_c_strikeDelay);
		// Тут авиаудар
		for "_i" from 0 to random(floor 6) do {
			private ["_strikePos", "_mssl"];
			_strikePos = dzn_bioweaponItem modelToWorld [0, -100 + random(floor (5 * _i)) - random(floor (5 * _i)), +100];
			_mssl = "Missile_AGM_02_F" createVehicle _strikePos; 
			_mssl setDir ([_mssl,_strikePos] call BIS_fnc_dirTo); 
			_mssl setVectorUp [0,7,7];
			
			sleep 3;
		}
		
		dzn_task_extracted = true;
		[] spawn {
			_anySurvivors = false;
			{
				if (!isNil { _x getVariable "dzn_playerSurvived" } ) then { dzn_task_players = true; };	
			} forEach dzn_task_players;
			dzn_cond_escape = 1;
		};
	} else {
		// Отключили враги деактивацию
	};
};


