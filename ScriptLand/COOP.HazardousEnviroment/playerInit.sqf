// В playerInit.sqf (запуститься только на игроке)
if !(isNil "dzn_plr_missionStarted") exitWith {};
dzn_plr_missionStarted = true;

waitUntil { !isNil "dzn_c_delayTime" };

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
			"Пусковая установка", getPosASL(dzn_launchPod_1)
		],
		[
			"Обезвредить образец", 
			"Найти и обезвредить образец биооружия, расположенный на территории аэродрома.",
			"Обезвердить образец",
			"Лаборатория", 
			position(baseLoc)
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
	   	"(_targer distance _this < 3) 
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
	   	"(_targer distance _this < 3) 
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
	   	"(_targer distance _this < 3) && { 
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
	   	"(_targer distance _this < 3) && { 
	   		(dzn_bioweaponItem getVariable 'dzn_placingGPS') 
	   		&& (dzn_task_addDestroyObjectTask) 
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
	    	if (side _x == "CIVILIAN") then {
	    		if (isNil { _x getVariable "dzn_asked" }) then {
		    		_x setVariable ["dzn_asked", false, true];
		    	};
		    	
		    	_x addAction ["<t color='#FF852E'>Допросить</t>", {
		    			if (!isNil { (_this select 1) getVariable "dzn_isSpecialist" } ) then {
		    				if ( (_this select 0) getVariable "dzn_asked" ) then {
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
			    	"(_targer distance _this < 3)"
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
		
	waitUntil { (!alive player) || !(isPlayer) };
	
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
	_trg setTriggerActivation ["WEST","PRESENT",false];
	_trg setTriggerStatements [
		"this && (player in thisList)",
		"player setVariable ['dzn_playerSurvived', true, true];",
		""
	];
	
	dzn_task_players = dzn_task_players + [player];
	publicVariable "dzn_task_players";
};

player setVariable ["dzn_plagued", false, false];
//Смертельная зона
dzn_deathZone = {
	_unit = _this select 0;
	_trg = _this select 1;
	
	if (_unit getVariable "dzn_plagued") exitWith {};
	
	_dist = (triggerArea _trg) select 0;
	
	sleep 5;
	if (_unit distance _trg < _dist) exitWith {
		player setVariable ["dzn_plagued", true, false];
		[] spawn {
			sleep 50;
			player setDamage 0.8;
		};
	};
};
