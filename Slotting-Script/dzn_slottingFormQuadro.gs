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
	var mode = form.addSectionHeaderItem().setTitle("FORM MODE").setHelpText('COOP'); // COOP or TVT
	var sides = form.addSectionHeaderItem().setTitle("AVAILABLE SIDES").setHelpText("BLUFOR | OPFOR | INDEP | CIV");
	var slotsA = form.addSectionHeaderItem().setTitle("SLOTS FOR SIDE 1").setHelpText("!ALPHA | [Alpha] SL | [Alpha] Rifleman | !BRAVO | [Bravo] SL | [Bravo] Rifleman");
	var slotsB = form.addSectionHeaderItem().setTitle("SLOTS FOR SIDE 2").setHelpText("!CHARLIE | [Charlie] SL | [Charlie] Rifleman | !DELTA | [Delta] Operator | [Delta] Rifleman");
	var slotsC = form.addSectionHeaderItem().setTitle("SLOTS FOR SIDE 3").setHelpText("!ECHO | [Echo] SL | [Echo] Rifleman | !FOXTROT | [Foxtrot] Operator | [Foxtrot] Rifleman");
	var slotsD = form.addSectionHeaderItem().setTitle("SLOTS FOR SIDE 4").setHelpText("!GOLF | [Golf] SL | [Golf] Rifleman | !INDIA | [India] Operator | [India] Rifleman");

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
	var sidesCount = sidesNames.length;
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
		
		function dzn_init_addSections(sideName) {
			sectionNamesMasks.push("b" + sideName);
			sectionNamesMasks.push("s" + sideName + ": Слоттинг");
			sectionNamesMasks.push("с" + sideName + ": Роль");
		}
		
		if (sidesCount > 2) {
			dzn_init_addSections("SIDEC");
			if (sidesCount > 3) {
				dzn_init_addSections("SIDED");
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
		
		if (sidesCount > 2) {
			choiceSideC = sideChoice.createChoice(sidesNames[2], form.getItemById(breakToSides[2]).asPageBreakItem());
			if (sidesCount > 3) {
				choiceSideD = sideChoice.createChoice(sidesNames[3], form.getItemById(breakToSides[3]).asPageBreakItem());	
				sideChoice.setChoices([choiceSideA, choiceSideB, choiceSideC, choiceSideD]);
			} else {
				sideChoice.setChoices([choiceSideA, choiceSideB, choiceSideC]);
			}
		} else {
			sideChoice.setChoices([choiceSideA, choiceSideB]);
		}
	}
	

	
	function dzn_init_getHeaderSlotsIds(names) {
		var output = [];
		var names = names.split(" | ");
		for (var i = 0; i < names.length; i++) {
			if (names[i].substring(0,1) == "!") {
				names[i] = "\n" + names[i].substring(1,names[i].length) + "\n";
				output.push(i.toString());
			}		
		}		
		return [dzn_convert(names, "toString"), dzn_convert(output, "toString")]	
	}
	
	// Update headers names and get ids of SQUADNAMES and remove SQUADNAMES ! marker
	var slotsNames = ["0","0","0","0"];
	var slotsHeads = ["0","0","0","0"];
	var slotList, slotParsed;
	
	for (var i = 0; i < sidesCount; i++) {
		slotList = form.getItemById(ids[i + 2]).getHelpText();
		slotParsed = dzn_init_getHeaderSlotsIds(slotsNames[i]);
		slotsNames[i] = slotParsed[0];
		slotsHeads[i] = slotParsed[1];
	}
	
	// WRITE TO PROPERTIES
	if (debug) {Logger.log('Writing properties');}
	
	properties.setProperties({
		"idName" : idName.toString(),								// 0 ID of Name item
		"idSections" : dzn_convert(slottingSections, "toString"),	// 1 IDs of Section for every side
		"idChoices" : dzn_convert(slottingChoices, "toString"),		// 2 IDs of Choices for every side		
		
		"usedSlotsSideA" : "0",										// 3 Used slots for side A
		"usedSlotsSideB" : "0",										// 4 Used slots for side B
		"usedSlotsSideC" : "0",										// 5 Used slots for side C
		"usedSlotsSideD" : "0",										// 6 Used slots for side D
		
		"usedNicksSideA" : "0",										// 7 Used nicknames for side A
		"usedNicksSideB" : "0",										// 8 Used nicknames for side B
		"usedNicksSideC" : "0",										// 9 Used nicknames for side C
		"usedNicksSideD" : "0",										// 10 Used nicknames for side D		
		
		"sides" : dzn_convert(sidesNames, "toString"), 				// 11 Names of sides
		
		"slotsSideA" : slotsNames[0],									// 12 Original names of slots for side A
		"slotsSideB" : slotsNames[1],									// 13 Original names of slots for side B
		"slotsSideC" : slotsNames[2],									// 14 Original names of slots for side C
		"slotsSideD" : slotsNames[3],									// 15 Original names of slots for side D
		
		"slotsHeadsSideA" : slotsHeads[0],						// 16 IDs of headers in slots names for side A
		"slotsHeadsSideB" : slotsHeads[1],						// 17 IDs of headers in slots names for side B
		"slotsHeadsSideC" : slotsHeads[2],						// 18 IDs of headers in slots names for side C
		"slotsHeadsSideD" : slotsHeads[3],						// 19 IDs of headers in slots names for side D
		
		"idOverall" : idOverall,									// 20 ID of Overall players names section
		"mode" : mode  												// 21 mode
	}, true);

	// Deleting blocks with SIDE and SLOTS settings
	if (debug) {Logger.log('Deleting service sections');}
	for (var i = 0; i < ids.length; i++) {
		form.deleteItem(form.getItemById(ids[i]).getIndex());
	}
	Logger.log("Initialized");
	// Running save trigger to update form
	
}

		
		
	
