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
  
  
  
  
  
/*  PropertiesService.getScriptProperties().setProperties(
		{
			"ids" : 'D',
			"defaultRoles" : 'A',
			"defaultBriefing" : 'B',
			"defaultAction" : 'C',
			"defaultResults" : 'E'      
		},
		true
    );  
    */
	var props = PropertiesService.getScriptProperties();  
  Logger.log(props.getProperties());
	dzn_feedForm_preInitialize(
                               FormApp.getActiveForm().getId(), 
                               props.getProperty('defaultRoles'),
                               props.getProperty('defaultBriefing'),
                               props.getProperty('defaultAction'),
                               props.getProperty('defaultResults')
    );                               
	FormApp.getUi().alert('Default view restored');
}

function dzn_feedForm_initializeFromMenu() {
	dzn_feedForm_initialize(FormApp.getActiveForm().getId());
}

function dd() {
  PropertiesService.getScriptProperties().setProperties(
		{
			"ids" : 'a',
			"defaultRoles" : 'a',
			"defaultBriefing" : 'b',
			"defaultAction" : 'c',
			"defaultResults" : 'd'      
		},
		true
    );  	
}

//*****************************
// Preinitialize the form
function dzn_feedForm_preInitialize(formId, roles, briefing, action, result) {
	var form = FormApp.openById(formId);
	
	Logger.log('Pre-Initialization!  Clearing form!');
	var items = form.getItems();
	for (var i = 0; i < items.length; i++) {form.deleteItem(items[i]);}
	form.deleteAllResponses();
	
	Logger.log('  Adding input forms!');
	var headers = ["Roles Values", "Briefing feedback Values", "Action feedback Values", "Result feedback Values"];
	var values = [roles, briefing, action, result];
 Logger.log('Roles: ' + roles + '  || Brief: ' + briefing);
	var ids = [];
	for (var i = 0; i < headers.length; i++) {
		var itemId = form.addSectionHeaderItem().setTitle(headers[i]).setHelpText(values[i]).getId();
		ids.push(itemId);
	}

	PropertiesService.getScriptProperties().setProperties(
		{
			"ids" : ids.join(" | "),
			"defaultRoles" : roles,
			"defaultBriefing" : briefing,
			"defaultAction" : action,
			"defaultResults" : result      
		},
		true
    );  	
	Logger.log('Pre-Initialized!');
}



function dzn_feedForm_initialize(formId) {
  
}
