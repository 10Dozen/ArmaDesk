/*
  Should be runned on DRIVER of vehicle
  All vehicles should have "dzn_rrr_magazines" variable with list of magazines to reffer.
*/

#define   RRR_MESSAGE_TEXT_START      "Vehicle Servicing"
#define   RRR_MESSAGE_TEXT_END        "Vehicle Servicing - Done"

private["_v"];
_v = vehicle player;
player setVariable ["dzn_rrr_servicing",true,true];
1000 cutText ["Vehicle Servicing", "PLAIN"];

sleep 1;
_v engineOn false;
[_v] spawn { waitUntil { isEngineOn (_this select 0) }; player setVariable ["dzn_rrr_servicing",false,true]; };

while {player getVariable "dzn_rrr_servicing" && (damage _v > 0)} do {
  _v setDamage (damage _v - 0.1);
  sleep 1;
};
_v setDamage 0;

while {player getVariable "dzn_rrr_servicing" && (fuel _v < 1)} do {
  _v setFuel (fuel _v + 0.1);
  sleep 1;
};

if (!isNil { _v getVariable "dzn_rrr_magazines" }) then {
  {
    if !(_x in magazines _v) then {
      _v addmagazine _x;
      sleep 1;
    };
  } foreach (_v getVariable "dzn_rrr_magazines");
} else {
  sleep 5;
};
_v setVehicleAmmo 1;

1000 cutText ["Vehicle Servicing - Done", "PLAIN"];
player setVariable ["dzn_rrr_servicing",false,true];
