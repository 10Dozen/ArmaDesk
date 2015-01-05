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

	var passcodes = form.getItemById(ids[6]).getHelpText(); // Get allowed passcodes
	var sidesNames = dzn_convert(form.getItemById(ids[1]).getHelpText(), "toList"); // Get edited SIDE names from preinitialized form
	var sidesCount;

	// Saving SIDE and SLOTS names
	var sectionNamesMasks
	if (mode == "T") {
		sidesCount = sidesNames.length;
		sectionNamesMasks = [
			"iИзображение к миссии",
			"tМиссия",
			"lИгроки",
			"pНик в игре",
			"aВероятность присутствия на игре",
			"xПасскод",
			"oСторона",
			"bSIDE0",
			"sSIDE0: Слоттинг",
			"cSIDE0: Роль",
			"bSIDE1",
			"sSIDE1: Слоттинг",
			"cSIDE1: Роль"
		];
		
		function dzn_init_addSections(sideName) {
			sectionNamesMasks.push("b" + sideName);
			sectionNamesMasks.push("s" + sideName + ": Слоттинг");
			sectionNamesMasks.push("c" + sideName + ": Роль");
			if (debug) {Logger.log('sideName: %s :: sectionNamesMasks: %s', sideName, sectionNamesMasks);}
		}
		
		if (sidesCount > 2) {
			dzn_init_addSections("SIDE2");
			if (sidesCount > 3) {
				dzn_init_addSections("SIDE3");
			}
		};
		
	} else {
		sidesCount = 1;
		sidesNames = [sidesNames[0]];
		
		sectionNamesMasks = [
			"iИзображение к миссии",
			"tМиссия",
			"sSIDE0: Слоттинг",
			"pНик в игре",
			"cSIDE0: Роль",
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
			var sideNameToReplace = sidesNames[name.substring(5,6)];
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
		for (var j = 0; j < names.length; j++) {
			if (names[j].substring(0,1) == "!") {
				names[j] = "\n" + names[j].substring(1,names[j].length) + "\n";
				output.push(j.toString());
			}		
		}		
		return [dzn_convert(names, "toString"), dzn_convert(output, "toString")]
	}
	
	// Update headers names and get ids of SQUADNAMES and remove SQUADNAMES ! marker
	var slotsNames = [ ["0"], ["0"], ["0"], ["0"] ];
	var slotsHeads = [ ["0"], ["0"], ["0"], ["0"] ];
	var slotList, slotParsed;
	for (var i = 0; i < sidesCount; i++) {
		slotList = form.getItemById(ids[i + 2]).getHelpText();	// !ALPHA | [ALPHA] Operator
		slotParsed = dzn_init_getHeaderSlotsIds(slotList);	// [ "/nALPHA/n, [ALPHA] Operator", "0 | 3"]
		slotsNames[i] = slotParsed[0];				// [ "/nAlpha/n", "0", "0", "0" ]
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
		
		"mode" : 		mode, 		// Form mode
		"passcodes" :		passcodes, 	// Valid passcodes
		"sides" : 		dzn_convert(sidesNames, "toString"), 	// Names of sides
		
		"precense" :		"0",		// Precenses of users
		
		"slotsNames" :		dzn_convert(slotsNames, "toString"),	// Original names of slots
		"slotsHeadsNames" :	dzn_convert(slotsHeads, "toString"),	// IDs of headers in slots names
		
		"usedSlots" : 		"0 $ 0 $ 0 $ 0", 		// Used slots for sides
		"usedNicks" : 		"0 $ 0 $ 0 $ 0", 		// Used nicknames for sides
	}, true);

	// Deleting blocks with SIDE and SLOTS settings
	for (var i = 0; i < ids.length; i++) {
		form.deleteItem(form.getItemById(ids[i]).getIndex());
	}
	
	// Set confirm message
	form.setConfirmationMessage(str.formConfirm);
	Logger.log("Initialized");
	
	// Running save trigger to update form
	dzn_onSave();
}


// *********
// Main flow
// *********
function dzn_onSave() { 
	function dzn_getPrecense(nick) {
		var precenseId
		for (var k = 0; k < data.precense.length; k++) {
			if (data.precense[k].indexOf(nick) > -1) {
				precenseId = k;
			}
		}
		return precenseId
	}
	
	function dzn_checkResponses() { 
		function dzn_trim(str) {
			var	str = str.replace(/^\s\s*/, ''),
			ws = /\s/,
			i = str.length;
			while (ws.test(str.charAt(--i)));
			
			return str.slice(0, i + 1);
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
			// Hidding special characters from RegExp
			var nickReplaced = nick.replace("\\", "\\\\").replace("\\","\\\\")  
				.replace("\[", "\\\[").replace("\]", "\\\]")
				.replace("\(", "\\\(").replace("\)","\\\)")
				.replace("\.", "\\\.")
				.replace("\^","\\\^")
				.replace("\$","\\\$")
				.replace("\|","\\\|")
				.replace("\?","\\\?")
				.replace("\+","\\\+")
          		
			var nickRE = new RegExp (nickReplaced + "-sq\\\d{1,2}$");
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
		}
		
		// Update ScriptProperties by new usedNick/Slot values for each side
		var properties = PropertiesService.getScriptProperties();
		var propertyList = ["usedSlots", "usedNicks", "precense"];
		for (var i = 0; i < propertyList.length; i++) {
			var property = data[propertyList[i]];
			if (property.length == 0) { property = [0] };
			property = dzn_convert(property, "toString");
			properties.setProperty(propertyList[i], property);
		}
	}	
		
	// Get updated info for SLOTTING section and AVAILABLE SLOTS for side (according given slots/usedSlots)
	// INPUT: form, usedNicks, usedSlots, slots, headers || OUTPUT: 0 sectionInfoOutput, 1 slots
	function dzn_getUpdatedInfo(usedNicks, usedSlots, slots, headers) {
		// Get ids of names which are not available for choosing at the slots item
		var excludeId = headers;
		var nickList = [];
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
				var nicknameToShow = usedNicks[i];
				// nicknameToShow = nicknameToShow.replace(/(\w+)(-sq)\d{1,2}$/, "$1");
				
				/*
				( ) — круглые скобки;
				[ ] — квадратные скобки;
				\ — обраный слеш;
				. — точка;
				^ — степень;
				$ — знак доллара;
				| — вертикальная черта;
				? — вопросительный знак;
				+ — плюс.
				
				*/
				
				nicknameToShow = nicknameToShow.replace(/(([A-Za-zА-Яа-я-_0-9\[\]\(\)\.\^\$\|\?\+])+)(-sq(\d){1,2})$/, "$1");
				if (nickList.indexOf(nicknameToShow) == -1) {
					nickList.push(nicknameToShow);
				}
				var infoString = "✔ " + sectionInfo[slotIndex] + " -- " + nicknameToShow;
				
				var precenseValueId = dzn_getPrecense(usedNicks[i]);
				if ((data.precense[precenseValueId][1] > 0) && (data.precense[precenseValueId][1] < 8)) {
					infoString = infoString + " (" + data.precense[precenseValueId][1] + "0%)";
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
		return [sectionInfoOutput, slots, nickList];
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
	// , slotsNames, slotsHeadsNames, usedSlots, usedNicks

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
	if (data.mode == "C") {
		var updatedSideInfo = dzn_getUpdatedInfo(
			data.usedNicks[0], data.usedSlots[0], data.slotsNames[0], data.slotsHeadsNames[0]
		);
		// OUT: sectionInfoOutput, slots
		updatedSideInfo[1].push("Без слота"); 
		form.getItemById(data.idSections).setHelpText(updatedSideInfo[0]);
		form.getItemById(data.idChoices).asCheckboxItem().setChoiceValues(updatedSideInfo[1]);
		roleItem.setHelpText(str.slots);
	} else {
		var overallInfo = "";
		for (var i = 0; i < data.sides.length; i++) {
			var updatedSideInfo = dzn_getUpdatedInfo(
				data.usedNicks[i], data.usedSlots[i], data.slotsNames[i], data.slotsHeadsNames[i]
			);
			// OUT: sectionInfoOutput, slots for SIDE 
			updatedSideInfo[1].push("Без слота");
			form.getItemById(data.idSections[i]).setHelpText(updatedSideInfo[0]);
			form.getItemById(data.idChoices[i]).asCheckboxItem().setChoiceValues(updatedSideInfo[1]);
			
			overallInfo = overallInfo + data.sides[i] + "\n" + updatedSideInfo[2].join(", ") + "\n\n";
		}
		
		// Update Overall info
		form.getItemById(data.idOverall).setHelpText(overallInfo);
	}
		
	Logger.log(' << End of dzn_onSave');	
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
// Convert StringWithDelimeters2Array or Array2StringWithDelimeters
function dzn_convert(value, type) {
	var output = '';
	if (type == "toList") { 
		var firstArrayDimension = value.split(" $ ");// convert into array
		if (firstArrayDimension.length != 1) {
			output = [];
			for (var i = 0; i < firstArrayDimension.length; i++) {
				output.push(firstArrayDimension[i].split(" | "));
			}
		} else {
			output = value.split(" | ");
		}
	} else {
	// "toString"
	// Concetate string with delimeters      
		for (var i = 0; i < value.length; i++) {      
			if (value[i].constructor === Array) {
				for (var j = 0; j < value[i].length; j++) {                     
					if (output.length > 0) {
						if (j == 0) {
							output = output + " $ " + value[i][j].toString();
						} else {
							output = output + " | " + value[i][j].toString();
						}             
					} else {
						output = value[i][j].toString();        
					} 
				}        
			} else {
				if (output.length > 0) {
					output = output + " | " + value[i].toString();
				} else {
					output = value[i].toString();
				}        
			}
		}
	};  
 	return output;
}
