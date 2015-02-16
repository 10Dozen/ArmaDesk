// Init of dzn_gear
private["_editMode"];

_editMode = true;

if (_editMode) then {
  // Add virtual arsenal action
  player addAction [
    "<t color='#00B2EE'>Open Virtual Arsenal</t>",
    "['Open',true] spawn BIS_fnc_arsenal;"
  ];
  
  // Add get gear action

};


