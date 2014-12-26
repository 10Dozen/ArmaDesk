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


// Радио сообщения и их условия
[] spawn {
	waitUntil {!isNil "dzn_msg_destroyAll"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Всем кто меня слышит - покиньте остров немедленно! На остров будут сброшены термобарический бомбы для зачистки!";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_missionWin"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Это успех! Все задачи выполнены, поздравляю!";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_missionWin2"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Цель уничтожена! Повторяю, объект уничтожен! Всем выжившим - возвращайтесь на борт!";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_missionFailed"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Кто-нибудь меня слышит? Всем попавшим в облако заражения - запрещено покидать пределы острова! Остров под карантином!";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_launchPodDestroyed"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. На картинке с разведчика остатки пусковой установке. Отличная работа!";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_bioDeactivationFailed"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Дезактивация прервана, нас отрезали от доступа к системе. Мы не можем больше ждать - необходимо дать целеуказание нашим ракетам!";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_bioDeactivationStarted"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Подключились к их системе. Взлом и деактивация потребует времени. Не подпускайте противника к образцу пока мы не завершим работу!";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_bioDeactivationSuccessful"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Отлично, систем полностью под нашим контролем. Образец больше не представляет опасности.";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_gpsTaskAdded"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Разместите GPS-маркер на объекте и мы попробуем получить точные координаты цели. Не допускайте противника к устройству!";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_gpsTaskFailed"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Мы потеряли сигнал! Сожалею, но нам придется нанести массированный удар по острову. Попытайтесь покинуть остров как можно быстрее.";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_gpsTaskStarted"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Получаем сигнал, начинаем уточнение. Держите противника подальше от устройства, но будьте готовы быстро уйти после того как мы закончим.";
};
[] spawn {
	waitUntil {!isNil "dzn_msg_gpsTaskSuccessful"};
	dzn_c_radioMan sideChat "Всем отрядам, это Папаша-Медведь. Координаты получены, удар последует менее, чем через 5 минут! Мы ожидаем биоопасный выброс, поэтому немедленно покиньте остров!";
};
