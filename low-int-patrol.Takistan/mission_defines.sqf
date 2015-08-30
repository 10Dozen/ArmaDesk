hpzs = [];
for "_i" from 0 to 15 do {
	call compile format [
		"hpzs pushBack 'hpz_%1';"
		, _i
	];
};
