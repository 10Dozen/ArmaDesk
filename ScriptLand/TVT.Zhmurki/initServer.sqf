if (!isNil "dzn_missionStarted") exitWith {};
waitUntil { time > 1 };
dzn_missionStarted = true;

//Создаем локацию
dzn_graveyard = createLocation ["NameVillage", getMarkerPos "%MARKER_GRAVEYARD%", 100, 100];
dzn_areaOfOperation = createLocation ["NameVillage", getPosASL %TRG, triggerArea %TRG select 0, triggerArea %TRG select 1]; // %TRG - триггер
if (triggerArea %TRG select 3) then { dzn_areaOfOperation setRectangular true; } //Если она квадрат

waitUntil { escaped }; //Тут условие окончание миски (типа ушли к зоне высадке и триггер сказал escaped = true

_evidencesLeft = 0;
{
  // Условие: труп можно было сжечь, но он не на кладбище(сожжен), но в зоне операции
  if ( (!isNil {_x getVariable 'dzn_canBeBurned'}) && { !(_x in dzn_graveyard) && ( _x in dzn_areaOfOperation) } ) then {
    _evidencesLeft = _evidencesLeft + 1;
  };
} forEach allDeadMen;

// трупов больше 4 - провал
if ( _evidencesLeft > 4 ) then {
  // BLUFOR failed
};
