function onOpen() {
	SpreadsheetApp.getUi()
		.createMenu('FSD Tools')
		.addItem('Create FSD Tools Folder on Drive', 'dzn_createFolder')
		.addSeparator()
		.addItem('Create Sloting form COOP', 'dzn_createSlottingCoop')
		.addItem('Create Sloting form TVT', 'myFunction')
		.addSeparator()
		.addItem('Create Feedback form (COOP)', 'myFunction')
		.addToUi();
 }

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


// Creating Slotting form for COOP
function dzn_createSlottingCoop() {
	if (!(DriveApp.getFoldersByName("ARMA FSD Tools").hasNext())) {
		SpreadsheetApp.getUi().alert('There is no "ARMA FSD Tools" folder on your Drive. Please, create it via "FSD Tools" menu');    
	}
	var name = dzn_getFormName('COOP');
	Logger.log(name)
	
	// +++
	// Добавить степ генерации имени из текущей даты: COOP + datetime
	
	
	if (name != "null") {    
		var folderId =  DriveApp.getFoldersByName("ARMA FSD Tools").next().createFolder(name).getId();
		var folder = DocsList.getFolderById(folderId);
    
		var fileId = FormApp.create(name).getId();
		var slotForm = DocsList.getFileById(fileId);
		slotForm.addToFolder(folder);
		slotForm.removeFromFolder(DocsList.getRootFolder());

    
    
    
		ScriptApp.newTrigger('dzn_formAddMenu').forForm(FormApp.openById(slotForm.getId())).onOpen().create();
		PropertiesService.getDocumentProperties().getProperties();
    
		SpreadsheetApp.getUi().alert("Form created at: " + slotForm.getUrl());
   
	};
}


function dzn_formAddMenu() {
	FormApp.getUi()
		.createMenu('FSD Tools')
		.addItem('Initialize', 'myFnc')
		.addSeparator()
		.addItem('Kek', 'myFnc2')
		.addToUi();
};


function myFnc() {
	PropertiesService.getDocumentProperties().setProperty('formPropery', 999)
}

function myFnc2() {
	//Browser.msgBox(PropertiesService.getDocumentProperties().getProperties());
	FormApp.getUi().alert("Test" + PropertiesService.getDocumentProperties().getProperty('formPropery'));
	Logger.log(PropertiesService.getDocumentProperties().getProperties());
}



// Create PROMPT and return the answer
function dzn_getFormName(gametype, formType) {
	var ui = SpreadsheetApp.getUi();
	var result = "";
	var output = "null";
	
	
	if (formType == "slot") {
		result = ui.prompt('Create Form - Name of the Game','Please enter the Name of the Game:', ui.ButtonSet.OK_CANCEL);
	} else {
		result = ui.alert('Do you want to create Feedback form?', ui.ButtonSet.YES_NO);
	};
	
	// result
	var button = result.getSelectedButton();
	var text = result.getResponseText();  
	if (button = ui.Button.OK) {
		output = gametype + ' ' + text;
	} else {
		if (button = ui.Button.YES) {
			output = gametype + 'AAR' ;
		}
		
	}

	return output
}
