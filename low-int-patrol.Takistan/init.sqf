enableSaving [false,false];
tf_no_auto_long_range_radio = true;

 
#include "mission_defines.sqf";
#include "commonFunctions.sqf";

// Add to init.sqf
// 0: true or false - Edit mode activation, 1: true/false - is Server-side only
[false] execVM "dzn_gear\dzn_gear_init.sqf";

[] execVM "dzn_dynai\dzn_dynai_init.sqf";
