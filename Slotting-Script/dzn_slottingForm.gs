// THIS PIECE OF GOOGLE SCRIPT IS UNDER HEAVY AND WILD LICENSE OF DOZEN, FOR EXAMPLE
// © - CHECK THIS COPYRIGHT SIGN. SO COPY, MUCH RIGHT.
//
// MAY BE NOT SAFE FOR WORK, FOR EXAMPLE

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
	var sides = form.addSectionHeaderItem().setTitle("dzn_sides").setHelpText("BLUFOR | OPFOR");
	var slotsA = form.addSectionHeaderItem().setTitle("dzn_slotsA").setHelpText("!ALPHA | [Alpha] SL | [Alpha] Rifleman | !BRAVO | [Bravo] SL | [Bravo] Rifleman");
	var slotsB = form.addSectionHeaderItem().setTitle("dzn_slotsB").setHelpText("!CHARLIE | [Charlie] SL | [Charlie] Rifleman | !DELTA | [Delta] Operator | [Delta] Rifleman");

	var ids = mode.getId().toString() + " | " + sides.getId().toString() + " | " + slotsA.getId().toString() + " | " + slotsB.getId().toString();
  
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
	switch (form.getItemById(ids[0]).getHelpText()) {
		case "COOP":
		case "coop":
		case "Coop":
			mode = "C";
			break;
		case "TVT":
		case "TvT":
		case "Tvt":
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
	} else {
		sectionNamesMasks = [
			"iИзображение к миссии",
			"tМиссия",
			"sSIDEA: Слоттинг",			
			"pНик в игре",			
			"cSIDEA: Роль"
		];
	}
		
	var breakToSides = [];  //Ids of pageBreaks
	var slottingSections = [];  //ids of Slotting sections items
	var slottingChoices = [];  //ids of Slotting choices items
	var idName = 0;  //id of name section
	var idOverall = 0;
  
	for (var i = 0; i < sectionNamesMasks.length; i++) {
		var name = sectionNamesMasks[i];
		var itemName = ''; //item displayed names
			
		// Set name to sides
		if (name.substring(1,6) == 'SIDEA') {
			itemName = sidesNames[0] + name.substring(6, name.length);  // Replace placeholder
		} else {
			if  (name.substring(1,6) == 'SIDEB') {
				itemName = sidesNames[1] + name.substring(6, name.length); // Replace placeholder
			} else {
				itemName = name.substring(1,name.length);  // Name without changes
			}
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
		var choiceSideA = sideChoice.createChoice(sidesNames[0], form.getItemById(breakToSides[0]).asPageBreakItem());	
		var choiceSideB = sideChoice.createChoice(sidesNames[1], form.getItemById(breakToSides[1]).asPageBreakItem());
		sideChoice.setChoices([choiceSideA, choiceSideB]);
	}

	// Update headers names and get ids of SQUADNAMES and remove SQUADNAMES ! marker
	var slotsSideA = form.getItemById(ids[2]).getHelpText();
	var slotsSideB = '0';
	if (mode == "T") { slotsSideB = form.getItemById(ids[3]).getHelpText(); }	
	
	function dzn_getHeaderSlotsIds(names) {
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
	
	var slotsHeadsSideA, slotsParts
	var slotsHeadsSideB  = '0';
	slotsParts = dzn_getHeaderSlotsIds(slotsSideA);
	slotsSideA = slotsParts[0];
	slotsHeadsSideA = slotsParts[1];
	if (mode == "T") {
		slotsParts = dzn_getHeaderSlotsIds(slotsSideB);
		slotsSideB = slotsParts[0];
		slotsHeadsSideB = slotsParts[1];
	}
	
	// WRITE TO PROPERTIES
	if (debug) {Logger.log('Writing properties');}
	
	properties.setProperties({
		"idName" : idName.toString(),								// 0 ID of Name item
		"idSections" : dzn_convert(slottingSections, "toString"),	// 1 IDs of Section for every side
		"idChoices" : dzn_convert(slottingChoices, "toString"),		// 2 IDs of Choices for every side		
		"usedSlotsSideA" : "0",										// 3 Used slots for side A
		"usedSlotsSideB" : "0",										// 4 Used slots for side B
		"usedNicksSideA" : "0",										// 5 Used nicknames for side A
		"usedNicksSideB" : "0",										// 6 Used nicknames for side B
		"sides" : dzn_convert(sidesNames, "toString"), 				// 7 Names of sides
		"slotsSideA" : slotsSideA,									// 8 Original names of slots for side A
		"slotsSideB" : slotsSideB,									// 9 Original names of slots for side B
		"slotsHeadsSideA" : slotsHeadsSideA,						// 10 IDs of headers in slots names for side A
		"slotsHeadsSideB" : slotsHeadsSideB,						// 11 IDs of headers in slots names for side B
		"idOverall" : idOverall,									// 12 ID of Overall players names section
		"mode" : mode  											// 13 mode
	}, true);

	// Deleting blocks with SIDE and SLOTS settings
	if (debug) {Logger.log('Deleting service sections');}
	for (var i = 0; i < ids.length; i++) {
		form.deleteItem(form.getItemById(ids[i]).getIndex());
	}
	Logger.log("Initialized");
	// Running save trigger to update form
    dzn_onSave();
}


//
// Return data from ScriptProperties
// INPUT: none | OUTPUT: array of script properties
function dzn_getDocumentData(form) {
// 0 ID of Name item // string
// 1 IDs of Section for every side // array
// 2 IDs of Choices for every side // array
// 3 Used slots for side A // string
// 4 Used slots for side B // string
// 5 Used nicknames for side A // string
// 6 Used nicknames for side B // string
// 7 Names of sides // string
// 8 Original names of slots for side A // string
// 9 Original names of slots for side B // string
// 10 IDs of headers in slots names for side A // string
// 11 IDs of headers in slots names for side B // string
// 12 ID of Overall players names section // string/int
// 13 mode // string/bool

	var debug = false;
	if (debug) {Logger.log('    Running dzn_getDocumentData');}
	var output = [];
	var data = PropertiesService.getScriptProperties();

	function dzn_assignValue(value) {
		var list = [];
		if (value != 0) {list = dzn_convert(value, "toList");}		
		return list
	}
	var orderList = [
		"idName","idSections","idChoices",
		"usedSlotsSideA","usedSlotsSideB","usedNicksSideA","usedNicksSideB",
		"sides","slotsSideA","slotsSideB","slotsHeadsSideA","slotsHeadsSideB",
        "idOverall", "mode"
    ];
	
	var lists = data.getKeys();
	for (var i = 0; i < lists.length; i++) {
		var key = lists[i];	
		var value = data.getProperty(key);		
		var j = orderList.indexOf(key);		
		//Logger.log('%s - %s', key, value);
		if (key != 'mode') {
			output[j] = dzn_assignValue(value);
		} else {
			output[j] = value;
		}
	}
	if (debug) {Logger.log('    << End of dzn_getDocumentData');}
	return output
}

//
// Checks last 4 responses - updates or add nickname's slot
// INPUT: 	[form, idName, sides, idChoices, usedSlotsSideA, usedSlotsSideB, usedNicksSideA, usedNicksSideB, mode]
// OUTPUT: 	[0 usedNicksSideA, 1 usedNicksSideB, 2 usedSlotsSideA, 3 usedSlotsSideB];
function dzn_checkResponses(form, idName, sides, idChoices, usedSlotsSideA, usedSlotsSideB, usedNicksSideA, usedNicksSideB, mode) {
	if (false) {
		var form = FormApp.getActiveForm();       
		var idName = PropertiesService.getScriptProperties().getProperty('idName');
		var idChoices = PropertiesService.getScriptProperties().getProperty('idChoices').split(" | ");
		var usedSlotsSideA = PropertiesService.getScriptProperties().getProperty('usedSlotsSideA').split(" | ");
		var usedSlotsSideB = PropertiesService.getScriptProperties().getProperty('usedSlotsSideB').split(" | ");
		var usedNicksSideA = PropertiesService.getScriptProperties().getProperty('usedNicksSideA').split(" | ");
		var usedNicksSideB = PropertiesService.getScriptProperties().getProperty('usedNicksSideB').split(" | ");
		var sides =  PropertiesService.getScriptProperties().getProperty('sides').split(" | ");
	}
  
	var debug = false;
	if (debug) {Logger.log('    Running dzn_checkResponses');}
  
	var formResponses = form.getResponses();   
	var responsesToCheck = [];  
	var iMax = 4;
	if (formResponses.length < 4) {iMax = formResponses.length + 1;};
	var duplicates = [];
    
	for (var i = 1; i < iMax; i++) {
		var response = formResponses[formResponses.length-(i)];  
		// Get form response
		var sideResponse, slotResponse, usedSlots, usedNicks, usedSlotsOpposite, usedNicksOpposite
		var nickResponse = response.getResponseForItem(form.getItemById(idName));
		
		if (mode == "T") {
			// if TVT: Assign slots/nicks of the chosen side and opposite side (for removing from)
			sideResponse = response.getResponseForItem(form.getItemById(idChoices[0]));	
			if (sides.indexOf(sideResponse.getResponse()) == 0) {
				slotResponse = response.getResponseForItem(form.getItemById(idChoices[1]));
				usedSlots = usedSlotsSideA;
				usedNicks = usedNicksSideA;
				usedSlotsOpposite = usedSlotsSideB;
				usedNicksOpposite = usedNicksSideB;
			} else {
				slotResponse = response.getResponseForItem(form.getItemById(idChoices[2]));
				usedSlots = usedSlotsSideB;
				usedNicks = usedNicksSideB;
				usedSlotsOpposite = usedSlotsSideA;
				usedNicksOpposite = usedNicksSideA;
			}	
		} else {
			// if NOT TVT: assign slots and nicks 
			slotResponse = response.getResponseForItem(form.getItemById(idChoices[0]));
			usedSlots = usedSlotsSideA;
			usedNicks = usedNicksSideA;	
		}
		
		// Get actual values of response NICK and SLOT
		var nick = nickResponse.getResponse();
		var slot = slotResponse.getResponse();		
		if (debug) {Logger.log("Nick -  %s, slot - %s", nick, slot);}
		
		// Id of NICK at the side's usedNick/Slot array
		var nickIndex = usedNicks.indexOf(nick);
		// Check If nick already was met during current check
		if (duplicates.indexOf(nick) > -1) {
			if (debug) {Logger.log("Duplicate of %s", nick);}
		} else {
			duplicates.push(nick);
			if (debug) {Logger.log('Index %s', nickIndex.toString()) };
			// Update or Add nick/slot to side's usedSlot/Nick array
			if (nickIndex > -1) {
				if (slot != 'Без слота') {
					usedSlots[nickIndex] = slot;
				} else {
					usedNicks.splice(nickIndex,1);
					usedSlots.splice(nickIndex,1);
				}
			} else {
				usedNicks.push(nick);
				usedSlots.push(slot);
				// If TVT - remove nick/slot from opposite side's arrays (if had been added earlier)
				if (mode == "T") {
					var idToRemove = usedNicksOpposite.indexOf(nick);
					if ( idToRemove > -1 ) {
						usedNicksOpposite.splice(idToRemove,1);
						usedSlotsOpposite.splice(idToRemove,1);
					}
				}
			}
		} 
	}
	// Update ScriptProperties by new usedNick/Slot values for each side
	PropertiesService.getScriptProperties().setProperties({
		"usedSlotsSideA" : dzn_convert(usedSlotsSideA, "toString"),				// Used slots for side A
		"usedSlotsSideB" : dzn_convert(usedSlotsSideB, "toString"),				// Used slots for side B
		"usedNicksSideA" : dzn_convert(usedNicksSideA, "toString"),				// Used nicknames for side A
		"usedNicksSideB" : dzn_convert(usedNicksSideB, "toString")				// Used nicknames for side B       
	}, false); 
	
	if (debug) { Logger.log ('OUT:\n%s\n%s\n%s\n%s',usedNicksSideA, usedSlotsSideA, usedNicksSideB, usedSlotsSideB); }; 
	if (debug) {Logger.log('    << End of dzn_checkResponses');}
	
	return [usedNicksSideA, usedNicksSideB, usedSlotsSideA, usedSlotsSideB]
}

//
// Get updated info for SLOTTING section and AVAILABLE SLOTS for side (according given slots/usedSlots)
// INPUT:	form, usedNicks, usedSlots, slots, headers
// OUTPUT:	0 sectionInfoOutput, 1 slots
function dzn_getUpdatedInfo(form, usedNicks, usedSlots, slots, headers) {
	var debug = false;
	if (debug) {
		Logger.log('    Running dzn_getUpdatedInfo');
		if (false) {
			var form = FormApp.getActiveForm();       
			var properties = PropertiesService.getScriptProperties();
			
			var idSections = (properties.getProperty('idSections')).split(" | ");
			var idSection = idSections[0];
			var idChoices = (properties.getProperty('idChoices')).split(" | ");
			var idChoice = idChoices[0];
			
			var usedSlots = ["Rifleman"];
			var usedNicks = ["Dozen"];
			var slots = properties.getProperty('slotsSideA').split(" | ");
			var headers = properties.getProperty('slotsHeadsSideA').split(" | ");	
		}
	}
	
	// Get ids of names which are not available for choosing at the slots item
	var excludeId = headers;
	if (debug) { Logger.log("Exclude Ids are %s.", excludeId); }
	
	// Fill section info with ALL original slots name
	var sectionInfo = [];
	for (var i = 0; i < slots.length; i++) {
		sectionInfo.push(slots[i]);
	}

	// Update section info according to already used slots
	for (var i = 0; i < usedSlots.length; i++) {
		var slotIndex = sectionInfo.indexOf(usedSlots[i]);
		if (slotIndex > -1) {
			excludeId.push(slotIndex);
			sectionInfo[slotIndex] = "✔ " + sectionInfo[slotIndex] + " -- " + usedNicks[i]; 
			if (debug) { Logger.log('for step %s __ slot index is %s and value %s\n%s', i.toString(), slotIndex.toString(), usedSlots[i], sectionInfo[slotIndex]) };
		} else {
			if (debug) { Logger.log('for step %s __ skipped', i.toString())};       
		}
	}
	var sectionInfoOutput = sectionInfo.join("\n");
	
	if (debug) { Logger.log("Clearing slots from used slots."); }  
    
	// Define of sorting conditions
	function dzn_sortCondAsc(a,b) {
		return (a-b);
	};
	
	// Deleting used slots
	excludeId = excludeId.sort( dzn_sortCondAsc );
	if (debug) { Logger.log("Exclude Ids are %s.", excludeId); }    
	for (var i = 0; i < excludeId.length; i++) {
		if (debug) { Logger.log("Loop step %s. Exclude id %s.", i.toString(), excludeId[i].toString()); }
		slots.splice(excludeId[i]-i, 1);        
	}

	if (debug) {Logger.log('    << End of dzn_getUpdatedInfo');}

	return [sectionInfoOutput, slots];
}


//
// Main flow
//
function dzn_onSave() {
	var debug = false;
	if (debug) {Logger.log("   Running dzn_onSave");}
	var form = FormApp.getActiveForm();  
  
	// Get IDS and NAMES
	if (debug) {Logger.log("Getting document script properties");}
	var data = dzn_getDocumentData();
// MAPPING OF SCRIPT PROPERTIES DATA
// 0 ID of Name item // string
// 1 IDs of Section for every side // array
// 2 IDs of Choices for every side // array
// 3 Used slots for side A // string
// 4 Used slots for side B // string
// 5 Used nicknames for side A // string
// 6 Used nicknames for side B // string
// 7 Names of sides // string
// 8 Original names of slots for side A // string
// 9 Original names of slots for side B // string
// 10 IDs of headers in slots names for side A // string
// 11 IDs of headers in slots names for side B // string
// 12 ID of Overall players names section // string/int
// 13 mode // string/bool

	// Get Mode of form
	var mode = data[13];
	var roleItem
 	if (mode == "C") {       
		roleItem = form.getItemById(data[2][0]);
		roleItem.setHelpText("Обработка... Обновите страницу через несколько секунд.");
	}
	
	// Get Resonses
	//Will return: 0 - usedNicnamese side A, 1 - used nicknames side B, 2 - used slots side A,  3 - used slots side B
	var updatedItems = dzn_checkResponses(
		form, 
		data[0], //nickname item
		data[7], //sides
		data[2], //choices ids
		data[3], //used slots side A
		data[4], //used slots side B
		data[5], //used nicknames side A
		data[6],  //used nicknames side B
		mode
	); 
	
	var overallInfo = '';
	// Get Updated Info and Update
	var iMax = 1;
	if (mode == "T") { iMax = 2; }
	for (var i = 0; i < iMax; i++) {
		//Get Update Info
		//(form, idSection, idChoice, usedNicks, usedSlots, slots, headers) 
		var idChoice = data[2][0];
		if (mode == "T") { idChoice = data[2][1+i]; }
		
		var updateSideInfo = dzn_getUpdatedInfo(
			form, 			
            updatedItems[i],  //usedNicks
            updatedItems[2+i], // usedSlots
			data[8+i], //slots
			data[10+i] //headers
		);

		//Update info
		var availableSlots = updateSideInfo[1];
		if (debug) {Logger.log("Updating SECTION and SLOTS for sideIndex %s", i.toString());}
		var itemSection = form.getItemById(data[1][i]);
        if (debug) {Logger.log(updateSideInfo[0]);}
		itemSection.setHelpText(updateSideInfo[0]);
		
		// Update slots
		var itemSlots = form.getItemById(idChoice);
		availableSlots.push("Без слота");
		itemSlots.asMultipleChoiceItem().setChoiceValues(availableSlots);

		if (mode == "T") {
			overallInfo = overallInfo + data[7][i] + "\n" + updatedItems[i].join(", ") + "\n\n";
		}
	}
  
	// Update section with total player participated
	if (mode == "T") {
		var overallItem = form.getItemById(data[12]);
		overallItem.setHelpText(overallInfo);
	}

	if (mode == "C") {
		roleItem.setHelpText("Выберите одну из доступных ролей из списка ниже.");
	}
	
	if (debug) {Logger.log('    << End of dzn_onSave');}
	if (debug) { Logger.log("End of script"); }  
}
