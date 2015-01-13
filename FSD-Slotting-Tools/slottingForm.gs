//************************
// Adds FSD Menu for Slotting Form
function dzn_formSlotAddMenu() {
	FormApp.getUi()
		.createMenu('FSD Tools')
		.addItem('Start Slotting Form', 'dzn_slotForm_initialize')
		.addSeparator()
		.addItem('Recreate with Defaults', 'dzn_slotForm_preInitializeFromMenu')
		.addToUi();
};

function dzn_slotForm_preInitializeFromMenu() {
	dzn_slotForm_preInitialize(FormApp.getActiveForm().getId());
	FormApp.getUi().alert('Default view restored');
}

function dzn_slotForm_initializeFromMenu() {
	dzn_slotForm_initialize(FormApp.getActiveForm().getId());
}


//*****************************
// Preinitialize the form
// Will prepare empty form to use for slotting purposes
function dzn_slotForm_preInitialize(formId) {
	Logger.log("Pre-intialization...");
	var form = FormApp.openById(formId);
  
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
	
	PropertiesService.getDocumentProperties().setProperties({
		"ids" : ids
	}, true);

	Logger.log("Pre-initialized!");
}

