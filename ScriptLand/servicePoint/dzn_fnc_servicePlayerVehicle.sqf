/*
  Should be runned on DRIVER of vehicle
  All vehicles should have "dzn_rrr_magazines" variable with list of magazines to reffer:
    (magazines VEHICLE)
*/

#define RRR_MESSAGE_TEXT_START		"Vehicle Servicing"
#define RRR_MESSAGE_TEXT_END		"Vehicle Servicing - Done"
#define RRR_DAMAGE_SERVICE_TIMEOUT	1
#define RRR_FUEL_SERVICE_TIMEOUT	1
#define RRR_WEAPON_SERVICE_TIMEOUT	1
#define RRR_WEAPON_FULL_TIMEOUT		5

#define RRR_DAMAGE_STEP			0.1
#define RRR_FUEL_STEP			0.1



private["_v"];
_v = vehicle player;
player setVariable ["dzn_rrr_servicing",true,true];
1000 cutText [RRR_MESSAGE_TEXT_START, "PLAIN"];

sleep 1;
_v engineOn false;
[_v] spawn { waitUntil { isEngineOn (_this select 0) }; player setVariable ["dzn_rrr_servicing",false,true]; };

while {player getVariable "dzn_rrr_servicing" && (damage _v > 0)} do {
  _v setDamage (damage _v - RRR_DAMAGE_STEP);
  sleep RRR_DAMAGE_SERVICE_TIMEOUT;
};
_v setDamage 0;

while {player getVariable "dzn_rrr_servicing" && (fuel _v < 1)} do {
  _v setFuel (fuel _v + RRR_FUEL_STEP);
  sleep RRR_FUEL_SERVICE_TIMEOUT;
};
_v setFuel 1;

sleep 3;
_v setVehicleAmmo 0.7;

sleep 3;
_v setVehicleAmmo 1;

1000 cutText [RRR_MESSAGE_TEXT_END, "PLAIN"];
player setVariable ["dzn_rrr_servicing",false,true];



#undef RRR_MESSAGE_TEXT_START
#undef RRR_MESSAGE_TEXT_END
#undef RRR_DAMAGE_SERVICE_TIMEOUT
#undef RRR_FUEL_SERVICE_TIMEOUT
#undef RRR_WEAPON_SERVICE_TIMEOUT
#undef RRR_WEAPON_FULL_TIMEOUT
#undef RRR_DAMAGE_STEP
#undef RRR_FUEL_STEP
