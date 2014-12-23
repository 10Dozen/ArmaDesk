// В playerInit.sqf (запуститься только на игроке)

// Создаем таски
[] spawn {
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
				_forEachIndex
			];
		} forEach _this;	
	};
	
	_briefingTasks = [
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
	
	_briefingTasks call briefingCreateTasks;
};

// Вешаем действие на образце
[] spawn {
	//dzn_bioweaponItem
};

// Вешаем действия на Ученых-крученых
[] spawn {
	// Ждем когда миска начнется (т.е. все проинициализируются)
	waitUntil { time > 0 };
   
	// Тут мы будем ловить злобных ученых
	// вернет всех человеков на карте - ученым лучше стоять простыми тушками, а не в машинах.
	_men = entites "CAManBase"; 
	dzn_scientists = [];
	{
	    	if (side _x == "CIVILIAN") then {
	    		dzn_scientists = dzn_scientists + [_x];
	    		
		    	_x setVariable ["dzn_asked", false, true];
		    	_x addAction ["<t color='#FF852E'>Допросить</t>", {
		    			if (!isNil { (_this select 1) getVariable "dzn_isSpecialist" } ) then {
		    				if ( (_this select 0) getVariable "dzn_asked" ) then {
		    					hint "Ученый объяснет Вам как дезактивировать образец";
		    					dzn_task_deactivationLimit = dzn_task_deactivationLimit - 1;
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
			    	"(_targer distance _this < 5)"
		    	];
	    	};
	} forEach _men;
};


