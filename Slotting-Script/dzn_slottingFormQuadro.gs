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
		"idName" : 		idName, // ID of Name item
		"idSections" : 		dzn_convert(slottingSections, "toString"), // IDs of Section for every side
		"idChoices" : 		dzn_convert(slottingChoices, "toString"), // IDs of Choices for every side
		"idPrecense" : 		idPrecense, // ID of PrecenseItem
		"idPasscode" : 		idPasscode, // ID of Passcode item
		"idSidechoice" : 	idSidechoice, // ID of Side choice item
		"idOverall" : 		idOverall, // ID of Overall players names section
		
		"mode" : 		mode, // form mode
		
		"sides" : 		dzn_convert(sidesNames, "toString"), // Names of sides
		
		"slotsSideA" : 		slotsNames[0], // Original names of slots for side A
		"slotsHeadsSideA" : 	slotsHeads[0], // IDs of headers in slots names for side A
		
		"slotsSideB" : 		slotsNames[1], // Original names of slots for side B
		"slotsHeadsSideB" : 	slotsHeads[1], // IDs of headers in slots names for side B
		
		"slotsSideC" : 		slotsNames[2], // Original names of slots for side C
		"slotsHeadsSideC" : 	slotsHeads[2], // IDs of headers in slots names for side C
		
		"slotsSideD" : 		slotsNames[3], // Original names of slots for side D
		"slotsHeadsSideD" : 	slotsHeads[3], // IDs of headers in slots names for side D
		
		"passcodes" : 		passcodes, // List of Allowed passcodes
		
		"usedSlotsSideA" : 	"0", // Used slots for side A
		"usedNicksSideA" : 	"0", // Used nicknames for side A
		"precenseSideA" : 	"0", // Precenses list for sideA
		
		"usedSlotsSideB" : 	"0", // Used slots for side B
		"usedNicksSideB" : 	"0", // Used nicknames for side B
		"precenseSideB" : 	"0"	// Precenses list for sideB
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
