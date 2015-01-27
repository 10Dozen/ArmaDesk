// *****************
// Show UI on Open
function onOpen() {
	SpreadsheetApp.getUi()
		.createMenu('FSD Tools')
		.addItem('Create FSD Tools Folder on Drive', 'dzn_createFolderFromMenu')
		.addSeparator()
		.addItem('⌕ Parse Mission.sqm', 'dzn_mp_parseFromMenu')
		.addItem('✔ Confirm Data', 'dzn_mp_confirmParsingFromMenu')
		.addSeparator()
		.addItem('Create Sloting form COOP', 'dzn_createSlottingCoopFromMenu')
		.addItem('Create Sloting form TVT', 'dzn_createSlottingTvtFromMenu')
		.addSeparator()
		.addItem('Show Sidebar', 'showSidebar')
		.addToUi();
 }

// *****************
// Show sidebar
function showSidebar(link1, link2) {
	var htmlOut = "<style>p, li {font-size: 6;}div {background: #2E2E2E; width: 250px; border-radius: 12px; color: #FFCC00; font-family: 'Trebuchet MS', monospace; padding-left: 16px;}a {  padding-left: 30px; font-family: Consolas, monospace; border-radius: 52px; font-size: 14; text-decoration: none;}</style><p>FSD Slotting Tool - is a way to create slotting and feedback forms for your multiplayer online game.<p>";
  	var ss = SpreadsheetApp.getActive();
	if (link1 != null) {
		htmlOut = htmlOut + "<div>Newly Created Forms</div><a href='" 
			+ link1 
			+ "' target='_blank' title='"
            + ss.getRangeByName('slotName').getValue()
            + "'>Slotting Form</a>";
		if (link2 != null) {
			htmlOut = htmlOut + "<br><a href='" 
				+ link2 
				+ "' target='_blank' title='"
                + ss.getRangeByName('feedName').getValue()
                + "'>Feedback Form</a>"; 
		}
	} else {
		if (SpreadsheetApp.getActive().getRangeByName('slotURL').getValue() != "") {
			htmlOut = htmlOut + "<div>Last Created Forms</div><a href='" 
				+ ss.getRangeByName('slotURL').getValue() 
				+ "' target='_blank' title='"
                + ss.getRangeByName('slotName').getValue()
                + "'>Slotting Form</a>";
			if (SpreadsheetApp.getActive().getRangeByName('feedURL').getValue() != "") {
				htmlOut = htmlOut + "<br><a href='" 
					+ ss.getRangeByName('feedURL').getValue() 
					+ "' target='_blank' title='"
                    + ss.getRangeByName('feedName').getValue()
                    + "'>Feedback Form</a>";
			}
		}
	}

	htmlOut = htmlOut + dzn_htmlInstruction();
  
	var html = HtmlService.createHtmlOutput(htmlOut)    
		.setSandboxMode(HtmlService.SandboxMode.IFRAME)
		.setTitle('FSD Slotting Tools')
		.setWidth(300)
	SpreadsheetApp.getUi().showSidebar(html); 
}


// *****************
// Creating base folder
function dzn_createFolderFromMenu() {    
	if (DriveApp.getFoldersByName("ARMA FSD Tools").hasNext()) {
		SpreadsheetApp.getUi().alert('✔ OK\n\nFolder already exists');
	} else {        
		SpreadsheetApp.getUi().alert('Folder with name "ARMA FSD Tools" will be created in the root of your Google Drive');
		DriveApp.createFolder("ARMA FSD Tools");
		SpreadsheetApp.getUi().alert('✔ OK\n\nFolder "ARMA FSD Tools" was created successfully');
	}  
}

// *****************
// Check the existance of work folder
function dzn_checkFolderExists() {
	var output = true;
	if (!(DriveApp.getFoldersByName("ARMA FSD Tools").hasNext())) {
		SpreadsheetApp.getUi().alert('⊗ WARNING!\n\nThere is no "ARMA FSD Tools" folder on your Drive.\n\nPlease, create it via "FSD Tools" menu');    
		output = false;
	}
	return output
}

// *****************
// Creating COOP or TVT form from menu
function dzn_createSlottingCoopFromMenu() {
	if (dzn_checkFolderExists()) {
		SpreadsheetApp.getUi().alert('Starting to creating COOP Forms.\n\nPress OK and wait for a while.'); 
		dzn_createForm('COOP'); 
	}
}

function dzn_createSlottingTvtFromMenu() {
	if (dzn_checkFolderExists()) {
		SpreadsheetApp.getUi().alert('Starting to creating TVT Forms.\n\nPress OK and wait for a while.'); 
		dzn_createForm('TVT'); 
	}
}

// *****************
// Creating Slotting form for COOP
function dzn_createForm(mode) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
  
	// Запрашиваем создание формы слоттинга
	var formSlotName = dzn_getSlotFormName(mode);   
	if (formSlotName[1] != "null") {
		// Clear URLs
		ss.getRangeByName("slotURL").clearContent();
		ss.getRangeByName("slotURL").clearContent();
      	ss.getRangeByName("feedURL").clearContent();
		ss.getRangeByName("feedName").clearContent();
      
		var slotFormUrl, feedFormUrl
		var folder =  DriveApp.getFoldersByName("ARMA FSD Tools").next().createFolder(formSlotName[0]);	 
		var formSlotId = FormApp.create(formSlotName[0]).getId();		
		folder.addFile(DriveApp.getFileById(formSlotId));
		DriveApp.getRootFolder().removeFile(DriveApp.getFileById(formSlotId)); 
		slotFormUrl = DriveApp.getFileById(formSlotId).getUrl();
      
		var propSheetId = SpreadsheetApp.create('properties ' + formSlotName[0]).getId();
		folder.addFile(DriveApp.getFileById(propSheetId));
		DriveApp.getRootFolder().removeFile(DriveApp.getFileById(propSheetId));
      
		var propSheet = SpreadsheetApp.openById(propSheetId);
      
		// Запрашиваем создание формы фидбека
		var formFeedName = dzn_isFeedbackNeeded(mode, formSlotName[1]);
		if (formFeedName != "null") {
			var formFeedId = FormApp.create(formFeedName).getId();
			folder.addFile(DriveApp.getFileById(formFeedId));
			DriveApp.getRootFolder().removeFile(DriveApp.getFileById(formFeedId));
			feedFormUrl = DriveApp.getFileById(formFeedId).getUrl();          
          
			dzn_addNamedRanges("Feed", propSheetId, ss.getId(), mode); 
			// PreInitialize Feedback Form
			dzn_feedForm_preInitialize(formFeedId, propSheet.getId()); 
        }

		dzn_addNamedRanges("Slot", propSheetId, ss.getId(), mode);
		// Pre-initialize Slotting Form
		dzn_slotForm_preInitialize(formSlotId, propSheet.getId());

		ss.getRangeByName("slotURL").setValue(slotFormUrl);
		ss.getRangeByName("slotName").setValue(formSlotName[0]);
		if (feedFormUrl != null) {			
			ss.getRangeByName("feedURL").setValue(feedFormUrl);
			ss.getRangeByName("feedName").setValue(formFeedName);
            showSidebar(slotFormUrl, feedFormUrl);
		} else {
			showSidebar(slotFormUrl)
		}

		SpreadsheetApp.getUi().alert('✔ OK\n\nForm was successufully created!\n\nCheck Sidebar for URLs');   
	};
}


// *****************
// Create PROMPT and return the answer for SLOTTING FORM
function dzn_getSlotFormName(gametype) {
	var ui = SpreadsheetApp.getUi();
	var result = "";
	var output = ["null"];
	
	result = ui.prompt('Create Form - Mission Title','Please enter the Mission Title:', ui.ButtonSet.OK_CANCEL);
	var button = result.getSelectedButton();
	var text = result.getResponseText();
	if (button == ui.Button.OK) {
		if (text.length == 0) {
			text = dzn_getToday();
		}
		output = [(gametype + ' ' + text), text];
	}
	return output
}

// *****************
// Create PROMPT and return YES/NO to create FEEDBACK
function dzn_isFeedbackNeeded(gameType, gameName) {
	var ui = SpreadsheetApp.getUi();	
	var output = "null";
	var result = ui.alert('Do you want to create Feedback form?', ui.ButtonSet.YES_NO);
	if (result == ui.Button.YES) {
		output = gameType + ' AAR ' + gameName;
	}
	return output
}

// *****************
// Return today date
function dzn_getToday() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(dd<10) {dd='0'+dd};
	if(mm<10) {mm='0'+mm};
	today = mm+'/'+dd+'/'+yyyy;
	return today
}

// ***************************************
// COMMON FORMS
// ***************************************

function dzn_htmlInstruction() {
	var htmlText = 
	"<br><br><div>How to use?</div><ol><li>Add 'ARMA FSD Tools' work folder to your Drive. Go to 'FSD Tools' menu and click 'Create FSD Tools Folder on Drive'</li><br><li>Copy your mission from mission.sqm file</li><li>Paste your mission to 'INPUT: mission.sqm' sheet</li><br><li>Parse your mission file to get role names. Click 'Parse Mission.sqm' from 'FSD Tools' menu</li><li>After your mission is parsed, check 'Main' sheet to view and edit roles and squads (marked like '!  Alpha')</li><li>Check and edit additional parameters - playable sides, default settings of Feedback forms, etc.</li><br><li>When ready, confirm your data, using 'Confirm Data' from 'FSD Tools' menu</li><p><b>Now you can create Forms with confirmed data. Check next steps</b></p><li>Use 'FSD Tools' -> 'Create Slotting form COOP' or 'Create Slotting form TVT'</li><li>Enter your mission title and click OK</li><li>Do you want to get feedback after misson? Then click YES on pop-up.</li><li>Relax and wait for a while</li><li>After confirmation message appeared, check the links at sidebar (check bottom) and open them in the new tab</li><p><b>Form was created and waiting for your attention. Check the values of existing items and edit them if you need it</b></p><li>When you are ready, click 'Start Feedback form' from Form's 'FSD Tools' menu</li><li>Now form will be prepared for publishing. Take a minute for relax and you are almost done</li><li>Check 'Change Theme' to give your forms some kawaiiness</li><li>Publish it!</li></ol><p>If you don't want to use the form anymore - do not forget to <b>'Inactivate'</b> it from form's 'FSD Tools' menu - form will be closed for respondents and all triggers will be terminated.<br /> Now you can simply delete it from your drive</p>"
	  
    return htmlText
}

function dzn_addNamedRanges(type, ssId, sourceId, mode) {
	var ss = SpreadsheetApp.openById(ssId);
	var source = SpreadsheetApp.openById(sourceId);
  
	if ( type == 'Feed' ) {
		ss.setNamedRange("feedForm_defRoles",ss.getRange("B1"));
		ss.setNamedRange("feedForm_defBrief",ss.getRange("B2"));
		ss.setNamedRange("feedForm_defAction",ss.getRange("B3"));
		ss.setNamedRange("feedForm_defResult",ss.getRange("B4"));
		ss.setNamedRange('feedForm_ids', ss.getRange('B5'));
		ss.setNamedRange('feedForm_names', ss.getRange('B6'));
          
		ss.getRangeByName("feedForm_defRoles").setValue(source.getRangeByName("feedForm_defRoles").getValue());
		ss.getRangeByName("feedForm_defBrief").setValue(source.getRangeByName("feedForm_defBrief").getValue());
		ss.getRangeByName("feedForm_defAction").setValue(source.getRangeByName("feedForm_defAction").getValue());
		ss.getRangeByName("feedForm_defResult").setValue(source.getRangeByName("feedForm_defResult").getValue());
	} else {
		ss.setNamedRange("slotForm_defModes",ss.getRange("A1"));
		ss.setNamedRange("slotForm_defSides",ss.getRange("A2"));
		ss.setNamedRange("slotForm_defSlots1",ss.getRange("A3"));
		ss.setNamedRange("slotForm_defSlots2",ss.getRange("A4"));
		ss.setNamedRange("slotForm_defSlots3",ss.getRange("A5"));
		ss.setNamedRange("slotForm_defSlots4",ss.getRange("A6"));
		ss.setNamedRange("slotForm_defPass",ss.getRange("A7"));
		ss.setNamedRange("slotForm_ids",ss.getRange("A8"));
		//"slotForm_idName","slotForm_idSections","slotForm_idChoices","slotForm_idPrecense","slotForm_idPasscode","slotForm_idSidechoice","slotForm_idOverall",
		//"slotForm_mode","slotForm_passcodes","slotForm_sides","slotForm_precense","slotForm_slotsNames","slotForm_slotsHeadsNames","slotForm_usedSlots","slotForm_usedNicks"
		ss.setNamedRange("slotForm_idName",ss.getRange("A9"));
		ss.setNamedRange("slotForm_idSections",ss.getRange("A10"));
		ss.setNamedRange("slotForm_idChoices",ss.getRange("A11"));
		ss.setNamedRange("slotForm_idPrecense",ss.getRange("A12"));
		ss.setNamedRange("slotForm_idPasscode",ss.getRange("A13"));
		ss.setNamedRange("slotForm_idSidechoice",ss.getRange("A14"));
		ss.setNamedRange("slotForm_idOverall",ss.getRange("A15"));
		ss.setNamedRange("slotForm_mode",ss.getRange("A16"));
		ss.setNamedRange("slotForm_passcodes",ss.getRange("A17"));
		ss.setNamedRange("slotForm_sides",ss.getRange("A18"));
		ss.setNamedRange("slotForm_precense",ss.getRange("A19"));
		ss.setNamedRange("slotForm_slotsNames",ss.getRange("A20"));
		ss.setNamedRange("slotForm_slotsHeadsNames",ss.getRange("A21"));
		ss.setNamedRange("slotForm_usedSlots",ss.getRange("A22"));
		ss.setNamedRange("slotForm_usedNicks",ss.getRange("A23"));  

		ss.getRangeByName("slotForm_defModes").setValue(mode);
		ss.getRangeByName("slotForm_defSides").setValue(source.getRangeByName("slotForm_defSides").getValue());
		ss.getRangeByName("slotForm_defSlots1").setValue(source.getRangeByName("slotForm_defSlots1").getValue());
		ss.getRangeByName("slotForm_defSlots2").setValue(source.getRangeByName("slotForm_defSlots2").getValue());
		ss.getRangeByName("slotForm_defSlots3").setValue(source.getRangeByName("slotForm_defSlots3").getValue());
		ss.getRangeByName("slotForm_defSlots4").setValue(source.getRangeByName("slotForm_defSlots4").getValue());
		ss.getRangeByName("slotForm_defPass").setValue(source.getRangeByName("slotForm_defPass").getValue());
	}
	Logger.log('Properties set');
}

// **********************
// Return property sheet
function dzn_form_getPropertySheet(formId, type) {
	var formName    
	if (formId == null) {
		formName = DriveApp.getFileById(FormApp.getActiveForm().getId()).getName();
	} else {
		formName = DriveApp.getFileById(formId).getName();
	}
	var startPos
	if (type == 'slot') {
		startPos = 4;
	} else {
		startPos = 8;
	}

	var sourceName
	if (formName.substring(0,3) == 'TVT') {
		sourceName = 'properties TVT ' + formName.substring(startPos,formName.length);
	} else {
		sourceName = 'properties COOP ' + formName.substring(startPos+1,formName.length);
	}  

	return (DriveApp.getFilesByName(sourceName).next().getId())
}


// ***********************
// Close all triggers for Form
function dzn_form_inactivateFormFromMenu() {
	var form = FormApp.getActiveForm();
	var formId = form.getId();
	var triggers = ScriptApp.getUserTriggers(form)    
	for (var i = 0; i < triggers.length; i++) {		
		ScriptApp.deleteTrigger(triggers[i]); 
	}
	form.setAcceptingResponses(false);

	FormApp.getUi().alert('✔ OK\n\nForm inactivated!');
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

// *****************************************
// SLOTTING FORM
// *****************************************

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


// ***********************************************
// FEEDBACK FORM
// ***********************************************

function dzn_feedForm_getStringtable() {
	var strvals = {
		"defaultRoles" : 	["Alhpa - SL", "Alpha - Medic", "Alpha 1 - FTL", "Alpha 1 - AR", "Alpha 1 - AAR", "Alpha 1 - Rifleman"],
		"defaultBriefing" : ["Быстро", "Понятно", "Медленно", "Непонятно"],
		"defaultAction" : 	["Организованно", "Тактикульно", "Весело", "Скучно", "Сплошной пост-рок", "Как стадо"],
		"defaultResult" : 	["Все молодцы", "Школота сплошная", "У всех бугурт", "Только я один в белом пальто красивый", "Элитный чейрборн"],
		"strNick" : "",
		"strScore" : 		"Общее ощущение от игры",
		"strRole" : 		"Выберите вашу роль в миссии",
		"strBriefingScore" : "Как прошел брифинг?",
		"strBriefing" : 	"Опишите как вы поняли задачу вашего отряда и общую задачу вашей стороны",
		"strActionScore" : 	"Как прошла мисиия?",
		"strAction" : 		"Опишите, что с вами приключилось за игру",
		"strResultScore" : 	"Что по итогу?",
		"strResult" : 		"Выскажите свое мнение по итогам игры - похвалите напарников, поругайте тим киллеров.",
		"strResponse" : 	"Спасибо за фидбек! Вновь посетите форму, чтобы увидеть свой овтет."
	};
	return strvals
}


//***********************
// Adds FSD Menu for Feedback Form
function dzn_feedForm_addMenu() {
	FormApp.getUi()
		.createMenu('FSD Tools')
		.addItem('✓ Start Feedback form', 'dzn_feedForm_initializeFromMenu')
		.addSeparator()
		.addItem('↺ Recreate with Defaults', 'dzn_feedForm_preInitializeFromMenu')		
  		.addItem('⨯ Inactivate Feedback form', 'dzn_form_inactivateFormFromMenu')
		.addToUi();
}

//*****************************
// Preinitialize the form from Menu
function dzn_feedForm_preInitializeFromMenu() {
	var formId = FormApp.getActiveForm().getId();
	var ssId = dzn_form_getPropertySheet(formId, 'feed');
  Logger.log(ssId);
  
	dzn_feedForm_preInitialize(formId,ssId);
	FormApp.getUi().alert('✔ OK\n\nDefault view restored');
}

//*****************************
// Preinitialize the form
function dzn_feedForm_preInitialize(formId, ssId) {
	var form = FormApp.openById(formId);

	Logger.log('Pre-Initialization!  Clearing form!');
	var items = form.getItems();
	for (var i = 0; i < items.length; i++) {form.deleteItem(items[i]);}
	form.deleteAllResponses();
	
	Logger.log('  Adding input forms!');
	var headers = ["Roles Values", "Briefing feedback Values", "Action feedback Values", "Result feedback Values"];

	var ss = SpreadsheetApp.openById(ssId);
	var values = [
		ss.getRangeByName('feedForm_defRoles').getValue(),
		ss.getRangeByName('feedForm_defBrief').getValue(),
		ss.getRangeByName('feedForm_defAction').getValue(),
		ss.getRangeByName('feedForm_defResult').getValue()
	];
	
	var ids = [];
	for (var i = 0; i < headers.length; i++) {
		var itemId = form.addSectionHeaderItem().setTitle(headers[i]).setHelpText(values[i]).getId();
		ids.push(itemId);
	}
   
	ss.getRangeByName('feedForm_ids').setValue(ids.join(" | "));  

	var triggers = ScriptApp.getUserTriggers(form);
	for (var i = 0; i < triggers.length; i++) {
		ScriptApp.deleteTrigger(triggers[i]);
	}
	ScriptApp.newTrigger('dzn_feedForm_addMenu').forForm(form).onOpen().create();  

	Logger.log('Pre-Initialized!');
}

//***********************
// Initialize Feedback Form
function dzn_feedForm_initializeFromMenu() {
	Logger.log('Initialization!');
	Logger.log('Get IDs from PropertyService!');

	var form = FormApp.getActiveForm();
	var strVars = dzn_feedForm_getStringtable(); // [ names, defaults ]
	var ss = SpreadsheetApp.openById(dzn_form_getPropertySheet(form.getId(), 'feed')); //properties

	var idList = ss.getRangeByName('feedForm_ids').getValue().split(" | ");
	Logger.log('   Get input values');
	var inputKeyNames = ["roles", "briefing", "action", "result"];
	var inputDefaults = [strVars.defaultRoles, strVars.defaultBriefing, strVars.defaultAction, strVars.defaultResult];

	var inputs = {"name" : "CustomizedInputs"};
	for (var i = 0; i < idList.length; i++) {
		var inputValue = form.getItemById(idList[i]).getHelpText();
		if (inputValue.length > 0) {
			inputs[inputKeyNames[i]] = inputValue.split(" | ");
		} else {
			inputs[inputKeyNames[i]] = inputDefaults[i];
		}
	}  

	Logger.log('  Clearing form');
	var items = form.getItems();
	for (var i = 0; i < items.length; i++) {form.deleteItem(items[i]);}

	Logger.log('   Add new items');
	var itemMap = [
		"img",
		"brkAAR - Фидбек",
		"sclОбщая оценка",      
		"strНик в игре",
		"lstРоль",
		"brkAAR - Часть 1 - Планирование",
			"cbx0Брифинг",
			"tbx0Брифинг",
		"brkAAR - Часть 2 - Исполнение",
			"cbx1Акция",
			"tbx1Акция",
		"brkAAR - Часть 3 - Выводы",
			"cbx2Результаты",
			"tbx2Результаты"
	];  		

	var ids = {"name" : "IDs of Items"};
	for (var i = 0; i < itemMap.length; i++) {
		var name = itemMap[i];
		var itemName = name.substring(3,name.length); //item displayed names

		//Item names: img - image, brk - break page, scl - scale item, str - oneline text, lst - list, cbx - checkbox, tbx - text box
		var itemType = name.substring(0,3);
		switch (itemType) {
			case "img":
				var img = UrlFetchApp.fetch('http://cs608928.vk.me/v608928222/5f5f/MQqIEc6_iKY.jpg');
				form.addImageItem().setTitle(itemName).setImage(img).setAlignment(FormApp.Alignment.CENTER);
				break;
			case "brk":
				form.addPageBreakItem().setTitle(itemName);
				break;
			case "scl":
				var itemId = form.addScaleItem().setTitle(itemName).setHelpText(strVars.strScore)
                                .setLabels("Не понравилось", "Фантастически!").setBounds(0,10)
                                .getId().toString();
				ids["scoreId"] = itemId;
				break;
			case "str":
				var itemId = form.addTextItem().setTitle(itemName).setHelpText(strVars.strNick).getId().toString();;
				ids["nickId"] = itemId;
				break;
			case "lst":
				var itemId = form.addListItem().setTitle(itemName).setHelpText(strVars.strRole).setChoiceValues(inputs.roles).getId().toString();
				ids["roleId"] = itemId;
				break;
			case "cbx":
				var item = form.addCheckboxItem().setTitle(itemName.substring(1,itemName.length));            
				var helpText, choices, key;
				switch (name.substring(3,4)) {
					case "0":
						helpText = strVars.strBriefingScore;
						choices = inputs.briefing;
						key = "briefingScoreId";
						break;
					case "1":
						helpText = strVars.strActionScore;
						choices = inputs.action;
						key = "actionScoreId";
						break;
					case "2":
						helpText = strVars.strResultScore;
						choices = inputs.result;
						key = "resultScoreId";
						break;
				}
				item.setHelpText(helpText).setChoiceValues(choices);
				ids[key] = item.getId().toString();
				break;
			case "tbx":
				var item = form.addParagraphTextItem().setTitle(itemName.substring(1,itemName.length));            
				var helpText, key;
				switch (name.substring(3,4)) {
					case "0":
						helpText = strVars.strBriefing;				       
						key = "briefingId";
						break;
					case "1":
						helpText = strVars.strAction;
						key = "actionId";
						break;
					case "2":
						helpText = strVars.strResult;
						key = "resultId";
						break;
				}
				item.setHelpText(helpText);
				ids[key] = item.getId().toString();
				break;
		}
	}

	form.setProgressBar(true);
	form.setConfirmationMessage(strVars.strResponse)

	Logger.log('  Add properties');
	var idsArray = [
		ids.scoreId, ids.nickId, ids.roleId, 
		ids.briefingScoreId, ids.briefingId,
		ids.actionScoreId, ids.actionId,
		ids.resultScoreId, ids.resultId
	];
  
	ss.getRangeByName('feedForm_names').setValue('scoreId | nickId | roleId | briefScoreId | briefingId | actionScoreId | actionId | resultScoreId | resultId');
	ss.getRangeByName('feedForm_ids').setValue(idsArray.join(" | "));
  
	Logger.log('Feedback Form Initialized!');
	ScriptApp.newTrigger('dzn_feedForm_onSave').forForm(form).onFormSubmit().create();
	FormApp.getUi().alert('✔ OK\n\nFeedback Form Initialized!');
}

// **************************
// On Save
function dzn_feedForm_onSave() {
	var form = FormApp.getActiveForm();
	var ss = SpreadsheetApp.openById(dzn_form_getPropertySheet(form.getId(), 'feed')); //properties
	Logger.log(form);
  	Logger.log(form.getId());
	var idNames = ss.getRangeByName('feedForm_names').getValue().split(" | ");
	var idItems = ss.getRangeByName('feedForm_ids').getValue().split(" | ");

	var formResponse = form.getResponses();
	var lastResponse = formResponse[formResponse.length-1];
	var response = {"name" : "Response"};
	for (var i = 0; i < idNames.length; i++) {response[idNames[i]] = idItems[i];}

	// Head
	var headItems = ["nickId","roleId","scoreId"];
	var formattedResponses = [];
	for (var i = 0; i < headItems.length; i++) {
		var currentResponse = lastResponse.getResponseForItem(form.getItemById(response[headItems[i]]));
		if (currentResponse != null) {
			currentResponse = currentResponse.getResponse();
			if (currentResponse == 10) {
				currentResponse = "10 из 10!"; 
			}
        	} else {
			switch (i) {
				case 1:
					currentResponse = '';
					break;
				case 2:
					currentResponse = 'Без оценки';
					break;
			}
		}
		formattedResponses.push(currentResponse);
	}
	var AARTitle = formattedResponses[0] + " (" + formattedResponses[1] + ") - " + formattedResponses[2];

	// Body
	var bodyItems = ["briefingId","actionId","resultId"];
	var formattedResponses = [];
	for (var i = 0; i < headItems.length; i++) {
		var currentResponse = lastResponse.getResponseForItem(form.getItemById(response[bodyItems[i]]));
		if (currentResponse != null) {
			currentResponse = currentResponse.getResponse()
			if (currentResponse == "") {
				currentResponse = "";
			} else {
				switch (i) {
					case 0:
						currentResponse = "\nО брифинге:\n    " + currentResponse + "\n";
						break;
					case 1:
						currentResponse = "\nОб исполнении:\n    " + currentResponse + "\n";
						break;
					case 2:
						currentResponse = "\nО результатах:\n    " + currentResponse + "\n";
						break;
				}
			}
		} else {
			currentResponse = "";
		}
		formattedResponses.push(currentResponse);
	}
	var AARBody = formattedResponses[0] + formattedResponses[1] + formattedResponses[2];

	// Footer
	var footerItems = ["briefScoreId","actionScoreId","resultScoreId"];
	var formattedResponses = [];
	for (var i = 0; i < headItems.length; i++) {
		var currentResponse = lastResponse.getResponseForItem(form.getItemById(response[footerItems[i]]));
		if (currentResponse != null) {
			if (currentResponse == "") {
				currentResponse = "";
			} else {
				currentResponse = currentResponse.getResponse()
				switch (i) {
					case 0:
						currentResponse = "\n  Брифинг:		" + currentResponse.join(", ");
						break;
					case 1:
						currentResponse = "\n  Акция:		" + currentResponse.join(", ");
						break;
					case 2:
						currentResponse = "\n  Выводы:		" + currentResponse.join(", ");
						break;
				}
			}
		} else {
			currentResponse = "";
		}
		formattedResponses.push(currentResponse);
	}
	var AARFooter = "";
	if (formattedResponses.join("") != "") {
		AARFooter = "\n\nСтатистика:" + formattedResponses[0] + formattedResponses[1] + formattedResponses[2];
	}

	// Adding item with Formatted Response
	var item = form.addSectionHeaderItem().setTitle(AARTitle).setHelpText(AARBody + AARFooter);
	form.moveItem(item.getIndex(), 1);

	Logger.log("AAR Added!");
}


// ****************************************************
// MISSION PARSER
// ****************************************************

function dzn_mp_parseFromMenu() {
	SpreadsheetApp.getUi().alert('Starting to parsing mission data.\n\nIt could take a long time.');
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var range = ss.getRangeByName('mp_sourceString').getValue().toString(); 
	// Source values
	var values = range.split(" | ");
  
	// Get SIDE-Roles
	var role 
	var eastRoles = [];
	var westRoles = [];
	var indepRoles = [];
	var civRoles = [];
  
	for (var i = 0; i < values.length; i++) {
			if (i % 2 == 0) {
				// Side
				role = [values[i]];      
		} else {
			// Role
			role.push(values[i]);
			switch (role[0]) {
				case "EAST":
					eastRoles.push(values[i])
					break;
				case "WEST":
					westRoles.push(values[i])
					break;
				case "INDEP":
					indepRoles.push(values[i])
					break;
				case "CIV":
					civRoles.push(values[i])
					break;
			}
		}
	} 
  
	// Get Squads and Fix Duplicates
	var westRolesParsed = dzn_mp_prepareRoles(westRoles);
	var eastRolesParsed = dzn_mp_prepareRoles(eastRoles);
	var indepRolesParsed = dzn_mp_prepareRoles(indepRoles);
	var civRolesParsed = dzn_mp_prepareRoles(civRoles);

	// Return Values to Lists
	dzn_mp_mapValuesIntoSheet(westRolesParsed,'mp_westRoles');
	dzn_mp_mapValuesIntoSheet(eastRolesParsed,'mp_eastRoles');
	dzn_mp_mapValuesIntoSheet(indepRolesParsed,'mp_indepRoles');
	dzn_mp_mapValuesIntoSheet(civRolesParsed,'mp_civRoles');
  
	SpreadsheetApp.getUi().alert('✔ OK\n\nMission.sqm file has been parsed.\n\nCheck values in the lists');
}

function dzn_mp_mapValuesIntoSheet(roles, startRange) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var mapRangeStart = ss.getRangeByName(startRange);
	for (var i = 0; i < roles.length; i++) {
		var cell = mapRangeStart.offset(i,0);
		cell.setValue(roles[i]);
	}
}

function dzn_mp_prepareRoles(roles) {
	function escapeDuplicates(name) {
		if (unitList.indexOf(name) > -1) {
			name = escapeDuplicates(name + '.')
		}    
    
		return name
	}
    
	var unitList = [];
	for (var i = 0; i < roles.length; i++) {    
		if (unitList.indexOf(roles[i]) > -1) {      
			var name = escapeDuplicates(roles[i] + '.');
			unitList.push(name);
		} else {
			unitList.push(roles[i]);
		}    
	}
	
	var holder = "!   ";
	var units = [];  
	for (var i = 0; i < unitList.length; i++) {
		// Get SQUAD name
		var open = unitList[i].indexOf('[');
		var close = unitList[i].indexOf(']');
		var sqName = unitList[i].substring(open+1, close);
    
		if (units.indexOf(holder + sqName) < 0) {
			units.push(holder + sqName) 
		} 
		units.push(unitList[i]);    
	}
  
	return units  
}



function dzn_mp_confirmParsingFromMenu() {
	function getEditedValuesFromRange(rolesRange) {    
		var output = [];
		var cell = ss.getRangeByName(rolesRange);
		var n = 0;
		var k = 0;         
		while ( k < 2) {
			if (cell.offset(n,0).isBlank()) {
				k++;              
			} else {
				k = 0;
				output.push(cell.offset(n,0).getValue());
			}       
			n++
		}
		return output
	} 
  
	function dzn_clearData() {
		var namedRanges = ['feedForm_defRoles','feedForm_defBrief','feedForm_defAction','feedForm_defResult','slotForm_defSides',
			'slotForm_defSlots1','slotForm_defSlots2','slotForm_defSlots3','slotForm_defSlots4','slotForm_defPass'];
		for (var m = 0; m < namedRanges.length; m++) {
			ss.getRangeByName(namedRanges[m]).clearContent();
		}
	}

	SpreadsheetApp.getUi().alert('Starting to prepare data for using with Forms.\n\nPress OK and wait for a while.'); 
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	dzn_clearData();

	var sides = getEditedValuesFromRange('mp_sides');
	ss.getRangeByName('slotForm_defSides').setValue(sides.join(" | "));      
    
	var slotSides = ['mp_westRoles', 'mp_eastRoles', 'mp_indepRoles', 'mp_civRoles'];
	var roles, i
	var feedbackRoles = [];
	var slotRoles = [];

	for (i = 0; i < slotSides.length; i++) {    
		// Get edited slots    
		roles = getEditedValuesFromRange(slotSides[i]);
		if (roles.length > 0) {
			slotRoles.push(roles);
		}
	}

	if (slotRoles.length > sides.length) {
		SpreadsheetApp.getUi().alert('⊗ WARNING!\n\nThere is not enough SIDES defined for all roles.\n\nAdd another side or delete some roles for not used roles.'); 
	} else {
		for (i = 0; i < sides.length; i++) {
			// Slotting          
			ss.getRangeByName('slotForm_defSlots' + (i+1).toString()).setValue(slotRoles[i].join(" | "));
			// Feedback    
			for (var j = 0; j < slotRoles[i].length; j++) {
				if (slotRoles[i][j].indexOf("!") == -1) {
					feedbackRoles.push(sides[i] + " - " + slotRoles[i][j]);
				}
			}
		}
		
		// Feedback roles 
		ss.getRangeByName('feedForm_defRoles').setValue(feedbackRoles.join(" | "));
		// DefBriefing
		ss.getRangeByName('feedForm_defBrief').setValue(getEditedValuesFromRange('mp_defBrief').join(" | "));
		// DefAction
		ss.getRangeByName('feedForm_defAction').setValue(getEditedValuesFromRange('mp_defAction').join(" | "));
		// DefResult
		ss.getRangeByName('feedForm_defResult').setValue(getEditedValuesFromRange('mp_defResult').join(" | "));

		// Passcodes
		ss.getRangeByName('slotForm_defPass').setValue(getEditedValuesFromRange('mp_passcodes').join(" | "));  
  
		SpreadsheetApp.getUi().alert('✔ OK\n\nEdited Data was confirmed and could be used for creation of forms.');
	}
}
