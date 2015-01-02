// THIS PIECE OF GOOGLE SCRIPT IS UNDER HEAVY AND WILD LICENSE OF DOZEN, FOR EXAMPLE
// © - CHECK THIS COPYRIGHT SIGN. SO COPY, MUCH RIGHT.
//
// MAY BE NOT SAFE FOR WORK, FOR EXAMPLE

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
	var passcodes = form.addSectionHeaderItem().setTitle("VALID PASSCODES").setHelpText("QW21 | 34RF | IKLO | 09OI | NBZX | 0112");

	var ids = dzn_convert([
		mode.getId().toString(),
		sides.getId().toString(),
		slotsA.getId().toString(),
		slotsB.getId().toString(),
		slotsC.getId().toString(),
		slotsD.getId().toString(),
		passcodes.getId().toString()
	], "toString");
	
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
	
	var str = dzn_setStringtable();
	var form = FormApp.getActiveForm();
	var properties = PropertiesService.getScriptProperties();	
	
	var ids = dzn_convert(properties.getProperty("ids"), "toList");
	
	var mode	// mode of form - true - 2 sections, false - 1 section
	switch (form.getItemById(ids[0]).getHelpText().toLowerCase()) {
		case "coop":
			mode = "C";
			break;
		case "tvt":
			mode = "T";
			break;
	}

	var passcodes = form.getItemById(ids[4]).getHelpText(); // Get allowed passcodes
	var sidesNames = dzn_convert(form.getItemById(ids[1]).getHelpText(), "toList"); // Get edited SIDE names from preinitialized form
	var sidesCount = sidesNames.length;

	if (debug) {Logger.log('Side names: %s :: SideCount: %s', sidesNames, sideCount);}
	
	
	
	// Saving SIDE and SLOTS names
	var sectionNamesMasks
	if (mode == "T") {
		sectionNamesMasks = [
			"iИзображение к миссии",
			"tМиссия",
			"lИгроки",
			"pНик в игре",
			"aВероятность присутствия на игре",
			"xПасскод",
			"oСторона",
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
			sectionNamesMasks.push("c" + sideName + ": Роль");
			if (debug) {Logger.log('sideName: %s :: sectionNamesMasks: %s', sideName, sectionNamesMasks);}
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
			"cSIDEA: Роль",
			"xПасскод",
			"aВероятность присутствия на игре"
		];
	}
	
	var breakToSides = []; //Ids of pageBreaks
	var slottingSections = []; //ids of Slotting sections items
	var slottingChoices = []; //ids of Slotting choices items
	var idName, idPrecense, idPasscode;
	var idSidechoice = "0";
	var idOverall = "0";
	
	// Creating form items according to chosen form mode
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
		
		if (debug) {Logger.log('------------->i %s and name is %s -- itemName is %s', i.toString(), name, itemName);}
		
		//Item names: i - img, t - text info, b - breakpage, s - slotting section, c - multi choice
		var itemType = name.substring(0,1);
		switch (itemType) {
			//Functional items
			case "p":
				idName = form.addTextItem().setRequired(true).setTitle(itemName).setHelpText(str.nick).getId().toString();
				break;
			case "a":	
				idPrecense = form.addScaleItem().setTitle(itemName).setHelpText(str.precense).setBounds(1, 7).setLabels('Не уверен', 'Буду').getId().toString();
				break;
			case "x":
				idPasscode = form.addTextItem().setTitle(itemName).setHelpText(str.passcode).getId().toString();
				break;
			case "l":
				idOverall = form.addSectionHeaderItem().setTitle(itemName).getId().toString();
				break;
			case "o":
				idSidechoice = form.addMultipleChoiceItem().setRequired(true).setTitle(itemName).getId().toString();
				break;
			case "c":
				var item = form.addCheckboxItem().setRequired(true).setTitle(itemName).setHelpText(str.slots);
				slottingChoices.push(item.getId().toString());
				break;
			//Design items
			case "i":
				var img = UrlFetchApp.fetch('http://cs608928.vk.me/v608928222/5f5f/MQqIEc6_iKY.jpg');
				form.addImageItem().setTitle(itemName).setImage(img).setAlignment(FormApp.Alignment.CENTER);
				break;
			case "t":
				form.addSectionHeaderItem().setTitle(itemName);
				break;
			case "b":
				var item = form.addPageBreakItem().setGoToPage(FormApp.PageNavigationType.SUBMIT);
				breakToSides.push(item.getId());
				break;
			case "s":
				var item = form.addSectionHeaderItem().setTitle(itemName);
				slottingSections.push(item.getId().toString());
				break;
		}
	}
	
	//Linking 'Side choosing' to page break	
	if (mode == "T") {
		var sideChoice = form.getItemById(idSidechoice).asMultipleChoiceItem();
		if (debug) {Logger.log('\n Side choice item id is %s',  idSidechoice);}
		
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

	// Update headers names and get ids of SQUADNAMES and remove SQUADNAMES ! marker
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
		"idName" : 		idName, 	// ID of Name item
		"idSections" : 		dzn_convert(slottingSections, "toString"), 	// IDs of Section for every side
		"idChoices" : 		dzn_convert(slottingChoices, "toString"), 	// IDs of Choices for every side
		"idPrecense" : 		idPrecense, 	// ID of PrecenseItem
		"idPasscode" : 		idPasscode, 	// ID of Passcode item
		"idSidechoice" : 	idSidechoice, 	// ID of Side choice item
		"idOverall" : 		idOverall, 	// ID of Overall players names section
		
		"mode" : 		mode, // form mode
		
		"sides" : 		dzn_convert(sidesNames, "toString"), 	// Names of sides
		
		"slotsSideA" : 		slotsNames[0], 	// Original names of slots for side A
		"slotsHeadsSideA" : 	slotsHeads[0], 	// IDs of headers in slots names for side A
		
		"slotsSideB" : 		slotsNames[1], 	// Original names of slots for side B
		"slotsHeadsSideB" : 	slotsHeads[1], 	// IDs of headers in slots names for side B
		
		"slotsSideC" : 		slotsNames[2], 	// Original names of slots for side C
		"slotsHeadsSideC" : 	slotsHeads[2], 	// IDs of headers in slots names for side C
		
		"slotsSideD" : 		slotsNames[3], 	// Original names of slots for side D
		"slotsHeadsSideD" : 	slotsHeads[3], 	// IDs of headers in slots names for side D
		
		"passcodes" : 		passcodes, 	// List of Allowed passcodes
		"precense" :		"0",		// Precenses of users
		
		"usedSlots" : 		"0", 		// Used slots for side A
		"usedNicks" : 		"0", 		// Used nicknames for side A
		"precense" : 		"0", 		// Precenses list for sideA
	}, true);

	// Deleting blocks with SIDE and SLOTS settings
	for (var i = 0; i < ids.length; i++) {
		form.deleteItem(form.getItemById(ids[i]).getIndex());
	}
	
	// Set confirm message
	form.setConfirmationMessage(str.formConfirm);
	Logger.log("Initialized");
	
	// Running save trigger to update form
	//dzn_onSave();
}


// *********
// Main flow
// *********
function dzn_onSave() { 
	function dzn_checkResponses() { 
		function dzn_trim(str) {
			var	str = str.replace(/^\s\s*/, ''),
			ws = /\s/,
			i = str.length;
			while (ws.test(str.charAt(--i)));
			
			return str.slice(0, i + 1);
		}
		
		function dzn_getPrecense(nick) {
			var precenseId
			for (var k = 0; k < data.precense.length; k++) {
				if (data.precense[k].indexOf(nick) > -1) {
					precenseId = k;
				}
			}
			
			return precenseId
		}
		
		function dzn_assignSlot(nick, slot, precense) {
			var nickIndex = data.usedNicks[sideIndex].indexOf(nick); // Id of NICK at the side's usedNick/Slot array
			if (duplicates.indexOf(nick) == -1) {
				duplicates.push(nick);
				
				// Update or Add nick/slot to side's usedSlot/Nick array
				if (nickIndex > -1) {
					// Change Nickname-Slot
					if (slot != 'Без слота') {
						// Change slot
						data.usedSlots[sideIndex][nickIndex] = slot;
						data.precense[dzn_getPrecense(nick)] = [nick, precense];
					} else {
						// Remove from any slot
						data.usedNicks[sideIndex].splice(nickIndex,1);
						data.usedSlots[sideIndex].splice(nickIndex,1);
						data.precense.splice(dzn_getPrecense(nick),1);
					}
				} else {
					// Add Nickname and Slot
					data.usedNicks[sideIndex].push(nick);
					data.usedSlots[sideIndex].push(slot);
					data.precense.push([nick, precense]);

					// If TVT - remove nick/slot from opposite side's arrays (if had been added earlier)
					if (data.mode == "T") {
						var idToRemove
						for (var k = 0; k < data.sides.length; k++) {
							if (k != sideIndex) {
								idToRemove = data.usedNicks[sideIndex].indexOf(nick);
								if ( idToRemove > -1 ) {
									data.usedNicks[k].splice(idToRemove,1);
									data.usedSlots[k].splice(idToRemove,1);
									data.precense.splice(dzn_getPrecense(nick),1);
								}
							}
						}
					}
				}
			}
		}
		
		function dzn_unassignMultipleSlots() {
			// There is NO SLOT chosen
			var nickRE = new RegExp (nick + "-sq\\\d{1,2}$");
			for (var k = 0; k < data.usedNicks[sideIndex].length; k++) {
				if (nickRE.test(data.usedNicks[sideIndex][k])) {
					var numeredNick = data.usedNicks[sideIndex][k];
					Logger.log(numeredNick);
					dzn_assignSlot(numeredNick, 'Без слота', precense);
					k--;
				}
			}
		}
		
		// Checking response
		var formResponses = form.getResponses();
		var duplicates = [];
		var response = formResponses[formResponses.length-1];	// Get last responce
		
		if (response != null) {
			// Get form response
			var nickResponse = response.getResponseForItem(form.getItemById(data.idName));
			var precenseResponse = response.getResponseForItem(form.getItemById(data.idPrecense));
			var passcodeResponse = response.getResponseForItem(form.getItemById(data.idPasscode));
			
			var sideResponse, sideIndex, slotResponse
			if (data.mode == "T") {
				// if TVT: Assign slots/nicks of the chosen side and opposite side (for removing from)
				sideResponse = response.getResponseForItem(form.getItemById(data.idSidechoice));
				sideIndex = data.sides.indexOf(sideResponse.getResponse());
				slotResponse = response.getResponseForItem(form.getItemById(data.idChoices[sideIndex]));
			} else {
				// if NOT TVT: assign slots and nicks
				slotResponse = response.getResponseForItem(form.getItemById(data.idChoices));
				sideIndex = 0;
			}
			
			// Get actual values of response NICK and SLOT
			var nick = dzn_trim(nickResponse.getResponse()); 	// string
			var slot = slotResponse.getResponse(); 			// array
			
			var precense;
			if (precenseResponse == null) {
				// No response were given
				precense = "10";
			} else {
				// Get value from response
				precense = precenseResponse.getResponse();
			}
			
			if (slot.length == 1) { 
				// Single 'Unassign slot' chosen
				// Passcode given -- e.g. squad unassigment
				var passcode;
				if ((passcodeResponse != null)
					&& (data.passcodes.indexOf(passcodeResponse.getResponse()) > -1) ) {
					dzn_unassignMultipleSlots();
				} else {
					// Passcode Not given -- e.g. single man
					dzn_assignSlot(nick, slot[0], precense);
				}
			} else {
				// Multiple slots were chosen
				var passcode;
				if ((passcodeResponse != null)
					&& (data.passcodes.indexOf(passcodeResponse.getResponse()) > -1) ) {
					// Passcode confirmed
					if (slot.indexOf('Без слота') > -1) {
						// Unassign multiple slots
						dzn_unassignMultipleSlots();
					} else {
						// Slots chosen
						for (var j = 0; j < slot.length; j++) {
							var numeredNick = nick + "-sq" + j.toString();
							dzn_assignSlot(numeredNick, slot[j], precense);
						}
					}
				}
			}
			
			// Update ScriptProperties by new usedNick/Slot values for each side
			var properties = PropertiesService.getScriptProperties();
		}
	}	
		
		
		
		
		
		

















	// Get updated info for SLOTTING section and AVAILABLE SLOTS for side (according given slots/usedSlots)
	// INPUT: form, usedNicks, usedSlots, slots, headers || OUTPUT: 0 sectionInfoOutput, 1 slots
	function dzn_getUpdatedInfo(usedNicks, usedSlots, precenses, slots, headers) {
		
	}
	
	
	
	
	// ****************
	// Flow starts here
	// ****************
	Logger.log(" Running dzn_onSave");
	var form = FormApp.getActiveForm();
	var properties = PropertiesService.getScriptProperties();
	
	// Get DATA from PropertiesService: ID values convert to single string, notIDs - into Arrays
	var data = {};
	var datalist = properties.getKeys();
	for (var i = 0; i < datalist.length; i++) {
		var key = datalist[i].toString();
		var value = dzn_convert(properties.getProperty(key), "toList");
		Logger.log("%s -- %s", key, value);
		if (value.length == 1) {
			// Property isn't array or array with only one item
			if (key.substring(0,2) == "id") {
				// If property is "id" property - then should be used as single item
				value = value[0];
			} else {
				if (value[0] == 0) {
					value = [];
				}
			}
		}
		data[key] = value; // A: Array [ 1, 2, 3]; B: Array []; C: Sting "1"
	}
	
	//	Data values
	// idName, idSections, idChoices, idPrecense, idPasscode, idSidechoice, idOverall
	// , mode , sides, passcodes, precense
	// , slotsSideA, slotsSideB, slotsSideC, slotsSideD 
	// , slotsHeadsSideA, slotsHeadsSideB, slotsHeadsSideC, slotsHeadsSideD
	// , usedSlotsSideA, usedSlotsSideB, usedSlotsSideC, usedSlotsSideD 
	// , usedNicksSideA, usedNicksSideB, usedNicksSideC, usedNicksSideD 

	// Stringtable
	var str = dzn_setStringtable();
	
	// Get Mode of form
	var roleItem
	if (data.mode == "C") {
		roleItem = form.getItemById(data.idChoices).setHelpText(str.slotsLoading);
	}

	// Get Responses
	dzn_checkResponses(); 
	
	// Get Updated Info and Update
	var overallInfo = '';
}






	

// String to show
function dzn_setStringtable() {
	var str = {
		"precense" :	"Если считаешь, что не успеешь на игру и об этом должны знать все - укажи, пожалуйста, вероятность своего появления на игре (1 = 10%, 7 = 70%).",
		"passcode" :	"Ввод паскода(выданного только лидерам ленивых отрядов) позволит занять несколько слотов. Если у Вас нет паскода и/или Вы не собираетесь занимать более одного слота - не заполняйте поле.",
		"nick"	:	"",
		"slots"	:	"Выберите одну из доступных ролей из списка ниже.",
		"slotsLoading"	:	"Обработка... Обновите страницу через несколько секунд.",
		"formConfirm"	:	"Спасибо, мы тебя подписали на эвент.\n\nЕсли твой ник не появился в списке - обнови страницу через несколько секунд."
	};
	return str
}

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
