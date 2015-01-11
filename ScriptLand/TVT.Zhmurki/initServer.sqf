if (!isNil "dzn_missionStarted") exitWith {};
waitUntil { time > 1 };
dzn_missionStarted = true;

//Создаем локацию
dzn_graveyard = createLocation ["NameVillage", getMarkerPos "%MARKER_GRAVEYARD%", 100, 100];
dzn_areaOfOperation = createLocation ["NameVillage", getMarkerPos "%MARKER_CENTER_OF_AO%", %X_OF_AO, %Y_OF_AO]; // "%MARKER_CENTER_OF_AO%"  - маркер центра зоны проверки улик против морпехов, %X_OF_AO - ширина в метрах, %Y_OF_AO - высота в метрах (по карте)
dzn_areaOfOperation setRectangular true; //Если она квадрат

waitUntil { escaped }; //Тут условие окончание миски (типа ушли к зоне высадке и триггер сказал escaped = true

_evidencesLeft = 0;
{
  if ( !(_x in dzn_graveyard) && { _x in dzn_areaOfOperation } ) then {
    _evidencesLeft = _evidencesLeft + 1;
  };
} forEach allDeadMen;

// трупов больше 4 - провал
if ( _evidencesLeft > 4 ) then {
  // BLUFOR failed
};
