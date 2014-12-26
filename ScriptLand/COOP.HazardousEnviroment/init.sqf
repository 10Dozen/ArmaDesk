// Добавить в init.sqf

dzn_c_desactivationTimeLimit = 30;  // Дефолтное значение таймера дезактивации (в минутах)
dzn_c_desactivationTimeReducer = 5; // Дефолтное значение уменьшения таймера после допроса каждого ученого (в минутах)
dzn_c_gpsPlacingTimeLimit = 20; // Дефолтное значение таймера установки ГПС маркера (в минутах)
dzn_c_delayTime = 2;  // Дефолтное значения для waitUntil { time > dzn_c_delayTime }; в секундах
dzn_c_specialistsDelayTime = 120; // Дефолтное значение перед проверкой наличия специалистов в секундах
dzn_c_strikeDelay = 3 * 60; //Дефолтное значение для удара по объекту
dzn_c_radioMan = [West, 'HQ']; //"голос" штаба
dzn_c_plagueZoneHeight = 25; // Высота воздействия "зараженной зоны"
