if (!isNil { dzn_missionStarted }) exitWith {};
waitUntil { time > 1 };
dzn_missionStarted = true;

// Добавляем действие
// 	Ожидается, что у одного из юнитов будет прописано: _this setVariable ["dzn_hasDocuments", true, true]; в ините или в скрипте
player addAction [
	"<t color='#8AD2FF'>Забрать документы</t>",
	{
		if (!isNil { cursorTarget getVariable 'dzn_hasDocuments' } ) then {
			cursorTarget setVariable ["dzn_hasDocuments", nil, true];
			(_this select 1) setVariable ["dzn_hasDocuments", true, true];
			dzn_unitWithDocuments = vehicle player;
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


// Процесс рисования маркера:
[] spawn {
	waitUntil {!isNil "dzn_unitWithDocuments"};
	waitUntil {!isNil "%MARKER_NAME%"};	// Вписать имя маркера
	
	while { true } do {
		private ["_pos"];
		_pos = getPosASL dzn_unitWithDocuments;
	
		"%MARKER_NAME%" setMarkerPos [_pos select 0, _pos select 1];	// Вписать имя маркера
		sleep 60;
	};
};
