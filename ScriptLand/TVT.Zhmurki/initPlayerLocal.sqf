if (!isNil { dzn_missionStarted }) exitWith {};
waitUntil { time > 1 };
dzn_missionStarted = true;

player addAction [
  "<t color='#8AD2FF'>Забрать документы</t>",
  {
		hint "x";
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
    }"
];
