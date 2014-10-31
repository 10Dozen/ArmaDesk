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
	var mode = form.addSectionHeaderItem().setTitle("dzn_FORM MODE").setHelpText('COOP'); // COOP or TVT
	var sides = form.addSectionHeaderItem().setTitle("dzn_NAMES OF THE OPPOSING SIDES").setHelpText("BLUFOR | OPFOR");
	var slotsA = form.addSectionHeaderItem().setTitle("dzn_SLOTS FOR SIDE 1").setHelpText("!ALPHA | [Alpha] SL | [Alpha] Rifleman | !BRAVO | [Bravo] SL | [Bravo] Rifleman");
	var slotsB = form.addSectionHeaderItem().setTitle("dzn_SLOTS FOR SIDE 2").setHelpText("!CHARLIE | [Charlie] SL | [Charlie] Rifleman | !DELTA | [Delta] Operator | [Delta] Rifleman");
	var passcodes = form.addSectionHeaderItem().setTitle("dzn_PASSCODES").setHelpText("QW21 | 34RF | IKLO | 09OI | NBZX | 0112");

	var ids = dzn_convert([
			mode.getId().toString(), 
			sides.getId().toString(), 
			slotsA.getId().toString(), 
			slotsB.getId().toString(), 
			passcodes.getId().toString()
		],  "toString");
  
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
    
	// Get allowed passcodes
	var passcodes = form.getItemById(ids[4]).getHelpText();
	// Get edited SIDE and SLOTS names from preinitialized form
	var sidesNames = dzn_convert(form.getItemById(ids[1]).getHelpText(), "toList");
	if (debug) {Logger.log('Side names: %s', sidesNames);}

	// Saving SIDE and SLOTS names
	var sectionNamesMasks
	if (mode == "T") {	
		sectionNamesMasks = [
			"iИзображение к миссии",
			"tМиссия",
			"lИгроки",
			"pНик в игре",
			"aВероятность присутствия",
			"xПасскод",
			"oСторона",
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
			"aВероятность присутствия",
			"xПасскод",
			"cSIDEA: Роль"
		];
	}
		
	var breakToSides = [];  //Ids of pageBreaks
	var slottingSections = [];  //ids of Slotting sections items
	var slottingChoices = [];  //ids of Slotting choices items
	var idName = 0;  //id of name section
	var idOverall = 0;
    var idPrecense = 0;
	var idPasscode = 0;
	var idSidechoice = 0;
  
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
			//Functional items
			case "a":
				var item = form.addScaleItem().setTitle(itemName).setBounds(1, 7).setLabels('Не уверен', 'Буду');
				idPrecense = item.getId();
				if (debug) {Logger.log('Chance of presence item');}
				break;
			case "p":
            	var item = form.addTextItem().setRequired(true).setTitle(itemName);
            	idName = item.getId().toString();
            	break;				
			case "l":
				var item = form.addSectionHeaderItem().setTitle(itemName);
				idOverall = item.getId().toString();
				if (debug) {Logger.log('Overall players info item');}
				break;
			case "x":
				var item = form.addTextItem().setTitle(itemName);
				idPasscode = item.getId().toString();
				break;
			case "o":
				var item = form.addMultiChoiseItem.setTitle(itemName);
				idSidechoice = item.getId();
				break;
			
			//Design items
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
				var item = form.addPageBreakItem().setGoToPage(FormApp.PageNavigationType.SUBMIT);
				breakToSides.push(item.getId()); 
				if (debug) {Logger.log('PageBreak item');}
				break;
			case "s":
				var item = form.addSectionHeaderItem().setTitle(itemName);        
				slottingSections.push(item.getId().toString());
				if (debug) {Logger.log('Slotting section item - %s and ids %s', itemName, item.getId().toString());}
				break;
			case "c":
				var item = form.addCheckboxItem().setRequired(true).setTitle(itemName);            
				slottingChoices.push(item.getId().toString());
            	if (debug) {Logger.log('Slotting choice item - %s and ids %s', itemName, item.getId().toString());}
            	break;
		}
	}		

	//Linking 'Side choosing' to page break	
	if (mode == "T") {
		var sideChoice = form.getItemById(idSidechoice).asMultipleChoiceItem();
		if (debug) {Logger.log('\n Side choice item id is %s',  idSidechoice);}
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
		"idName" : idName,											// 0 ID of Name item
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
		"mode" : mode,  											// 13 mode
		"idPrecense" : idPrecense,									// 14 id of PrecenseItem
		"precenseSideA" : "0",										// 15 Precenses list for sideA
		"precenseSideB" : "0",										// 16 Precenses list for sideB
		"passcodes" : passcodes,									// 17 List of Allowed passcodes
		"idPasscode" : idPasscode									// 18 id of Passcode item
		"idSidechoice" : idSidechoice
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


function dzn_checkResponses() { 
	var formResponses = form.getResponses();   
	var responsesToCheck = [];  
	var iMax = 4;
	if (formResponses.length < 4) {iMax = formResponses.length + 1;};
	var duplicates = [];
    
	for (var i = 1; i < iMax; i++) {
		var response = formResponses[formResponses.length-(i)];  
		// Get form response
		var sideResponse, slotResponse, usedSlots, usedNicks, usedSlotsOpposite, usedNicksOpposite, precenseList, precenseListOpposite
		var nickResponse = response.getResponseForItem(form.getItemById(data.idName));
		var precenseResponse = response.getResponseForItem(form.getItemById(data.idPrecense));
		var passcodeResponse = response.getResponseForItem(form.getItemById(data.idPasscode));
		
		if (data.mode == "T") {
			// if TVT: Assign slots/nicks of the chosen side and opposite side (for removing from)
			sideResponse = response.getResponseForItem(form.getItemById(data.idChoices[0]));	
			if (sides.indexOf(sideResponse.getResponse()) == 0) {
				slotResponse = response.getResponseForItem(form.getItemById(data.idChoices[1]));
				usedSlots 				= data.usedSlotsSideA;
				usedNicks 				= data.usedNicksSideA;
				usedSlotsOpposite 		= data.usedSlotsSideB;
				usedNicksOpposite	 	= data.usedNicksSideB;
				precenseList 			= data.precenseSideA;
				precenseListOpposite	= data.precenseSideB;
			} else {
				slotResponse = response.getResponseForItem(form.getItemById(data.idChoices[2]));
				usedSlots 				= data.usedSlotsSideB;
				usedNicks 				= data.usedNicksSideB;
				usedSlotsOpposite 		= data.usedSlotsSideA;
				usedNicksOpposite 		= data.usedNicksSideA;
				precenseList 			= data.precenseSideB;
				precenseListOpposite 	= data.precenseSideA;
			}	
		} else {
			// if NOT TVT: assign slots and nicks 
			slotResponse = response.getResponseForItem(form.getItemById(data.idChoices[0]));
			usedSlots 					= data.usedSlotsSideA;
			usedNicks 					= data.usedNicksSideA;
			precenseList 				= data.precenseSideA;
		}
      
		function dzn_assignSlot(nick, slot, precense) {
			var nickIndex = usedNicks.indexOf(nick);  // Id of NICK at the side's usedNick/Slot array
			if (duplicates.indexOf(nick) == -1) {
				duplicates.push(nick);
			}
			
			// Update or Add nick/slot to side's usedSlot/Nick array
			if (nickIndex > -1) {
				if (slot != 'Без слота') {
					usedSlots[nickIndex] = slot;
					precenseList[nickIndex] = precense;
				} else {
					usedNicks.splice(nickIndex,1);
					usedSlots.splice(nickIndex,1);
					precenseList.splice(nickIndex,1);
				}
			} else {
				usedNicks.push(nick);
				usedSlots.push(slot);
				precenseList.push(precense);
				// If TVT - remove nick/slot from opposite side's arrays (if had been added earlier)
				if (mode == "T") {
					var idToRemove = nickListOp.indexOf(nick);
					if ( idToRemove > -1 ) {
						usedNicksOpposite.splice(idToRemove,1);
						usedSlotsOpposite.splice(idToRemove,1);
						precenseListOpposite.splice(idToRemove,1);
					}
				}
			}          
		}
      
		// Get actual values of response NICK and SLOT
		var nick = nickResponse.getResponse(); // string
		var slot = slotResponse.getResponse(); // array

		if (slot.length == 1) {
          	var precense;
			if (precenseResponse == null) {
        		precense = "";
			} else {
        		precense = precenseResponse.getResponse();
			}
			dzn_assignSlot(nick, slot[0], precense);         
		} else {
			var passcode;
			if (passcodeResponse != null) {
				if (data.passcodes.indexOf(passcodeResponse.getResponse()) > -1) {
					for (var j = 0; j < slot.length; j++) {
						var numeredNick = nick + "-" + j.toString();
						Logger.log('%s - %s', numeredNick, slot[j]);
						dzn_assignSlot(numeredNick, slot[j], "");
					}          
				}
			}
		} 
	}
	
	// Update ScriptProperties by new usedNick/Slot values for each side
	PropertiesService.getScriptProperties().setProperties({
		"usedSlotsSideA" : 	dzn_convert(data.usedSlotsSideA, "toString"),				// Used slots for side A
		"usedSlotsSideB" : 	dzn_convert(data.usedSlotsSideB, "toString"),				// Used slots for side B
		"usedNicksSideA" : 	dzn_convert(data.usedNicksSideA, "toString"),				// Used nicknames for side A
		"usedNicksSideB" : 	dzn_convert(data.usedNicksSideB, "toString"),				// Used nicknames for side B  
		"precenseSideA" : 	dzn_convert(data.precenseSideA, "toString"),			// Precenses of side A  
		"precenseSideB" : 	dzn_convert(data.precenseSideB, "toString")			// Precenses of side B
	}, false); 
}



//
// Get updated info for SLOTTING section and AVAILABLE SLOTS for side (according given slots/usedSlots)
// INPUT:	form, usedNicks, usedSlots, slots, headers
// OUTPUT:	0 sectionInfoOutput, 1 slots
function dzn_getUpdatedInfo(usedNicks, usedSlots, precenses, slots, headers) {
	// Get ids of names which are not available for choosing at the slots item
	var excludeId = headers;
	
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
			var infoString = "? " + sectionInfo[slotIndex] + " -- " + usedNicks[i];           
            if (precenses[i] > 0) {               
                	infoString = infoString + " (" + precenses[i] + "0%)";
            }
			sectionInfo[slotIndex] = infoString; 			
		}
	}
	var sectionInfoOutput = sectionInfo.join("\n");
	
	// Define of sorting conditions
	function dzn_sortCondAsc(a,b) {
		return (a-b);
	};
	
	// Deleting used slots
	excludeId = excludeId.sort( dzn_sortCondAsc );	
	for (var i = 0; i < excludeId.length; i++) {		
		slots.splice(excludeId[i]-i, 1);        
	}

	return [sectionInfoOutput, slots];
}





//
// Main flow
//
function dzn_onSave() {
	var debug = false;
	if (debug) {Logger.log("   Running dzn_onSave");}
	var form = FormApp.getActiveForm();  
  
	// Get DATA from PropertiesService
	var data
	var datalist = PropertiesService.getScriptProperties().getKeys();
	for (var i = 0; i < datalist.length; i++) {
		var key = datalist[i];	
		var value = dzn_convert(data.getProperty(key), "toList");		
		if (value.length > 1) {
			data[key] = value;
		} else {
			data[key] = value[0];
		}		
	}
	
// idName, idSections, idChoices, idPrecense, idOverall, idPasscode
// usedSlotsSideA, usedSlotsSideB, usedNicksSideA, usedNicksSideB, precenseSideA, precenseSideB
// sides, slotsSideA, slotsSideB, slotsHeadsSideA, slotsHeadsSideB, passcodes
// mode	
	
	// Get Mode of form	
	var roleItem
 	if (data.mode == "C") {       
		roleItem = form.getItemById(data.idChoices[0]);
		roleItem.setHelpText("Обработка... Обновите страницу через несколько секунд.");
	}
	
	// Get Responses
	dzn_checkResponses();	
	
	// Get Updated Info and Update
	var overallInfo = '';
	if (data.mode == "C") {
		var updatedSideInfo = dzn_getUpdatedInfo(
			data.usedNicksSideA, data.usedSlotsSideA, data.precenseSideA, 
			data.slotsSideA, data.slotsHeadsSideA
		);
		// OUT: sectionInfoOutput, slots
		updatedSideInfo[1].push("Без слота");		
		form.getItemById(data.idSections).setHelpText(updateSideInfo[0]);
		form.getItemById(data.idChoice).asCheckboxItem().setChoiceValues(updatedSideInfo[1]);		
	} else {
		var updatedSideInfoSideA = dzn_getUpdatedInfo(
			data.usedNicksSideA, data.usedSlotsSideA, data.precenseSideA, 
			data.slotsSideA, data.slotsHeadsSideA
		);		
		var updatedSideInfoSideB = dzn_getUpdatedInfo(
			data.usedNicksSideB, data.usedSlotsSideB, data.precenseSideB, 
			data.slotsSideB, data.slotsHeadsSideB
		);
		
		updatedSideInfoSideA[1].push("Без слота");				
		form.getItemById(data.idSections[0]).setHelpText(updatedSideInfoSideA[0]);
		form.getItemById(data.idChoice[0]).asCheckboxItem().setChoiceValues(updatedSideInfoSideA[1]);		
		
		
		updatedSideInfoSideB[1].push("Без слота");	
		form.getItemById(data.idSections[1]).setHelpText(updatedSideInfoSideB[0]);
		form.getItemById(data.idChoice[1]).asCheckboxItem().setChoiceValues(updatedSideInfoSideB[1]);		
	}
	
	
	
	
	
	
	
	

	
	
	
}
