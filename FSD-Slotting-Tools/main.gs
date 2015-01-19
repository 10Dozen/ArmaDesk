// *****************
// Show UI on Open
function onOpen() {
	SpreadsheetApp.getUi()
		.createMenu('FSD Tools')
		.addItem('Create FSD Tools Folder on Drive', 'dzn_createFolderFromMenu')
		.addSeparator()
		.addItem('Parse Mission.sqm', 'dzn_mp_parseFromMenu')
		.addItem('Confirm Data', 'dzn_mp_confirmParsingFromMenu')
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
	var htmlOut = "<p>FSD Slotting Tool - is a way to create slotting and feedback forms for your multiplayer online game.<p>";

	if (link1 != null) {
		htmlOut = htmlOut + "<h4>Newly Created Forms:</h4><a href='" + link1 + "'>Slotting Form</a>";
		if (link2 != null) {
			htmlOut = htmlOut + "<br><a href='" + link2 + "'>Feedback Form</a>";; 
		}
	} else {
		if (SpreadsheetApp.getActive().getRangeByName('slotURL').getValue() != "") {
			htmlOut = htmlOut + "<h4>Last Created Forms</h4><a href='" + SpreadsheetApp.getActive().getRangeByName('slotURL').getValue() + "'>Slotting Form</a>";
			if (SpreadsheetApp.getActive().getRangeByName('feedURL').getValue() != "") {
				htmlOut = htmlOut + "<br><a href='" + SpreadsheetApp.getActive().getRangeByName('feedURL').getValue() + "'>Feedback Form</a>";; 
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
		SpreadsheetApp.getUi().alert('Folder already exists');
	} else {        
		SpreadsheetApp.getUi().alert('Folder with name "ARMA FSD Tools" will be created in the root of your Google Drive');
		DriveApp.createFolder("ARMA FSD Tools");
		SpreadsheetApp.getUi().alert('Folder "ARMA FSD Tools" was created successfully');
	}  
}

// *****************
// Check the existance of work folder
function dzn_checkFolderExists() {
	var output = true;
	if (!(DriveApp.getFoldersByName("ARMA FSD Tools").hasNext())) {
		SpreadsheetApp.getUi().alert('There is no "ARMA FSD Tools" folder on your Drive. Please, create it via "FSD Tools" menu');    
		output = false;
	}
	return output
}

// *****************
// Creating COOP or TVT form from menu
function dzn_createSlottingCoopFromMenu() {
	if (dzn_checkFolderExists()) {
		SpreadsheetApp.getUi().alert('Starting to creating COOP Forms. Press OK and wait for a while.'); 
		dzn_createForm('coop'); 
	}
}

function dzn_createSlottingTvtFromMenu() {
	if (dzn_checkFolderExists()) {
		SpreadsheetApp.getUi().alert('Starting to creating TVT Forms. Press OK and wait for a while.'); 
		dzn_createForm('tvt'); 
	}
}

// *****************
// Creating Slotting form for COOP
function dzn_createForm(mode) {
	var ss = SpreadsheetApp.getActiveSpreadsheet();
  
	// Запрашиваем создание формы слоттинга
	var formSlotName = dzn_getSlotFormName(mode);   
	if (formSlotName[1] != "null") {
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
          
			dzn_addNamedRanges("Feed", propSheetId, ss.getId()); 
			// PreInitialize Feedback Form
			dzn_feedForm_preInitialize(formFeedId, propSheet.getId()); 
        }

		dzn_addNamedRanges("Slot", propSheetId, ss.getId());
		// Pre-initialize Slotting Form
		dzn_slotForm_preInitialize(formSlotId, propSheet.getId());

		ss.getRangeByName("slotURL").setValue(slotFormUrl);
		if (feedFormUrl != null) {
			showSidebar(slotFormUrl, feedFormUrl);
			ss.getRangeByName("feedURL").setValue(feedFormUrl);
		} else {
			showSidebar(slotFormUrl)
		}

		SpreadsheetApp.getUi().alert('Form was successufully created! Check Sidebar for URLs');   
	};
}


// *****************
// Create PROMPT and return the answer for SLOTTING FORM
function dzn_getSlotFormName(gametype) {
	var ui = SpreadsheetApp.getUi();
	var result = "";
	var output = ["null"];
	
	result = ui.prompt('Create Form - Name of the Game','Please enter the Name of the Game:', ui.ButtonSet.OK_CANCEL);
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
