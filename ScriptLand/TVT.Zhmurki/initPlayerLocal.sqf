if (!isNil "dzn_missionStarted") exitWith {};
waitUntil { time > 1 };
dzn_missionStarted = true;



/*
// Тут мы провереям - этот ли игрок имеет документы и назначаем его на роль dzn_unitWithDocuments
if (!isNil {player getVariable 'dzn_hasDocuments'}) then {
	dzn_unitWithDocuments = vehicle player;
	publicVariable "dzn_unitWithDocuments";
	
	_EHkilledIdx = player addEventHandler ["killed", {
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
	}]
};
*/
//********************************************************************
// Для тестов вместо IF выше использовать это (заменить UNIT_NAME на бота
UNIT_NAME setVariable ["dzn_hasDocuments", nil, true];
dzn_unitWithDocuments = UNIT_NAME;
publicVariable "dzn_unitWithDocuments";
_EHkilledIdx = UNIT_NAME addEventHandler ["killed", {
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
		!alive cursorTarget 
		&& (cursorTarget distance player < 2.5)
		&& (vehicle player == player)
		&& (alive player)
	}"
];


// Процесс рисования маркера - каждую минуту перемещает маркер на положение dzn_unitWithDocuments. Возможно работает локально для всех, из вики не понятно.
[] spawn {
	waitUntil {!isNil "dzn_unitWithDocuments"};
//	waitUntil {!isNil "%MARKER_NAME%"};	// Вписать имя маркера
	
	private ["_pos"];
	while { true } do {
		_pos = getPosASL dzn_unitWithDocuments;
	
		"%MARKER_NAME%" setMarkerPosLocal [_pos select 0, _pos select 1];	// Вписать имя маркера
		sleep 60;
	};
};
