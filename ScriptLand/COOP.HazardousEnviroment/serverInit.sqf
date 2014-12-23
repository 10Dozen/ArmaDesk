// Будет запущено только на сервере

// Условия победы и поражения
dzn_task_launchPodDestroyed = false;
dzn_task_deactivated = false;
dzn_task_destroyed = false;
dzn_task_extracted = false;

dzn_task_deactivationLimit = 10;
publicVariable "dzn_task_deactivationLimit";


[] spawn {
	// Уничтожение ПУ
	waitUntil { time > 0 };
	waitUntil { !alive dzn_launchPod_1 && { !alive dzn_launchPod_2 } };
	
	dzn_task_launchPodDestroyed = true;

};
