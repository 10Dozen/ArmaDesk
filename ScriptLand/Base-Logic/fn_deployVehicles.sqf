/*
  [@GameLogic-Core, @Classname or @Array of classnames or @Considered array of classnames, @Randomize?] spawn dzn_fnc_deployVehicles
  
  0:  @GameLogic-Core (OBJECT) - gamelogic synchronized with other game logics, which are placeholders of vehicles to spawn.
  1:  
    @Classname (STRING)   - classname of vehicle to spawn
    @Array of classnames (ARRAY of STRINGS)   - classnames of vehicles to spawn (one by one)
    @Considered array of classnames (ARRAY of [@Classname, @Quantity])  - classnames and quantity of each classname should be spawned one by one
  2:  @Randomize? (BOOLEAN) - should we pick classnames one by one (false) or in random order (true)
*/

params["_core", "_list", ["_isRandom", false]];

{
  


} forEach (synchronizedObjects _core);
