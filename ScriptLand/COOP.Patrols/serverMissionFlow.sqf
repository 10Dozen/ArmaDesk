// Choose mission areas (name -> text (location)):
_locationsForSeize = nearestLocations [ [0,0,0], ["NameCity","NameCityCapital"], 20000];
_locationsForRecon = nearestLocations [ [0,0,0], ["NameCity","NameVillage"], 20000];

dzn_seizeLocations = [];   // Locations for Seize mission
dzn_reconLocations = [];   // Locations for Recon mission

// 2 for Seize
for "_i" from 0 to 1 do {
	_loc = _locationsForSeize select round(random(count _locationsForSeize - 1));
	dzn_seizeLocations = dzn_seizeLocations + [_loc];
	_locationsForSeize = _locationsForSeize - [_loc];
	if (_loc in _locationsForRecon) then {
		_locationsForRecon = _locationsForRecon - [_loc];
	};
};

// 3 for Recon
for "_i" from 0 to 2 do {
	_loc = _locationsForRecon select round(random(count _locationsForRecon - 1));
	dzn_reconLocations = dzn_reconLocations + [_loc];
	_locationsForRecon = _locationsForRecon - [_loc];
};

dzn_reconToSeizeLocation = dzn_reconLocations call BIS_fnc_selectRandom;
dzn_reconLocations = dzn_reconLocations - [dzn_reconToSeizeLocation];

//
// Spawning DAC camps and Areas
//

dzn_createDACZone = {
	// [posX, posY, x, y, isCamp, zoneName
  
	_trg = createTrigger ["EmptyDetector", (_this select 0), (_this select 1)];
	_trg setTriggerArea [(_this select 2), (_this select 3), 0, false];
	_trg setTriggerActivation ["LOGIC", "PRESENT", true];
  
	if (_this select 4) then {
		_trg setTriggerStatements [
			"true", 
			str(SEIZE_AREA_SPAWN((_this select 5),(_this select 2),(_this select 3))), 
			""
		]; 
	} else {
	  	_trg setTriggerStatements [
			"true", 
			str(SEIZE_CAMP_SPAWN((_this select 5),(_this select 2),(_this select 3))), 
			""
		];
	};
};

{

} forEach (dzn_seizeLocations + [dzn_reconToSeizeLocation]);
/*
	dac = ["zCamp",[1,0,0],[5,3,50,10],[3,3,30,10],[1,1,5,5][2,4,50,0,100,5],[0,0,0,0]]
		zCamp - название зоны. должно совпадать с названием триггера
		1,0,0 - ID зоны, Статус зоны (0 - активна со старта, 1 - неактивна со старта, нужно активировать позже), 0 - значиение для DAC events
		5,3,50,10 - создает 5 групп пехоты размером 3, делает в зоне 50 пехотных вейпоинтов и дает каждой группе по 10.
		то же самое с двумя следующими массивами (колесный трвнспорт и броня)
		КЭМПЫ
		2,4,50,0,100,4 - создает в зоне 2 кемпа, размер групп, спавнящихся в кемре - 4, радиус патруля кемпа - 50 метров, 100% вероятность респавна, 5 респавнов на кемп
		16:52:24	
		да, в онАкт
		Да, размер зоны = размер триггера
		и форма
		последний массив - зона принадлежит 0 (опфор), корфиг юнитов зоны 0 (опфор), настройка скиллов 0, конфиг кемпов 0
*/
//
// 
//
