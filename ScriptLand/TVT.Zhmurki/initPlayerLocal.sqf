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
