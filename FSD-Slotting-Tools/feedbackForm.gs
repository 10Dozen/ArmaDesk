//***********************
// Adds FSD Menu for Feedback Form
function dzn_formFeedAddMenu() {
  FormApp.getUi()
		.createMenu('FSD Tools')
		.addItem('Start Feedback form', 'dzn_feedForm_initializeFromMenu')
		.addSeparator()
		.addItem('Recreate with Defaults', 'dzn_feedForm_preInitializeFromMenu')
		.addToUi();
}

function dzn_feedForm_preInitializeFromMenu() {
	dzn_feedForm_preInitialize(FormApp.getActiveForm().getId());
	FormApp.getUi().alert('Default view restored');
}

function dzn_feedForm_initializeFromMenu() {
	dzn_feedForm_initialize(FormApp.getActiveForm().getId());
}


//*****************************
// Preinitialize the form
function dzn_feedForm_preInitialize(formId) {
	var form = FormApp.openById(formId);
	
	Logger.log('Pre-Initialization!  Clearing form!');
	var items = form.getItems();
	for (var i = 0; i < items.length; i++) {form.deleteItem(items[i]);}
	form.deleteAllResponses();
	
	Logger.log('  Adding input forms!');
	var headers = ["Roles Values", "Briefing feedback Values", "Action feedback Values", "Result feedback Values"];
	var ids = [];
	for (var i = 0; i < headers.length; i++) {
		var itemId = form.addSectionHeaderItem().setTitle(headers[i]).getId();
		ids.push(itemId);
	}

	PropertiesService.getDocumentProperties().setProperties({"ids" : ids.join(" | ")}, true);	
	Logger.log('Pre-Initialized!');
}



function dzn_feedForm_initialize(formId) {
  
}
