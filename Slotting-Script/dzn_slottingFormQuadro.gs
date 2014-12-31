//
// Convert List to String or String to List (type = 'toString' and 'toList')
function dzn_convert(value, type) {
	var output = '';
	if (type == "toList") {
		output = value.split(" | ");
	} else {
		// Concetate string with delimeter
		function dzn_writeWithDelimeter(value, string) {
			var output = '';    
			if (string.length > 0) {
				output = string + " | " + value.toString();
			} else {
				output = value;        
			}
			return output.toString();
		}
		for (var i = 0; i < value.length; i++) {
			output = dzn_writeWithDelimeter(value[i], output);
		} 
	}
    
	return output;
}

//
// Will prepare empty form to use for slotting purposes
function dzn_preInitialize() {
	Logger.log("Pre-intialization...");
	var form = FormApp.getActiveForm();
  
	Logger.log("Clearing form and responses.");
	var items = form.getItems();
	for (var i = 0; i < items.length; i++) {
		form.deleteItem(items[i].getIndex()); 
	}
	form.deleteAllResponses();
  
	Logger.log("Adding items to enter sides and slots names.");
	var mode = form.addSectionHeaderItem().setTitle("dzn_MODE").setHelpText('COOP'); // COOP or TVT
	var sides = form.addSectionHeaderItem().setTitle("dzn_sides").setHelpText("BLUFOR | OPFOR | INDEP | CIV");
	var slots0 = form.addSectionHeaderItem().setTitle("dzn_slotsA").setHelpText("!ALPHA | [Alpha] SL | [Alpha] Rifleman | !BRAVO | [Bravo] SL | [Bravo] Rifleman");
	var slots1 = form.addSectionHeaderItem().setTitle("dzn_slotsB").setHelpText("!CHARLIE | [Charlie] SL | [Charlie] Rifleman | !DELTA | [Delta] Operator | [Delta] Rifleman");
	var slots2 = form.addSectionHeaderItem().setTitle("dzn_slotsC").setHelpText("!ECHO | [Echo] SL | [Echo] Rifleman | !FOXTROT | [Foxtrot] Operator | [Foxtrot] Rifleman");
	var slots3 = form.addSectionHeaderItem().setTitle("dzn_slotsD").setHelpText("!GOLF | [Golf] SL | [Golf] Rifleman | !INDIA | [India] Operator | [India] Rifleman");

	var ids = mode.getId().toString() 
	  + " | " + sides.getId().toString() 
	  + " | " + slotsA.getId().toString() 
	  + " | " + slotsB.getId().toString()
	  + " | " + slotsC.getId().toString() 
	  + " | " + slotsD.getId().toString();
  
	PropertiesService.getScriptProperties().setProperties({
		"ids" : ids
	}, true);
  
	Logger.log("Pre-initialized!");
}

//
// After form creator entered SIDE and SLOTS names for every SIDE, calling dzn_initialize
// INPUT: none | OUTPUT: none (write to ScriptProperties)
function dzn_initialize() {
	Logger.log("Intialization...");
	
	var debug = false;
	if (debug) {Logger.log('Debugging!');}
	
	var form = FormApp.getActiveForm();
	var properties = PropertiesService.getScriptProperties();	
	
	var ids = properties.getProperty("ids");
	ids = dzn_convert(ids, "toList");
	
	var mode	// mode of form - true - 2 sections, false - 1 section
	switch (form.getItemById(ids[0]).getHelpText().toLowerCase()) {
		case "coop":
			mode = "C";
			break;
		case "tvt":
			mode = "T";
			break
	}

	// Get edited SIDE and SLOTS names from preinitialized form
	var sidesNames = dzn_convert(form.getItemById(ids[1]).getHelpText(), "toList");
	if (debug) {Logger.log('Side names: %s', sidesNames);}
	
	// Saving SIDE and SLOTS names
	var sectionNamesMasks
	if (mode == "T") {
		sectionNamesMasks = [
			"iИзображение к миссии",
			"tМиссия",
			"oИгроки",
			"pНик в игре",
			"cСторона",
			"bSIDEA",
			"sSIDEA: Слоттинг",
			"cSIDEA: Роль",       
			"bSIDEB",
			"sSIDEB: Слоттинг",
			"cSIDEB: Роль"
		];
		
		if (sidesNames.length > 1) {
			sectionNamesMasks.push("sSIDEC: Слоттинг");
			sectionNamesMasks.push("сSIDEC: Роль");
			if (sidesNames.length > 2) {
				sectionNamesMasks.push("sSIDED: Слоттинг");
				sectionNamesMasks.push("сSIDED: Роль");	
			}
		};
	} else {
		sectionNamesMasks = [
			"iИзображение к миссии",
			"tМиссия",
			"sSIDEA: Слоттинг",			
			"pНик в игре",			
			"cSIDEA: Роль"
		];
	}
