// В playerInit.sqf (запуститься только на игроке)
if !(isNil "dzn_plr_missionStarted") exitWith {};
dzn_plr_missionStarted = true;

waitUntil { !isNil "dzn_c_delayTime" };
waitUntil { !isNil "dzn_task_deactivated"};
waitUntil { !isNil "dzn_task_deactivationCancelled" };
waitUntil { !isNil "dzn_task_addDestroyObjectTask" };
waitUntil { !isNil "dzn_task_gpsPlaced" };
waitUntil { !isNil "dzn_task_gpsPlacingCancelled" };
waitUntil { !isNil "dzn_task_specialistsDeadCount" };

// Создаем таски
[] spawn {
	private ["_briefingTasksInit", "_briefingTasksToDestroy"];
	dzn_taskId = 0;
	briefingCreateTasks = {
		{
			_task = _x select 0;
			_taskDesc = _x select 1;
			_taskTitle = _x select 2;
			_taskPointDesc = _x select 3;
			_taskPointPos = _x select 4;
			
			call compile format [
				"dzn_plrTask%1 = player createSimpleTask [_task];
				dzn_plrTask%1 setSimpleTaskDescription [_taskDesc, _taskTitle, _taskPointDesc];
				dzn_plrTask%1 setSimpleTaskDestination _taskPointPos;",
				dzn_taskId
			];
			
			dzn_taskId = dzn_taskId + 1;
		} forEach _this;	
	};
	
	_briefingTasksInit = [
		[	
			"Уничтожить ПУ",
			"Обнаружить и уничтожить пусковую установку.",
			"Уничтожить Пусковую установку",
			"Пусковая установка", 
			dzn_launchPod_1 modelToWorld [(random 100 - random 100), (random 100 - random 100), 0]
		],
		[
			"Обезвредить образец", 
			"Найти и обезвредить образец биооружия, расположенный на территории аэродрома.",
			"Обезвердить образец",
			"Лаборатория", 
			dzn_bioweaponItem modelToWorld [(random 100 - random 100), 15 + random ( 20), 0]
		]
	];
	
	_briefingTasksInit call briefingCreateTasks;
	
	waitUntil { dzn_task_addDestroyObjectTask };
	_briefingTasksToDestroy = [
		[	
			"Установить GPS-маркер",
			"Установить GPS-маркер на образец и дождаться пока не будут зафиксированы координаты цели. После получения точных координат по цели будет нанесен удар. Вы должны покинуть остров ДО удара. У вас будет меньше 2 минут, чтобы покинуть остров после получения координат. Не допускайте противника к образцу - он может уничтожить GPS-маркер!",
			"Установить GPS-маркер",
			"Образец", getPosASL(dzn_bioweaponItem)
		]
	];
	_briefingTasksToDestroy call briefingCreateTasks;
	
	dzn_plrTask99 = player createSimpleTask ["Покинуть остров"];
	dzn_plrTask99 setSimpleTaskDescription [
		"Покиньте остров до нанесения удара! После уничтожения образца существует критическая вероятность заражения территории! Все кто будут в пределах зоны заражения - погибнут!",
		"Покинуть остров",
		"Покинуть остров"
	];
};

// Вешаем действие на образце
[] spawn {
	//dzn_bioweaponItem
	waitUntil { time > dzn_c_delayTime };
	
	dzn_bioweaponItem addAction [
		"<t color='#FF852E'>Начать деактивацию образца</t>",
		{
			dzn_bioweaponItem setVariable ["dzn_isDeactivating", true, true];
			hint "Начата деактивация образца";
		}, 
		"", 
		6, 
		true, 
	   	true,
	   	"", 
	   	"(_target distance _this < 3) 
			&& { !(dzn_bioweaponItem getVariable 'dzn_isDeactivating') 
	   		&& (_this getVariable 'dzn_isSpecialist') 
	   		&& !dzn_task_deactivated
	   		&& !dzn_task_addDestroyObjectTask
	   		&& !dzn_task_deactivationCancelled
	   	}"
	];
	
	dzn_bioweaponItem addAction [
		"<t color='#8AD2FF'>Проверить статус деактивации</t>",
		{
			hint format ["Деактивация завершится через:\n%1", dzn_task_deactivationTime];
		}, 
		"", 
		6, 
		true, 
	   	true,
	   	"", 
	   	"(alive _target) && (_target distance _this < 3) 
	   		&& { (dzn_bioweaponItem getVariable 'dzn_isDeactivating')
	   		&& !dzn_task_deactivated
	   		&& !dzn_task_addDestroyObjectTask
	   		&& !dzn_task_deactivationCancelled
	   	} "
	];
	
	dzn_bioweaponItem addAction [
		"<t color='#8AD2FF'>Установить GPS-маркер</t>",
		{
			dzn_bioweaponItem setVariable ["dzn_placingGPS", true, true];
			hint "GPS-маркер установлен. Уточняются координаты.";
		}, 
		"", 
		6, 
		true, 
	   	true,
	   	"", 
	   	"(_target distance _this < 3) && { 
	   		!(dzn_bioweaponItem getVariable 'dzn_placingGPS') 
	   		&& dzn_task_addDestroyObjectTask
	   		&& !dzn_task_gpsPlaced
	   		&& !dzn_task_gpsPlacingCancelled
	   	}"
	];
	
	dzn_bioweaponItem addAction [
		"<t color='#8AD2FF'>Проверить получение координат</t>",
		{
			hint format ["Деактивация завершится через:\n%1", dzn_task_gpsPlacingTime];
		}, 
		"", 
		6, 
		true, 
	   	true,
	   	"", 
	   	"(_target distance _this < 3) && { 
	   		(dzn_bioweaponItem getVariable 'dzn_placingGPS') 
	   		&& dzn_task_addDestroyObjectTask
	   		&& !dzn_task_gpsPlaced
	   		&& !dzn_task_gpsPlacingCancelled
	   	}"
	];
	
};

// Вешаем действия на Ученых-крученых
[] spawn {
	// Ждем когда миска начнется (т.е. все проинициализируются)
	waitUntil { time > dzn_c_delayTime };
   
	// Тут мы будем ловить злобных ученых
	// вернет всех человеков на карте - ученым лучше стоять простыми тушками, а не в машинах.
	_men = entities "CAManBase"; 
	{
	    	if (side _x == civilian) then {
	    		if (isNil { _x getVariable "dzn_asked" }) then {
		    		_x setVariable ["dzn_asked", false, true];
		    	};
		    	
		    	_x addAction ["<t color='#FF852E'>Допросить</t>", {
		    			if (!isNil { (_this select 1) getVariable "dzn_isSpecialist" } ) then {
		    				if !( (_this select 0) getVariable "dzn_asked" ) then {
		    					hint "Ученый объяснет Вам как дезактивировать образец";
		    					dzn_task_deactivationLimit = dzn_task_deactivationLimit - dzn_c_desactivationTimeReducer;
								publicVariable "dzn_task_deactivationLimit";
		    					(_this select 0) setVariable ["dzn_asked", true, true];
		    				} else {
		    					hint "Ученый уже все рассказал, больше ему добавить нечего";
		    				};
		    			} else {
		    				hint "Ученый говорит, но Вы его не понимаете.";
		    			};
			    	}, 
			    	"", 
			    	6, 
			    	true, 
			    	true,
			    	"", 
			    	"(alive _target) &&  (_target distance _this < 3)"
		    	];
	    	};
	} forEach _men;
};

// Специалисты записываются в список и сообщают в случае своей смерти
[] spawn {
	if (isNil { player getVariable "dzn_isSpecialist" }) exitWith {};
	
	waitUntil { time > dzn_c_delayTime };
	waitUntil { !isNil "dzn_task_specialistsCount" };
		
	if (dzn_task_specialistsCount == -1) then {
		dzn_task_specialistsCount = 1;
	} else {
		dzn_task_specialistsCount = dzn_task_specialistsCount + 1;
	};
	publicVariable "dzn_task_specialistsCount";
	private ["_unit"];
	_unit = player;
	waitUntil { (!alive _unit) || !(isPlayer _unit) };
	
	dzn_task_specialistsDeadCount = dzn_task_specialistsDeadCount + 1;
	publicVariable "dzn_task_specialistsDeadCount";
};


[] spawn {
	waitUntil { time > dzn_c_delayTime };
	waitUntil { !isNil "dzn_task_gpsPlaced" };
	waitUntil { dzn_task_gpsPlaced };
	
	private ["_trg"];
	_trg = createTrigger ["EmptyDetector", [3605,3642,0]];
	_trg setTriggerArea [1200, 800, -139.84, false];
	_trg setTriggerActivation ["WEST","NOT PRESENT",true];
	_trg setTriggerStatements [
		"this && !(player in thisList)",
		"player setVariable ['dzn_playerSurvived', true, true];",
		""
	];
	
	dzn_task_players = dzn_task_players + [player];
	publicVariable "dzn_task_players";
};

player setVariable ["dzn_plagued", false, false];
//Смертельная зона
dzn_deathZone = {
	private ["_unit", "_trg", "_dist"];
	_unit = _this select 0;
	_trg = _this select 1;
	
	// Если в зоне не человечки, а техника то вызываем функцию для экипажа и выходим
	if !(typeOf _unit == "CAManBase") exitWith {
		private ["_crew"];
		_crew = crew _unit;
		{
			[_x, _trg] spawn dzn_deathZone;
		} forEach _crew;
	};
	
	// Если пацан не заражен (и у него все еще работает химдетектор), то выводим сообщение
	if !(_unit getVariable "dzn_plagued") then {
		hint "Химический детектор показывает резкое повышение опасных материалов!\n\nПокиньте опасную зону!";
	};

	if ((getPosATL _unit select 2) > dzn_c_plagueZoneHeight) exitWith {};	// Проверяем, что товарищ не слишком высоко
	if (_unit getVariable "dzn_plagued") exitWith {};	// Проверяем, что товарищ еще не заражен
	_dist = (triggerArea _trg) select 0;
	
	sleep 10;
	if (_unit distance _trg < _dist) exitWith {
		_unit setVariable ["dzn_plagued", true, false];
		_unit spawn {
			if !(local _this) exitWith {};
			hint "Химический детектор завис на максимальном показателе.\nКажется, что это конец.";
			sleep 10;
			_this setDamage ((damage _this) + 0.8);
			sleep 5;
			_this setDamage ((damage _this) + 0.1);
			sleep 5;
			_this setDamage 1;
		};
	};
};

// Радио сообщения и их условия
[] spawn {
	waitUntil (!isNil "dzn_msg_destroyAll");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Всем кто меня слышит - покиньте остров немедленно! На остров будут сброшены термобарический бомбы для зачистки!";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_missionWin");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Это успех! Все задачи выполнены, поздравляю!";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_missionWin2");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Цель уничтожена! Повторяю, объект уничтожен! Всем выжившим - возвращайтесь на борт!";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_missionFailed");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Кто-нибудь меня слышит? Всем попавшим в облако заражения - запрещено покидать пределы острова! Остров под карантином!";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_launchPodDestroyed");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. На картинке с разведчика остатки пусковой установке. Отличная работа!";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_bioDeactivationFailed");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Дезактивация прервана, нас отрезали от доступа к системе. Мы не можем больше ждать - необходимо дать целеуказание нашим ракетам!";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_bioDeactivationStarted");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Подключились к их системе. Взлом и деактивация потребует времени. Не подпускайте противника к образцу пока мы не завершим работу!";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_bioDeactivationSuccessful");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Отлично, систем полностью под нашим контролем. Образец больше не представляет опасности.";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_gpsTaskAdded");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Разместите GPS-маркер на объекте и мы попробуем получить точные координаты цели. Не допускайте противника к устройству!";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_gpsTaskFailed");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Мы потеряли сигнал! Сожалею, но нам придется нанести массированный удар по острову. Попытайтесь покинуть остров как можно быстрее.";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_gpsTaskStarted");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Получаем сигнал, начинаем уточнение. Держите противника подальше от устройства, но будьте готовы быстро уйти после того как мы закончим.";
};
[] spawn {
	waitUntil (!isNil "dzn_msg_gpsTaskSuccessful");
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Координаты получены, удар последует менее, чем через 5 минут! Мы ожидаем биоопасный выброс, поэтому немедленно покиньте остров!";
};
