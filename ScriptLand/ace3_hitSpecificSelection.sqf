/*
	[ @Unit, @Selection, @Damage, @Firer, @Projectile, @HitPointIndex(?) ] call ace_medical_fnc_handleDamage
	
	@Unit - target unit (OBJECT);
	@Selection - head,hands, etc:
		"hand_l"
		"hand_r"
		"leg_l"
		"leg_r"
		"head"
	 	"body"
	 @Damage - amount of damage to given selection (from 0 to 1)
	 @Firer - may be objNull;
	 @Projectile - bullet name (may be "")
	 @HitPointIndex (-1 for structural) <NUMBER> - dunno
*/


[myUnit, "hand_l", 0.9, objNull, "", 0.5] call ace_medical_fnc_handleDamage;
