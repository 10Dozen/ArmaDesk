// В playerInit.sqf (запуститься только на игроке)

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
