if (!isNil "dzn_missionStarted") exitWith {};
waitUntil { time > 1 };
dzn_missionStarted = true;

_EH_KilledWithDocuments = player addEventHandler ["killed", {
	if ( isNil { (_this select 0) getVariable "dzn_hasDocuments"}) exitWith {};
	if (vehicle (_this select 0) == (_this select 0) ) exitWith {};
	
	private ["_veh"];
	_veh = vehicle (_this select 0);
	if (alive _veh) then {
		_veh setVariable ["dzn_hasDocuments", true, true];
		(_this select 0) setVariable ["dzn_hasDocuments", nil, true];
		dzn_unitWithDocuments = _veh;
		publicVariable "dzn_unitWithDocuments";
	} else {
		// Тут какое то условие на провал миссии
		missionFailed = true;
		publicVariable "missionFailed";
	};
}];


/*
// Тут мы провереям - этот ли игрок имеет документы и назначаем его на роль dzn_unitWithDocuments
if (!isNil {player getVariable 'dzn_hasDocuments'}) then {
	dzn_unitWithDocuments = vehicle player;
	publicVariable "dzn_unitWithDocuments";
};
*/

//********************************************************************
// Для тестов вместо IF выше использовать это (заменить UNIT_NAME на бота
UnitAAF_A1_FTL setVariable ["dzn_hasDocuments", true, true];
dzn_unitWithDocuments = UnitAAF_A1_FTL;
publicVariable "dzn_unitWithDocuments";
_EHkilledIdx = UnitAAF_A1_FTL addEventHandler ["killed", {
	if ( isNil { (_this select 0) getVariable "dzn_hasDocuments"}) exitWith {};
	if (vehicle (_this select 0) == (_this select 0) ) exitWith {};
	
	private ["_veh"];
	_veh = vehicle (_this select 0);
	if (alive _veh) then {
		_veh setVariable ["dzn_hasDocuments", true, true];
		(_this select 0) setVariable ["dzn_hasDocuments", nil, true];
		dzn_unitWithDocuments = _veh;
		publicVariable "dzn_unitWithDocuments";
	} else {
		// Тут какое то условие на провал миссии
		missionFailed = true;
		publicVariable "missionFailed";
	};
}];
//*******************************************************************


// Ждем, пока dzn_unitWithDocuments не появится
waitUntil { !isNil "dzn_unitWithDocuments" };

// Добавляем действие на сбор документов
// 	Ожидается, что у одного из юнитов будет прописано: _this setVariable ["dzn_hasDocuments", true, true]; в ините или в скрипте
player addAction [
	"<t color='#8AD2FF'>Забрать документы</t>",
	{
		if (!isNil { cursorTarget getVariable 'dzn_hasDocuments' } ) then {
			cursorTarget setVariable ["dzn_hasDocuments", nil, true];
			(_this select 1) setVariable ["dzn_hasDocuments", true, true];
			dzn_unitWithDocuments = vehicle (_this select 1);
			publicVariable "dzn_unitWithDocuments";
		};
		hint "Ты забрал документы";
	}, 
	"", 
	6, 
	true, 
	true,
	"", 
	"(!isNil {cursorTarget getVariable 'dzn_hasDocuments'}) 
	&& { 
		( (cursorTarget isKindOf 'Man')
		&& !alive cursorTarget 
		&& (cursorTarget distance player < 2.5)
		&& (vehicle player == player)
		&& (alive player))
		|| 
		(!(cursorTarget isKindOf 'Man')
		&& alive cursorTarget 
		&& (cursorTarget distance player < 6)
		&& (vehicle player == player)
		&& (alive player))
	}"
];

/*
	(!isNil {cursorTarget getVariable 'dzn_hasDocuments'}) 
	&& { 
		(!alive cursorTarget 
		&& (cursorTarget distance player < 2.5)
		&& (vehicle player == player)
		&& (alive player))
		
		|| 
		
		(!(cursorTarget isKindOf 'Man')
		&& alive cursorTarget 
		&& (cursorTarget distance player < 6)
		&& (vehicle player == player)
		&& (alive player))
	} 
	
	
	
	
	
	
	
	(!isNil {cursorTarget getVariable 'dzn_hasDocuments'}) 
		&& {
		!alive cursorTarget 
		&& (cursorTarget distance player < 2.5)
		&& (vehicle player == player)
		&& (alive player)
	}
	*/
// Процесс рисования маркера - каждую минуту перемещает маркер на положение dzn_unitWithDocuments. Возможно работает локально для всех, из вики не понятно.
[] spawn {
	waitUntil {!isNil "dzn_unitWithDocuments"};
	
	private ["_pos"];
	while { true } do {
		_pos = getPosASL dzn_unitWithDocuments;
	
		"docs" setMarkerPosLocal [_pos select 0, _pos select 1];	// Вписать имя маркера
		"docs" setMarkerAlphaLocal 1;
		
		for "_i" from 1 to 9 do {
			_alphaDocs = MarkerAlpha "docs";
			"docs" setMarkerAlphaLocal (_alphaDocs -0.1);
			sleep 3;
		};
	};
};







// Тут пока опциональное про сжигание тел
//Если пацаны из блюфор
if (side player == west) then {
	player setVariable ["dzn_canBeBurned", true, true];
	
	player addAction [
		"<t color='#8AD2FF'>Уничтожить тело</t>",
		{
			private ["_body"];
			_body = cursorTarget;
			hint "Термитная граната активирована!";
			_body spawn {
				sleep 5;
			
				"IncinerateShell" createVehicle (getPos _this);
				sleep 3;
				_this setPos (getMarkerPos "grave");	//Маркер для "кладбищя" синих
			};
		},
		"", 
		6, 
		true, 
		true,
		"", 
		"(!isNil {cursorTarget getVariable 'dzn_canBeBurned'}) 
			&& {
			!alive cursorTarget 
			&& (cursorTarget distance player < 2.5)
			&& (vehicle player == player)
			&& (alive player)
		}"
	];
	
	// Выкидывает труп из машины, если скорость машины меньше 5 и она менее 5 метров над землей
	_EH_KilledInCar = player addEventHandler ["killed", {
		if (vehicle (_this select 0) == (_this select 0)) exitWith {};
		[(vehicle (_this select 0)), (_this select 0)]  spawn {
			waitUntil { (speed (_this select 0) < 5)  && (((getPosATL (_this select 0)) select 2) < 5) };
			if (alive (_this select 0)) then {
				moveOut (_this select 1);
			};
		};
	
	}]
};


// Для тестов на ботах - имена ботов добавить в массив
bots = [];

{
	_x setVariable ["dzn_canBeBurned", true, true];
	
	// Выкидывает труп из машины, если скорость машины меньше 5 и она менее 5 метров над землей
	_EH_KilledInCar = _x addEventHandler ["killed", {
		if (vehicle (_this select 0) == (_this select 0)) exitWith {};
		[(vehicle (_this select 0)), (_this select 0)]  spawn {
			waitUntil { (speed (_this select 0) < 5)  && (((getPosATL (_this select 0)) select 2) < 5) };
			if (alive (_this select 0)) then {
				moveOut (_this select 1);
			};
		};
	
	}]
} forEach _bots;
