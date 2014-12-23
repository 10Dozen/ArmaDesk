// Global MP messenger: [ personOBJ, typeOfChatSTR, [messageSTR] ] call dzn_gm_sendMessage
dzn_gm_sendMessage = {
	/* 	Will show text message to All players via BIS_fnc_MP
		[ person, type of chat, message ] call dzn_gm_sendMessage
		0: PERSON	- unit who is called to message (message author - "name" or [west, "HQ"]): STRING or ARRAY
		1: TYPE		- type of chat ('vehicleChat', 'sideChat' etc.): "sideChat", STRING
		2: ARRAY	- text of the message and placeholders to format: [STRING, STRING, STRING...]		
		
		OUTPUT: True
	*/	
	private ["_messenger","_type","_text"];
	_messenger = _this select 0;	
	_this select 0;
	_type = _this select 1;
	_text = format (_this select 2);	

	call compile format ["
		[
			{
				%1 %2 %3;
			},
			'BIS_fnc_spawn',
			nil
		] spawn BIS_fnc_MP;",
		_messenger,
		_type,
		str(_text)	
	];

	true
};

// Completes given task
dzn_client_completeTaskNotif = {
	/* 	Will show complete task notification
		[ task, taskText ] call dzn_gm_completeTaskNotif
		0: TASK NAME	- task name: STRING
		1: TEXT			- text of notification, STRING

		OUTPUT: True
	*/
	if (isNil {_task}) exitWith { };	
	['TaskSucceeded',['',(_this select 1)]] call BIS_fnc_showNotification;
	(call compile (_this select 0)) setTaskState 'Succeeded';
};

// Global MP task completer: [ taskNameSTR, taskTextSTR ] call dzn_gm_completeTaskNotif
dzn_gm_completeTaskNotif = {
	/* 	Will show complete task notification via BIS_fnc_MP
		[ task, taskText ] call dzn_gm_completeTaskNotif
		0: TASK NAME	- task name: STRING
		1: TEXT			- text of notification, STRING

		OUTPUT: True
	*/	
	private ["_task","_text"];
	_task = _this select 0;
	_text = _this select 1;		
	
	if (isNil {_task}) exitWith {  };	
	[
		[_task, _text],
		"dzn_client_completeTaskNotif",
		nil
	] spawn BIS_fnc_MP;
	
	true
};
