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
		.addItem('Create Feedback form (COOP)', 'myFunction')
		.addSeparator()
		.addItem('Show Sidebar', 'showSidebar')
		.addToUi();
 }

// *****************
// Show sidebar
function showSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('Page')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('FSD Slotting Tools')
      .setWidth(200);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showSidebar(html);
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

	// Запрашиваем создание формы слоттинга
	var formSlotName = dzn_getSlotFormName('COOP');
  
	if (formSlotName[1] != "null") {
		var folderId =  DriveApp.getFoldersByName("ARMA FSD Tools").next().createFolder(formSlotName[0]).getId();
		var folder = DocsList.getFolderById(folderId);

		var formSlotId = FormApp.create(formSlotName[0]).getId();
		var slotForm = DocsList.getFileById(formSlotId);
		slotForm.addToFolder(folder);
		slotForm.removeFromFolder(DocsList.getRootFolder());
      
		// Запрашиваем создание формы фидбека
		var formFeedName = dzn_isFeedbackNeeded('COOP', formSlotName[1]);
		if (formFeedName != "null") {
			var formFeedId = FormApp.create(formFeedName).getId();
			var feedForm = DocsList.getFileById(formFeedId);
			feedForm.addToFolder(folder);

			ScriptApp.newTrigger('dzn_formFeedAddMenu').forForm(FormApp.openById(formFeedId)).onOpen().create();
			
			// PreInitialize 
			dzn_feedForm_preInitialize(formFeedId)          
        }
      
       
        ScriptApp.newTrigger('dzn_formSlotAddMenu').forForm(FormApp.openById(formSlotId)).onOpen().create();  

    
    
    
		
		
    
		
   
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
	if (button = ui.Button.OK) {
		if (text.length == 0) {
			text = dzn_getToday();
		}
		output = [(gametype + ' ' + text), text];
	}
	return output
}; 

function dzn() {
  var a = dzn_isFeedbackNeeded('COOP', 'HuiPisda');
  Logger.log(a);
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









function myFnc() {
	PropertiesService.getDocumentProperties().setProperty('formPropery', 999)
}

function myFnc2() {
	//Browser.msgBox(PropertiesService.getDocumentProperties().getProperties());
	FormApp.getUi().alert("Test" + PropertiesService.getDocumentProperties().getProperty('formPropery'));
	Logger.log(PropertiesService.getDocumentProperties().getProperties());
}
