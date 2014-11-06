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
	var mode = form.addSectionHeaderItem().setTitle("dzn_FORM MODE").setHelpText('COOP or TVT'); // COOP or TVT
	var sides = form.addSectionHeaderItem().setTitle("dzn_NAMES OF THE OPPOSING SIDES").setHelpText("BLUFOR | OPFOR");
	var slotsA = form.addSectionHeaderItem().setTitle("dzn_SLOTS FOR SIDE 1").setHelpText("!ALPHA | [Alpha] SL | [Alpha] Rifleman | !BRAVO | [Bravo] SL | [Bravo] Rifleman | [Bravo] AR | [Bravo] AAR | [Bravo] AT");
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


// After form creator entered SIDE and SLOTS names for every SIDE, calling dzn_initialize
// INPUT: none | OUTPUT: none (write to ScriptProperties)
function dzn_initialize() {
	Logger.log("Intialization...");
	
	var str = dzn_setStringtable();
	
	var form = FormApp.getActiveForm();
	var properties = PropertiesService.getScriptProperties();	
	
	var ids = dzn_convert(properties.getProperty("ids"), "toList");
	
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
    
	var passcodes = form.getItemById(ids[4]).getHelpText(); // Get allowed passcodes	
	var sidesNames = dzn_convert(form.getItemById(ids[1]).getHelpText(), "toList"); // Get edited SIDE names from preinitialized form

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

	var breakToSides = [];  			//Ids of pageBreaks
	var slottingSections = [];  		//ids of Slotting sections items
	var slottingChoices = [];  			//ids of Slotting choices items
	var idName, idPrecense, idPasscode;	
	var idSidechoice = "0";
	var idOverall = "0";

	// Creating form items according to chosen form mode
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
	
		//Item names: i - img, t - text info, b - breakpage, s - slotting section, c - multi choice
		var itemType = name.substring(0,1);
		switch (itemType) {
			//Functional items			
			case "p":
            	idName = form.addTextItem().setRequired(true).setTitle(itemName).setHelpText(str.nick).getId().toString();
            	break;
			case "a":			
				idPrecense = form.addScaleItem().setTitle(itemName).setHelpText(str.precense).setBounds(1, 7).setLabels('Не уверен', '% Буду').getId().toString();				
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
      Logger.log(idSidechoice);
		var sideChoice = form.getItemById(idSidechoice).asMultipleChoiceItem();		
		var choiceSideA = sideChoice.createChoice(sidesNames[0], form.getItemById(breakToSides[0]).asPageBreakItem());	
		var choiceSideB = sideChoice.createChoice(sidesNames[1], form.getItemById(breakToSides[1]).asPageBreakItem());
		sideChoice.setChoices([choiceSideA, choiceSideB]);
	}

	// Update headers names and get ids of SQUADNAMES and remove SQUADNAMES ! marker
	var slotsSideA = form.getItemById(ids[2]).getHelpText();
	var slotsSideB = "0";
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
	var slotsHeadsSideB  = "0";
	slotsParts = dzn_getHeaderSlotsIds(slotsSideA);
	slotsSideA = slotsParts[0];
	slotsHeadsSideA = slotsParts[1];
	if (mode == "T") {
		slotsParts = dzn_getHeaderSlotsIds(slotsSideB);
		slotsSideB = slotsParts[0];
		slotsHeadsSideB = slotsParts[1];
	}
	
	// WRITE TO PROPERTIES
	PropertiesService.getScriptProperties().setProperties({
		"idName" : 			idName,										//  ID of Name item
		"idSections" : 		dzn_convert(slottingSections, "toString"),	//  IDs of Section for every side
		"idChoices" : 		dzn_convert(slottingChoices, "toString"),	//  IDs of Choices for every side		
		"idPrecense" : 		idPrecense,									//  ID of PrecenseItem
		"idPasscode" : 		idPasscode,									//  ID of Passcode item
		"idSidechoice" : 	idSidechoice,								//  ID of Side choice item
		"idOverall" : 		idOverall,									//  ID of Overall players names section
      
		"mode" : 			mode,  										//  form mode
		"sides" : 			dzn_convert(sidesNames, "toString"), 		//  Names of sides		
		"slotsSideA" : 		slotsSideA,									//  Original names of slots for side A
		"slotsHeadsSideA" : slotsHeadsSideA,							//  IDs of headers in slots names for side A
		"slotsSideB" : 		slotsSideB,									//  Original names of slots for side B
		"slotsHeadsSideB" : slotsHeadsSideB,							//  IDs of headers in slots names for side B
		"passcodes" : 		passcodes,									//  List of Allowed passcodes
      
		"usedSlotsSideA" : 	"0",										//  Used slots for side A
		"usedNicksSideA" : 	"0",										//  Used nicknames for side A
		"precenseSideA" : 	"0",										//  Precenses list for sideA
      
		"usedSlotsSideB" : 	"0",										//  Used slots for side B		
		"usedNicksSideB" : 	"0",										//  Used nicknames for side B
		"precenseSideB" : 	"0"											//  Precenses list for sideB		
	}, true);

	// Deleting blocks with SIDE and SLOTS settings	
	for (var i = 0; i < ids.length; i++) {
		form.deleteItem(form.getItemById(ids[i]).getIndex());
	}
	
	// Set confirm message
	form.setConfirmationMessage(str.formConfirm);
	Logger.log("Initialized");
	// Running save trigger to update form
   // dzn_onSave();
}

//
// Main flow
//
function dzn_onSave() {  
	function dzn_checkResponses() { 
		
		function dzn_trim(str) {
			var	str = str.replace(/^\s\s*/, ''),
				ws = /\s/,
				i = str.length;
			while (ws.test(str.charAt(--i)));
			return str.slice(0, i + 1);
		}

		var formResponses = form.getResponses();   		
		var duplicates = [];    
		
		var response = formResponses[formResponses.length-1];
      
		if (response != null) {        
			// Get form response
			var sideResponse, slotResponse, usedSlots, usedNicks, usedSlotsOpposite, usedNicksOpposite, precenseList, precenseListOpposite
			var nickResponse = response.getResponseForItem(form.getItemById(data.idName));
			var precenseResponse = response.getResponseForItem(form.getItemById(data.idPrecense));
			var passcodeResponse = response.getResponseForItem(form.getItemById(data.idPasscode));

			if (data.mode == "T") {
				// if TVT: Assign slots/nicks of the chosen side and opposite side (for removing from)
              Logger.log(data.idSidechoice)
				sideResponse = response.getResponseForItem(form.getItemById(data.idSidechoice));	
				if (data.sides.indexOf(sideResponse.getResponse()) == 0) {
					slotResponse = response.getResponseForItem(form.getItemById(data.idChoices[0]));
					usedSlots 				= data.usedSlotsSideA;
					usedNicks 				= data.usedNicksSideA;
					usedSlotsOpposite 		= data.usedSlotsSideB;
					usedNicksOpposite	 	= data.usedNicksSideB;
					precenseList 			= data.precenseSideA;
					precenseListOpposite	= data.precenseSideB;
				} else {
					slotResponse = response.getResponseForItem(form.getItemById(data.idChoices[1]));
					usedSlots 				= data.usedSlotsSideB;
					usedNicks 				= data.usedNicksSideB;
					usedSlotsOpposite 		= data.usedSlotsSideA;
					usedNicksOpposite 		= data.usedNicksSideA;
					precenseList 			= data.precenseSideB;
					precenseListOpposite 	= data.precenseSideA;
				}	
			} else {
				// if NOT TVT: assign slots and nicks               
				slotResponse = response.getResponseForItem(form.getItemById(data.idChoices));
				usedSlots 					= data.usedSlotsSideA;
				usedNicks 					= data.usedNicksSideA;
				precenseList 				= data.precenseSideA;	
			}

			function dzn_assignSlot(nick, slot, precense) {
				var nickIndex = usedNicks.indexOf(nick);  // Id of NICK at the side's usedNick/Slot array
				if (duplicates.indexOf(nick) == -1) {
					duplicates.push(nick);
					Logger.log("Duplicates: %s", duplicates);
					// Update or Add nick/slot to side's usedSlot/Nick array
					if (nickIndex > -1) {
						// Change Nickname-Slot
						if (slot != 'Без слота') {
							// Change slot
							usedSlots[nickIndex] = slot;
							precenseList[nickIndex] = precense;
						} else {
							// Remove from any slot
							usedNicks.splice(nickIndex,1);
							usedSlots.splice(nickIndex,1);
							precenseList.splice(nickIndex,1);
						}
					} else {
						// Add Nickname and Slot
						usedNicks.push(nick);
						usedSlots.push(slot);
						precenseList.push(precense);						
						// If TVT - remove nick/slot from opposite side's arrays (if had been added earlier)
						if (data.mode == "T") {
							var idToRemove = usedNicksOpposite.indexOf(nick);
							if ( idToRemove > -1 ) {
								usedNicksOpposite.splice(idToRemove,1);
								usedSlotsOpposite.splice(idToRemove,1);
								precenseListOpposite.splice(idToRemove,1);
							}
						}
					}
				}
			}
		  
			// Get actual values of response NICK and SLOT
			var nick = dzn_trim(nickResponse.getResponse()); // string
			var slot = slotResponse.getResponse(); // array

			function dzn_unassignMultipleSlots() {
				// There is NO SLOT chosen
				Logger.log(usedNicks);
				Logger.log(usedNicks.length);        
				var nickRE = new RegExp (nick + "-sq\\\d{1,2}$");						
				for (var k = 0; k < usedNicks.length; k++) {
					Logger.log(k.toString());
					Logger.log(nickRE.test(usedNicks[k]))
					if (nickRE.test(usedNicks[k])) {
						var numeredNick = usedNicks[k];
						Logger.log(numeredNick);
						dzn_assignSlot(numeredNick, 'Без слота', precense);
						   k--;
					}
				}
			};
			
			var precense;
			if (precenseResponse == null) {
				// No response were given
				precense = "10";
			} else {
				// Get value from response
				precense = precenseResponse.getResponse();
			}	
			
			if (slot.length == 1) {				
				// Chosen single 'Unassign slot'
					// Passcode given -- e.g. squad unassigment
				var passcode;
				if ((passcodeResponse != null) 
					&& (data.passcodes.indexOf(passcodeResponse.getResponse()) > -1) ) {					
					dzn_unassignMultipleSlots();
				} else {					
					// Passcode Not ginve -- e.g. single man				
					dzn_assignSlot(nick, slot[0], precense);
				}			
			} else {				
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
		var propertyList = ["usedSlotsSideA", "usedSlotsSideB",  "usedNicksSideA", "usedNicksSideB", "precenseSideA", "precenseSideB"];
		for (var i = 0; i < propertyList.length; i++) {
			var property = data[propertyList[i]];
			if (property.length == 0) { property = [0] };
			property = dzn_convert(property, "toString");
			properties.setProperty(propertyList[i], property);
		}
	}

	// Get updated info for SLOTTING section and AVAILABLE SLOTS for side (according given slots/usedSlots)
	// INPUT:	form, usedNicks, usedSlots, slots, headers  || OUTPUT:	0 sectionInfoOutput, 1 slots
	function dzn_getUpdatedInfo(usedNicks, usedSlots, precenses, slots, headers) {
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
				nicknameToShow = nicknameToShow.replace(/(\w+)(-sq)\d{1,2}$/, "$1");
              if (nickList.indexOf(nicknameToShow) == -1) {
				nickList.push(nicknameToShow);
              }
				
				var infoString = "? " + sectionInfo[slotIndex] + " -- " + nicknameToShow;           
				if ((precenses[i] > 0) && (precenses[i] < 8)) {               
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

		return [sectionInfoOutput, slots, nickList];
	}

	Logger.log("   Running dzn_onSave");
	var form = FormApp.getActiveForm();  
    var properties = PropertiesService.getScriptProperties();
  
	// Get DATA from PropertiesService
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
		data[key] = value;	// A: Array [ 1, 2, 3]; B: Array []; C: Sting "1"		
    }
/* idName, idSections, idChoices, idPrecense, idOverall, idPasscode, idSidechoice, mode
 usedSlotsSideA, usedSlotsSideB, usedNicksSideA, usedNicksSideB, precenseSideA, precenseSideB
 sides, slotsSideA, slotsSideB, slotsHeadsSideA, slotsHeadsSideB, passcodes	*/

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
			data.usedNicksSideA, data.usedSlotsSideA, data.precenseSideA, 
			data.slotsSideA, data.slotsHeadsSideA
		);
      
// Logger.log("UPDATE INFO:\n%s", updatedSideInfo[0]);
		// OUT: sectionInfoOutput, slots
		updatedSideInfo[1].push("Без слота");		
		form.getItemById(data.idSections).setHelpText(updatedSideInfo[0]);
		form.getItemById(data.idChoices).asCheckboxItem().setChoiceValues(updatedSideInfo[1]);

		roleItem.setHelpText(str.slots);
	} else {
		var updatedSideInfoSideA = dzn_getUpdatedInfo(
			data.usedNicksSideA, data.usedSlotsSideA, data.precenseSideA, 
			data.slotsSideA, data.slotsHeadsSideA
		);		
		var updatedSideInfoSideB = dzn_getUpdatedInfo(
			data.usedNicksSideB, data.usedSlotsSideB, data.precenseSideB, 
			data.slotsSideB, data.slotsHeadsSideB
		);
		// OUT: sectionInfoOutput, slots for SIDE A
		updatedSideInfoSideA[1].push("Без слота");				
		form.getItemById(data.idSections[0]).setHelpText(updatedSideInfoSideA[0]);
      Logger.log(data.idChoices)
		form.getItemById(data.idChoices[0]).asCheckboxItem().setChoiceValues(updatedSideInfoSideA[1]);
		// OUT: sectionInfoOutput, slots for SIDE B
		updatedSideInfoSideB[1].push("Без слота");	
		form.getItemById(data.idSections[1]).setHelpText(updatedSideInfoSideB[0]);
		form.getItemById(data.idChoices[1]).asCheckboxItem().setChoiceValues(updatedSideInfoSideB[1]);

		// Update Overall info
		var overallInfo = data.sides[0] + "\n" + updatedSideInfoSideA[2].join(", ") + "\n\n"
			+ data.sides[1] + "\n" + updatedSideInfoSideB[2].join(", ");			
		form.getItemById(data.idOverall).setHelpText(overallInfo);
	}
	
	Logger.log('    << End of dzn_onSave');
}


function dzn_setStringtable() {
	var str = {
		"precense" 		:	"Если считаешь, что не успеешь на игру и об этом должны знать все - укажи, пожалуйста, вероятность своего появления на игре (1 = 10%, 7 = 70%).",
		"passcode" 		:	"Ввод паскода(выданного только лидерам ленивых отрядов) позволит занять несколько слотов. Если у Вас нет паскода и/или Вы не собираетесь занимать более одного слота - не заполняйте поле.",
		"nick"			:	"",
		"slots"			:	"Выберите одну из доступных ролей из списка ниже.",
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
