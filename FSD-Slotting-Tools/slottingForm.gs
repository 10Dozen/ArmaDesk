// String to show
function dzn_slotForm_getStringtable() {
	var str = {
		"precense" :	"Если считаешь, что не успеешь на игру и об этом должны знать все - отметь этот чекбокс (твой ник впоследующем будет отображен со значком ◑).",
		"passcode" :	"Ввод паскода(выданного только лидерам ленивых отрядов) позволит занять несколько слотов. Если у Вас нет паскода и/или Вы не собираетесь занимать более одного слота - не заполняйте поле.",
		"nick"	:	"",
		"slots"	:	"Выберите одну из доступных ролей из списка ниже.",
		"slotsLoading"	:	"Обработка... Обновите страницу через несколько секунд.",
		"formConfirm"	:	"Спасибо, мы тебя подписали на эвент.\n\nЕсли твой ник не появился в списке - обнови страницу через несколько секунд.",
		"precenseCh"	:	"Возможно не приду"
	};
	return str
}


//************************
// Adds FSD Menu for Slotting Form
function dzn_slotForm_addMenu() {
	FormApp.getUi()
		.createMenu('FSD Tools')
		.addItem('✓ Start Slotting Form', 'dzn_slotForm_initializeFromMenu')
		.addSeparator()
		.addItem('↺ Recreate with Defaults', 'dzn_slotForm_preInitializeFromMenu')
  		.addItem('⨯ Inactivate Slotting form', 'dzn_form_inactivateFormFromMenu')
		.addToUi();
};

//*****************************
// Preinitialize the form from Menu
function dzn_slotForm_preInitializeFromMenu() {
	var formId = FormApp.getActiveForm().getId();
	var ssId = dzn_form_getPropertySheet(formId, 'slot');
  
	dzn_slotForm_preInitialize(formId, ssId);
	FormApp.getUi().alert('✔ OK\n\nDefault view restored');
}

//*****************************
// Preinitialize the form
// Will prepare empty form to use for slotting purposes
function dzn_slotForm_preInitialize(formId, ssId) {
	Logger.log("Pre-intialization...");
	var form = FormApp.openById(formId);
	var ss = SpreadsheetApp.openById(ssId);
  
	Logger.log("Clearing form and responses.");
	var items = form.getItems();
	for (var i = 0; i < items.length; i++) {
		form.deleteItem(items[i].getIndex()); 
	}
	form.deleteAllResponses();
  
	Logger.log("Adding items to enter sides and slots names.");
	var mode = form.addSectionHeaderItem().setTitle("FORM MODE").setHelpText('COOP'); // COOP or TVT
	var sides = form.addSectionHeaderItem().setTitle("AVAILABLE SIDES").setHelpText(ss.getRangeByName("slotForm_defSides").getValue());
	var slotsA = form.addSectionHeaderItem().setTitle("SLOTS FOR SIDE 1").setHelpText(ss.getRangeByName("slotForm_defSlots1").getValue());
	var slotsB = form.addSectionHeaderItem().setTitle("SLOTS FOR SIDE 2").setHelpText(ss.getRangeByName("slotForm_defSlots2").getValue());
	var slotsC = form.addSectionHeaderItem().setTitle("SLOTS FOR SIDE 3").setHelpText(ss.getRangeByName("slotForm_defSlots3").getValue());
	var slotsD = form.addSectionHeaderItem().setTitle("SLOTS FOR SIDE 4").setHelpText(ss.getRangeByName("slotForm_defSlots4").getValue());
	var passcodes = form.addSectionHeaderItem().setTitle("VALID PASSCODES").setHelpText(ss.getRangeByName("slotForm_defPass").getValue());

	var ids = dzn_convert([
		mode.getId().toString(),
		sides.getId().toString(),
		slotsA.getId().toString(),
		slotsB.getId().toString(),
		slotsC.getId().toString(),
		slotsD.getId().toString(),
		passcodes.getId().toString()
	], "toString");
  
	ss.getRangeByName('slotForm_ids').setValue(ids);  

	var triggers = ScriptApp.getUserTriggers(form);
	for (var i = 0; i < triggers.length; i++) {
		ScriptApp.deleteTrigger(triggers[i]);
	}
	ScriptApp.newTrigger('dzn_slotForm_addMenu').forForm(form).onOpen().create();  
  
	Logger.log("Pre-initialized!");
}


// *******************************************
// After form creator entered SIDE and SLOTS names for every SIDE, calling dzn_initialize
// INPUT: none | OUTPUT: none (write to ScriptProperties)
function dzn_slotForm_initializeFromMenu() {
	Logger.log("Intialization...");
	
	var debug = false;
	if (debug) {Logger.log('Debugging!');}
	
	var str = dzn_slotForm_getStringtable();
	var form = FormApp.getActiveForm();
	var ss = SpreadsheetApp.openById(dzn_form_getPropertySheet(form.getId(), 'slot')); //properties
  
	var ids = dzn_convert(ss.getRangeByName('slotForm_ids').getValue(), "toList");
	
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
				idPrecense = form.addCheckboxItem().setTitle(itemName).setHelpText(str.precense).setChoiceValues([str.precenseCh]).getId().toString();
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
		slotsNames[i][0] = slotParsed[0];				// [ "/nAlpha/n", "0", "0", "0" ]
		slotsHeads[i][0] = slotParsed[1];
	}
	
	// WRITE TO PROPERTIES
	if (debug) {Logger.log('Writing properties');}
                
	ss.getRangeByName('slotForm_idName').setValue(idName); // ID of Name item
	ss.getRangeByName('slotForm_idSections').setValue(dzn_convert(slottingSections, "toString")); // IDs of Section for every side
	ss.getRangeByName('slotForm_idChoices').setValue(dzn_convert(slottingChoices, "toString")); // IDs of Choices for every side
	ss.getRangeByName('slotForm_idPrecense').setValue(idPrecense); // ID of PrecenseItem
	ss.getRangeByName('slotForm_idPasscode').setValue(idPasscode); // ID of Passcode item
	ss.getRangeByName('slotForm_idSidechoice').setValue(idSidechoice); // ID of Side choice item
	ss.getRangeByName('slotForm_idOverall').setValue(idOverall); // ID of Overall players names section
	ss.getRangeByName('slotForm_mode').setValue(mode); // Form mode
	ss.getRangeByName('slotForm_passcodes').setValue(passcodes); // Valid passcodes
	ss.getRangeByName('slotForm_sides').setValue(dzn_convert(sidesNames, "toString")); // Names of sides
	ss.getRangeByName('slotForm_precense').setValue("0 $ "); // Precenses of users
	ss.getRangeByName('slotForm_slotsNames').setValue(dzn_convert(slotsNames, "toString")); // Original names of slots
	ss.getRangeByName('slotForm_slotsHeadsNames').setValue(dzn_convert(slotsHeads, "toString")); // IDs of headers in slots names
	ss.getRangeByName('slotForm_usedSlots').setValue("0 $ 0 $ 0 $ 0"); // Used slots for sides
	ss.getRangeByName('slotForm_usedNicks').setValue("0 $ 0 $ 0 $ 0"); // Used nicknames for sides
  
	// Deleting blocks with SIDE and SLOTS settings
	for (var i = 0; i < ids.length; i++) {
		form.deleteItem(form.getItemById(ids[i]).getIndex());
	}
	
	// Set confirm message
	form.setConfirmationMessage(str.formConfirm);
	Logger.log("Initialized");
	
	// Running save trigger to update form
	ScriptApp.newTrigger('dzn_slotForm_onSave').forForm(form).onFormSubmit().create();
	dzn_slotForm_onSave();
	FormApp.getUi().alert('✔ OK\n\nSlotting Form Initialized!');
}


// *********
// Main flow
// *********
function dzn_slotForm_onSave() { 
	function dzn_getPrecense(nick) {
		var precenseId
		for (var k = 0; k < data.slotForm_precense.length; k++) {
			if (data.slotForm_precense[k].indexOf(nick) > -1) {
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
			var nickIndex = data.slotForm_usedNicks[sideIndex].indexOf(nick); // Id of NICK at the side's usedNick/Slot array
			if (duplicates.indexOf(nick) == -1) {
				duplicates.push(nick);
				
				// Update or Add nick/slot to side's usedSlot/Nick array
				if (nickIndex > -1) {
					// Change Nickname-Slot
					if (slot != 'Без слота') {
						// Change slot
						data.slotForm_usedSlots[sideIndex][nickIndex] = slot;
						data.slotForm_precense[dzn_getPrecense(nick)] = [nick, precense];
					} else {
						// Remove from any slot
						data.slotForm_usedNicks[sideIndex].splice(nickIndex,1);
						data.slotForm_usedSlots[sideIndex].splice(nickIndex,1);
						data.slotForm_precense.splice(dzn_getPrecense(nick),1);
					}
				} else {
					// Add Nickname and Slot
					data.slotForm_usedNicks[sideIndex].push(nick);
					data.slotForm_usedSlots[sideIndex].push(slot);
					data.slotForm_precense.push([nick, precense]);

					// If TVT - remove nick/slot from opposite side's arrays (if had been added earlier)
					if (data.slotForm_mode == "T") {
						var idToRemove
						for (var k = 0; k < data.slotForm_sides.length; k++) {
							if (k != sideIndex) {
								idToRemove = data.slotForm_usedNicks[k].indexOf(nick);
								if ( idToRemove > -1 ) {
									data.slotForm_usedNicks[k].splice(idToRemove,1);
									data.slotForm_usedSlots[k].splice(idToRemove,1);
									data.slotForm_precense.splice(dzn_getPrecense(nick),1);
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
			var nickReplaced = nick
				.replace("\\", "\\\\").replace("\\","\\\\")  
				.replace("\[", "\\\[").replace("\]", "\\\]")
				.replace("\(", "\\\(").replace("\)","\\\)")
				.replace("\.", "\\\.")
				.replace("\^","\\\^")
				.replace("\$","\\\$")
				.replace("\|","\\\|")
				.replace("\?","\\\?")
				.replace("\+","\\\+")
          		
			var nickRE = new RegExp (nickReplaced + "-sq\\\d{1,2}$");
			for (var k = 0; k < data.slotForm_usedNicks[sideIndex].length; k++) {
				if (nickRE.test(data.slotForm_usedNicks[sideIndex][k])) {
					var numeredNick = data.slotForm_usedNicks[sideIndex][k];
					if(debug) {Logger.log(numeredNick);}
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
			var nickResponse = response.getResponseForItem(form.getItemById(data.slotForm_idName));
			var precenseResponse = response.getResponseForItem(form.getItemById(data.slotForm_idPrecense));
			var passcodeResponse = response.getResponseForItem(form.getItemById(data.slotForm_idPasscode));
			
			var sideResponse, sideIndex, slotResponse
			if (data.slotForm_mode == "T") {
				// if TVT: Assign slots/nicks of the chosen side and opposite side (for removing from)
				sideResponse = response.getResponseForItem(form.getItemById(data.slotForm_idSidechoice));
				sideIndex = data.slotForm_sides.indexOf(sideResponse.getResponse());
				slotResponse = response.getResponseForItem(form.getItemById(data.slotForm_idChoices[sideIndex]));
			} else {
				// if NOT TVT: assign slots and nicks
				slotResponse = response.getResponseForItem(form.getItemById(data.slotForm_idChoices));
				sideIndex = 0;
			}
			
			// Get actual values of response NICK and SLOT
			var nick = dzn_trim(nickResponse.getResponse()); 	// string
			var slot = slotResponse.getResponse(); 			// array
			
			var precense;
			if (precenseResponse == null) {
				// No response were given
				precense = "true";
			} else {
				// Get value from response
				precense = precenseResponse.getResponse()[0];
			}
			
			if (slot.length == 1) { 
				// Single 'Unassign slot' chosen
				// Passcode given -- e.g. squad unassigment
				var passcode;
				if ((passcodeResponse != null)
					&& (data.slotForm_passcodes.indexOf(passcodeResponse.getResponse()) > -1) ) {
					dzn_unassignMultipleSlots();
				} else {
					// Passcode Not given -- e.g. single man
					dzn_assignSlot(nick, slot[0], precense);
				}
			} else {
				// Multiple slots were chosen
				var passcode;
				if ((passcodeResponse != null)
					&& (data.slotForm_passcodes.indexOf(passcodeResponse.getResponse()) > -1) ) {
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
		//var properties = PropertiesService.getScriptProperties();
		var propertyList = ["slotForm_usedSlots", "slotForm_usedNicks", "slotForm_precense"];
		for (var i = 0; i < propertyList.length; i++) {
			var property = data[propertyList[i]];          
			if (property.length == 0) { property = [0] };
			property = dzn_convert(property, "toString");
            
			ss.getRangeByName(propertyList[i]).setValue(property);
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
				
				if (data.slotForm_precense[dzn_getPrecense(usedNicks[i])][1] != "true") {
					infoString = infoString + " ◑";
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
	var debug = false;
	if (debug) { Logger.log("Debugging!"); }
	var form = FormApp.getActiveForm();
	var ss = SpreadsheetApp.openById(dzn_form_getPropertySheet(form.getId(), 'slot')); //properties
	
	// Get DATA from Properties: ID values convert to single string, notIDs - into Arrays
	var data = {};
	var datalist = ["slotForm_idName","slotForm_idSections","slotForm_idChoices","slotForm_idPrecense","slotForm_idPasscode","slotForm_idSidechoice","slotForm_idOverall","slotForm_mode","slotForm_passcodes","slotForm_sides","slotForm_precense","slotForm_slotsNames","slotForm_slotsHeadsNames","slotForm_usedSlots","slotForm_usedNicks"];
	for (var i = 0; i < datalist.length; i++) {
		var key = datalist[i].toString();
		var value = dzn_convert(ss.getRangeByName(key).getValue().toString(), "toList");
		if (debug) {Logger.log("%s -- %s", key, value);}
		if (value.length == 1) {
			if (key.substring(9,11) == "id") {
				// If property is "id" property - then should be used as single item
				value = value[0];
			} else {
				if (value[0] == 0) {
					value = [];
				}
			}
		}
        	data[key] = value;  // A: Array [ 1, 2, 3]; B: Array []; C: Sting "1"
	}
  
	//	Data values
	// slotForm_idName, slotForm_idSections, slotForm_idChoices, slotForm_idPrecense, slotForm_idPasscode, slotForm_idSidechoice, slotForm_idOverall
	// , slotForm_mode , slotForm_sides, slotForm_passcodes, slotForm_precense
	// , slotForm_slotsNames, slotForm_slotsHeadsNames, slotForm_usedSlots, slotForm_usedNicks

	// Stringtable
	var str = dzn_slotForm_getStringtable();
	
	// Get Mode of form
	var roleItem
	if (data.slotForm_mode == "C") {
		roleItem = form.getItemById(data.slotForm_idChoices).setHelpText(str.slotsLoading);
	}

	// Get Responses
	dzn_checkResponses(); 
	
	// Get Updated Info and Update
	var overallInfo = '';
	if (data.slotForm_mode == "C") {
		var updatedSideInfo = dzn_getUpdatedInfo(
			data.slotForm_usedNicks[0], data.slotForm_usedSlots[0], data.slotForm_slotsNames[0], data.slotForm_slotsHeadsNames[0]
		);
		// OUT: sectionInfoOutput, slots
		updatedSideInfo[1].push("Без слота"); 
		form.getItemById(data.slotForm_idSections).setHelpText(updatedSideInfo[0]);
		form.getItemById(data.slotForm_idChoices).asCheckboxItem().setChoiceValues(updatedSideInfo[1]);
		roleItem.setHelpText(str.slots);
	} else {
		var overallInfo = "";
		for (var i = 0; i < data.slotForm_sides.length; i++) {
			var updatedSideInfo = dzn_getUpdatedInfo(
				data.slotForm_usedNicks[i], data.slotForm_usedSlots[i], data.slotForm_slotsNames[i], data.slotForm_slotsHeadsNames[i]
			);
			// OUT: sectionInfoOutput, slots for SIDE 
			updatedSideInfo[1].push("Без слота");
			form.getItemById(data.slotForm_idSections[i]).setHelpText(updatedSideInfo[0]);
			form.getItemById(data.slotForm_idChoices[i]).asCheckboxItem().setChoiceValues(updatedSideInfo[1]);
			
			overallInfo = overallInfo + data.slotForm_sides[i] + "\n" + updatedSideInfo[2].join(", ") + "\n\n";
		}
		
		// Update Overall info
		form.getItemById(data.slotForm_idOverall).setHelpText(overallInfo);
	}
		
	Logger.log(' << End of dzn_onSave');	
}
