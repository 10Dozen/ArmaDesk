if (!isNil "dzn_missionStarted") exitWith {};
waitUntil { time > 1 };
dzn_missionStarted = true;

//Создаем локацию
dzn_graveyard = createLocation ["NameVillage", getMarkerPos "%MARKER_GRAVEYARD%", 100, 100];

waitUntil { escaped }; //Тут условие окончание миски (типа ушли к зоне высадке и триггер сказал escaped = true

_evidencesLeft = false;
{
  if ( !(_x in dzn_graveyard) && { (vehicle _x != _x) && (alive (vehicle _x)) } ) then {
    _evidencesLeft = true;
  };
} forEach allDeadMen;

if ( _evidencesLeft ) then {
  // BLUFOR failed
};
