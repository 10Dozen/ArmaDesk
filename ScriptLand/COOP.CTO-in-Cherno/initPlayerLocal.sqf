//(запуститься только на игроке)
if !(isNil "dzn_plr_missionStarted") exitWith {};
dzn_plr_missionStarted = true;

[] spawn {
	player addAction  [
		"<t color='#8AD2FF'>Разминировать СВУ</t>",
		{
			private["_cT"];
			_cT = cursorTarget;
			_cT stVariable ["%VARNAME", nil, true]; //Если была переменная - то удаляем ее
			deleteVehicle _cT; // Удаляем штуку
		}, 
		"", 
		6, 
		true, 
	   	true,
	   	"", 
	   	"_cT = cursorTarget;
	   	(!isNil {cursorTarget getVariable 'iedArmed'})  
	   	&& {
	   		(_cT distance player < 3)
	   		&& (vehicle player == player) 
	   		&& (alive player)
	   	}"
	];


};
