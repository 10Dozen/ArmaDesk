// *****************
// Show UI on Open
function onOpen() {
	SpreadsheetApp.getUi()
		.createMenu('FSD Tools')
		.addItem('Create FSD Tools Folder on Drive', 'dzn_createFolder')
		.addSeparator()
		.addItem('Create Sloting form COOP', 'dzn_createSlottingCoop')
		.addItem('Create Sloting form TVT', 'myFunction')
		.addSeparator()
		.addItem('Show Sidebar', 'showSidebar')
		.addToUi();
 }

// *****************
// Show sidebar
function showSidebar(link1, link2) {
	var htmlOut = "<p>FSD Slotting Tool - is a way to create slotting and feedback forms for your multiplayer online game.<p><br><br>1/ Click<br>2/ Join<br>3/ Move<br>4/ ???<br>5/ Profit<br><br><br>";
    
	if (link1 != null) {
		htmlOut = htmlOut + "<br><h4>Links:</h4><br><a href='" + link1 + "'>Slotting Form</a>";
		if (link2 != null) {
			htmlOut = htmlOut + "<br><a href='" + link2 + "'>Feedback Form</a>";; 
		}
    } else {
      if (SpreadsheetApp.getActive().getRangeByName('slotURL').getValue() != null) {
         htmlOut = htmlOut + "Last Created Forms<br><h4>Links:</h4><br><a href='" + SpreadsheetApp.getActive().getRangeByName('slotURL').getValue() + "'>Slotting Form</a>";
		if (SpreadsheetApp.getActive().getRangeByName('feedURL').getValue() != null) {
			htmlOut = htmlOut + "<br><a href='" + SpreadsheetApp.getActive().getRangeByName('feedURL').getValue() + "'>Feedback Form</a>";; 
		}
      }
    }
	var html = HtmlService.createHtmlOutput(htmlOut)
		.setSandboxMode(HtmlService.SandboxMode.IFRAME)
		.setTitle('FSD Slotting Tools')
		.setWidth(200);
	SpreadsheetApp.getUi().showSidebar(html); 
}


// *****************
// Creating base folder
function dzn_createFolder() {  
	if (DriveApp.getFoldersByName("ARMA FSD Tools").hasNext()) {
		SpreadsheetApp.getUi().alert('Folder already exists');
	} else {
		SpreadsheetApp.getUi().alert('Folder with name "ARMA FSD Tools" will be created in the root of your Google Drive');
		DriveApp.createFolder("ARMA FSD Tools");
		SpreadsheetApp.getUi().alert('Folder "ARMA FSD Tools" was created successfully');
	}  
}


// *****************
// Creating Slotting form for COOP
function dzn_createSlottingCoop() {
	if (!(DriveApp.getFoldersByName("ARMA FSD Tools").hasNext())) {
		SpreadsheetApp.getUi().alert('There is no "ARMA FSD Tools" folder on your Drive. Please, create it via "FSD Tools" menu');    
	}

	var ss = SpreadsheetApp.getActiveSpreadsheet();
	// Запрашиваем создание формы слоттинга
	var formSlotName = dzn_getSlotFormName('COOP');
  Logger.log(formSlotName);
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
		var formFeedName = dzn_isFeedbackNeeded('COOP', formSlotName[1]);
		if (formFeedName != "null") {
          var formFeedId = FormApp.create(formFeedName).getId();
          folder.addFile(DriveApp.getFileById(formFeedId));
          DriveApp.getRootFolder().removeFile(DriveApp.getFileById(formFeedId));
          feedFormUrl = DriveApp.getFileById(formFeedId).getUrl();          
          
          dzn_addNamedRanges("Feed", propSheetId, ss.getId()); 
          // PreInitialize 
          dzn_feedForm_preInitialize(formFeedId, propSheet.getId());
          ScriptApp.newTrigger('dzn_formFeedAddMenu').forForm(FormApp.openById(formFeedId)).onOpen().create();  
        }
   
		dzn_addNamedRanges("Slot", propSheetId, ss.getId());
		
		//dzn_slotForm_preInitialize(formSlotId, propSheet.getId());
		//ScriptApp.newTrigger('dzn_formSlotAddMenu').forForm(FormApp.openById(formSlotId)).onOpen().create();  
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

function dzn_addNamedRanges(type, ssId, sourceId) {
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
	      
		ss.getRangeByName("slotForm_defModes").setValue(source.getRangeByName("slotForm_defModes").getValue());
		ss.getRangeByName("slotForm_defSides").setValue(source.getRangeByName("slotForm_defSides").getValue());
		ss.getRangeByName("slotForm_defSlots1").setValue(source.getRangeByName("slotForm_defSlots1").getValue());
		ss.getRangeByName("slotForm_defSlots2").setValue(source.getRangeByName("slotForm_defSlots2").getValue());
		ss.getRangeByName("slotForm_defSlots3").setValue(source.getRangeByName("slotForm_defSlots3").getValue());
		ss.getRangeByName("slotForm_defSlots4").setValue(source.getRangeByName("slotForm_defSlots4").getValue());
		ss.getRangeByName("slotForm_defPass").setValue(source.getRangeByName("slotForm_defPass").getValue());
      
	}
	Logger.log('Properties set');
}





// *****************
// Create PROMPT and return the answer for SLOTTING FORM
function dzn_getSlotFormName(gametype) {
  var gametype = 'COOP';
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
