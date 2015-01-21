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
	   	(!isNil {cursorTarget getVariable '%ПЕРМЕННАЯ ТУТ%'})  // Если есть на объекте какаято модная переменная, то ищем сначала ее
	   	&& (_cT distance _this < 3)
	   	&& {
	   		(
	   			(_cT isKindOf "%CLASSNAME")		// Проверяем что принадлежит одному из класснеймов СВУ
	   			|| (_cT isKindOf "%CLASSNAME")
	   			|| (_cT isKindOf "%CLASSNAME")
	   		)
	   		&& (vehicle _this == _this)  // Игрок не в мащиге
	   		&& (alive _this)	// Игрок жив
	   	}"
	];


};
