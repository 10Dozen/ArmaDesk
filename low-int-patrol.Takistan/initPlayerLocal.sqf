if (isNil "player_initialized") then {
	player_initialized = true;
	[player,3] call BIS_fnc_respawnTickets;
	
	// IED Check action
	player addAction [
		"<t color='#F2D55E'>Check for IED</t>"
		, {
			private["_ied"];
			_ied = cursorTarget;

			hintSilent "Checking...";
			player playMove "AinvPknlMstpSlayWrflDnon_medic";
			sleep 6;
			player switchMove "";
			
			if (alive player) then {
				switch (_ied getVariable "isIED") do {
					case 0: { hint "There is no IED."; };
					case 1: { hint "Disarmed IED found."; };
					case 2: { hint "Armed IED found!"; };
					case 3: { 
						hint "Armed IED found!";	
						if ( !(player getVariable "EODSpec") && floor(random 100) < 51 ) exitWith { 
							"HelicopterExploSmall" createVehicle (getPos _ied);
							deleteVehicle _ied;
						};
						_ied setVariable ["isIED", 2, true];
					};
				};
			};	
		}
		,[],3,false,false,"",
		"(vehicle player == player) 
		&& (player distance cursorTarget < 4) 
		&& ( cursorTarget getVariable ['isIED', -2] > -1 )"

	];

	if (!isNil { player getVariable "EODSpec" }) then {
		// IED Defuse action
		player addAction [
			"<t color='#b50015'>Defuse IED</t>"
			, {
				_ied = cursorTarget;

				hintSilent "Defusing...";
				player playMove "Acts_carFixingWheel";
				sleep 12;
				player switchMove "";
				if (alive player) then {
					hintSilent "Defused";
					_ied setVariable ["isIED", 1, true];
				};
			}
			,[],3,false,false,"",
			"(vehicle player == player) 
			&& (player distance cursorTarget < 4) 
			&& (player getVariable 'EODSpec')
			&& ( cursorTarget getVariable ['isIED', -2] == 2 )"
		];	
	};
	
	
	
	
	
};


