waitUntil{!(isNil "BIS_fnc_init")};
enableSaving [false,false];

[] execVM "DAC\DAC_Config_Creator.sqf";

waitUntil { time > 0 };
[] execVM "serverMissionFlow.sqf";


