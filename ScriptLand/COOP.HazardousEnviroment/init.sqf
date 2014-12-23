// Добавить в init.sqf

dzn_c_desactivationTimeLimit = 30;  // Дефолтное значение таймера дезактивации
dzn_c_desactivationTimeReducer = 5; // Дефолтное значение уменьшения таймера после допроса каждого ученого
dzn_c_delayTime = 2;  // Дефолтное значения для waitUntil { time > dzn_c_delayTime };

[] execVM "dzn_commonFnc.sqf";
