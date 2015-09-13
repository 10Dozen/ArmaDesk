// _this call dzn_fnc_aliveCounter
dzn_fnc_aliveCounter = {
	{ alive _x } count _this
};

// dzn_fnc_condCounter
dzn_fnc_condCounter = {
	call compile format [
		"{ %2 } count %1"
		, _this select 0
		, _this sekect 1
	];
};
