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
	var slotsA = form.addSectionHeaderItem().setTitle("dzn_slotsA").setHelpText("!ALPHA | [Alpha] SL | [Alpha] Rifleman | !BRAVO | [Bravo] SL | [Bravo] Rifleman");
	var slotsB = form.addSectionHeaderItem().setTitle("dzn_slotsB").setHelpText("!CHARLIE | [Charlie] SL | [Charlie] Rifleman | !DELTA | [Delta] Operator | [Delta] Rifleman");
	var slotsC = form.addSectionHeaderItem().setTitle("dzn_slotsC").setHelpText("!ECHO | [Echo] SL | [Echo] Rifleman | !FOXTROT | [Foxtrot] Operator | [Foxtrot] Rifleman");
	var slotsD = form.addSectionHeaderItem().setTitle("dzn_slotsD").setHelpText("!GOLF | [Golf] SL | [Golf] Rifleman | !INDIA | [India] Operator | [India] Rifleman");

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
			sectionNamesMasks.push("bSIDEC");
			sectionNamesMasks.push("sSIDEC: Слоттинг");
			sectionNamesMasks.push("сSIDEC: Роль");
			if (sidesNames.length > 2) {
				sectionNamesMasks.push("bSIDED");
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

	var breakToSides = [];  	//Ids of pageBreaks
	var slottingSections = []	//ids of Slotting sections items
	var slottingChoices = [];  	//ids of Slotting choices items
	var idName = 0; 		//id of name section
	var idOverall = 0;
	
	for (var i = 0; i < sectionNamesMasks.length; i++) {
		var name = sectionNamesMasks[i];
		var itemName = ''; //item displayed names
			
		// Set name to sides
		if (name.substring(1,5) == 'SIDE') {
			var sideNameToReplace
			switch (name.substring(5,6)) {
				case "A":
					sideNameToReplace = sidesNames[0];
					break;
				case "B":
					sideNameToReplace = sidesNames[1];
					break;
				case "C":
					sideNameToReplace = sidesNames[2];
					break;
				case "D":
					sideNameToReplace = sidesNames[3];
					break;
			}
			itemName = sideNameToReplace + name.substring(6, name.length);  // Replace placeholder
		} else {
			itemName = name.substring(1,name.length);  // Name without changes
		}
		
		if (debug) {Logger.log('------------->\ni %s and name is %s -- itemName is %s', i.toString(), name, itemName);}
		
		//Item names: i - img, t - text info, b - breakpage, s - slotting section, c - multi choice
		var itemType = name.substring(0,1);
		switch (itemType) {
			case "i":
				var img = UrlFetchApp.fetch('http://cs608928.vk.me/v608928222/5f5f/MQqIEc6_iKY.jpg');
				form.addImageItem().setTitle(itemName).setImage(img).setAlignment(FormApp.Alignment.CENTER);
				if (debug) {Logger.log('Image item');}
				break;
			case "t":
				form.addSectionHeaderItem().setTitle(itemName);
				if (debug) {Logger.log('Section item');}
				break;
			case "b":
				var item = form.addPageBreakItem();
				item.setGoToPage(FormApp.PageNavigationType.SUBMIT);
				breakToSides.push(item.getId()); 
				if (debug) {Logger.log('PageBreak item');}
				break;
			case "s":
				var item = form.addSectionHeaderItem();
				item.setTitle(itemName);        
				slottingSections.push(item.getId().toString());
				if (debug) {Logger.log('Slotting section item - %s and ids %s', itemName, item.getId().toString());}
				break;
			case "c":
				var item = form.addMultipleChoiceItem().setRequired(true);
				item.setTitle(itemName);
				slottingChoices.push(item.getId().toString());
            			if (debug) {Logger.log('Slotting choice item - %s and ids %s', itemName, item.getId().toString());}
            			break;
			case "p":
            			var item = form.addTextItem().setRequired(true)
				item.setTitle(itemName);
				idName = item.getId();
				break;
			case "o":
				var item = form.addSectionHeaderItem().setTitle(itemName);
				idOverall = item.getId().toString();
				if (debug) {Logger.log('Overall players info item');}
				break;
		}
	}
	
	//Linking 'Side choosing' to page break	
	if (mode == "T") {
		var sideChoice = form.getItemById(slottingChoices[0]).asMultipleChoiceItem();
		if (debug) {Logger.log('\n Side choice item id is %s',  slottingChoices[0]);}
		var choiceSideA, choiceSideB, choiceSideC, choiceSideD
		choiceSideA = sideChoice.createChoice(sidesNames[0], form.getItemById(breakToSides[0]).asPageBreakItem());	
		choiceSideB = sideChoice.createChoice(sidesNames[1], form.getItemById(breakToSides[1]).asPageBreakItem());
		if (breakToSides.length > 1) {
			choiceSideC = sideChoice.createChoice(sidesNames[2], form.getItemById(breakToSides[2]).asPageBreakItem());
			if (breakToSides.length > 2) {
				choiceSideD = sideChoice.createChoice(sidesNames[3], form.getItemById(breakToSides[3]).asPageBreakItem());	
				sideChoice.setChoices([choiceSideA, choiceSideB, choiceSideC, choiceSideD]);
			} else {
				sideChoice.setChoices([choiceSideA, choiceSideB, choiceSideC]);
			}
		} else {
			sideChoice.setChoices([choiceSideA, choiceSideB]);
		}
	}	
}

		
		
	
