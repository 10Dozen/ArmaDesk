//(запуститься только на игроке)
if !(isNil "dzn_plr_missionStarted") exitWith {};
dzn_plr_missionStarted = true;

waitUntil { !isNil "dzn_c_delayTime" };
waitUntil { !isNil "dzn_task_deactivated"};
waitUntil { !isNil "dzn_task_deactivationCancelled" };
waitUntil { !isNil "dzn_task_addDestroyObjectTask" };
waitUntil { !isNil "dzn_task_gpsPlaced" };
waitUntil { !isNil "dzn_task_gpsPlacingCancelled" };
waitUntil { !isNil "dzn_task_specialistsDeadCount" };

// Нотификации и таски, такси и нотификации
#include "dzn_playerNotif.sqf"

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
			hint format ["Наведение ракет завершится через:\n%1", dzn_task_gpsPlacingTime];
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
	//Проверка нахождения товарищей в зоне смерти при выбросах
	waitUntil { time > dzn_c_delayTime };

	waitUntil {!isNil { dzn_bioweaponItem getVariable "dzn_isDestroyed" }};
	
	dzn_task_players = dzn_task_players + [player];
	publicVariable "dzn_task_players";
	
	if (dzn_task_gpsPlaced) then {
		waitUntil { !isNil "dzn_task_extracted" };
	};
	if ((getPosASL player) in dzn_impactDeathZone) then {
		player setVariable ['dzn_playerSurvived', false, true];
		player spawn dzn_killSwitchForLost;
	} else {
		if ((getPosASL player) in dzn_impactZone) then {
			hint parseText "Химический детектор показывает повышение опасных материалов!<br/><br/>Тем не менее, уровень в безопасных пределах.";
		};
		player setVariable ['dzn_playerSurvived', true, true];
	};
};


player setVariable ["dzn_plagued", false, false];
//Смертельная зона
dzn_deathZone = {
	private ["_unit", "_trg", "_dist"];
	_unit = _this select 0;
	_trg = _this select 1;
	
	// Если в зоне не человечки, а техника то вызываем функцию для экипажа и выходим
	if !(_unit isKindOf "Man") exitWith {
		private ["_crew"];
		_crew = crew _unit;
		{
			[_x, _trg] spawn dzn_deathZone;
		} forEach _crew;
	};
	
	// Если пацан не заражен (и у него все еще работает химдетектор), то выводим сообщение
	if !(_unit getVariable "dzn_plagued") then {
		hint parseText "Химический детектор показывает резкое повышение опасных материалов!<br/><br/><t color='#ff0000'>Покиньте опасную зону!</t>";
	};

	if ((getPosATL _unit select 2) > dzn_c_plagueZoneHeight) exitWith {};	// Проверяем, что товарищ не слишком высоко
	if (_unit getVariable "dzn_plagued") exitWith {};	// Проверяем, что товарищ еще не заражен
	_dist = (triggerArea _trg) select 0;
	
	sleep 10;
	if (_unit distance _trg < _dist) exitWith {
		_unit spawn dzn_killSwitch;
	};
};

// Убиваем товарищей на выбросе
dzn_killSwitchForLost = {
	if !(local _this) exitWith {};
	hint parseText "Химический детектор показывает резкое повышение опасных материалов!<br/><br/><t color='#ff0000'>Покиньте опасную зону!</t>";
	sleep 3;
	_this spawn dzn_killSwitch;
};

// Убиваем товарищей в килл зоне
dzn_killSwitch = {
	if !(local _this) exitWith {};
	_this setVariable ["dzn_plagued", true, false];
	hint parseText "Химический детектор <t color='#ff0000'>завис на максимальном показателе.</t><br/><br/>Кажется, что это конец.";
	sleep 10;
	_this setDamage ((damage _this) + 0.8);
	sleep 5;
	_this setDamage ((damage _this) + 0.1);
	sleep 5;
	_this setDamage 1;
};
