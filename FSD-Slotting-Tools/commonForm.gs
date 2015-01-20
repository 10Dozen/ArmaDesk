function dzn_htmlInstruction() {
	var htmlText = 
	"<h4>How to use?</h4> <ol><li>Add 'ARMA FSD Tools' work folder to your Drive. Go to 'FSD Tools' menu and click 'Create FSD Tools Folder on Drive'</li><br><li>Copy your mission from mission.sqm file</li><li>Paste your mission to 'INPUT: mission.sqm' sheet</li><br><li>Parse your mission file to get role names. Click 'Parse Mission.sqm' from 'FSD Tools' menu</li><li>After your mission is parsed, check 'Main' sheet to view and edit roles and squads (marked like '!  Alpha')</li><li>Check and edit additional parameters - playable sides, default settings of Feedback forms, etc.</li><br><li>When ready, confirm your data, using 'Confirm Data' from 'FSD Tools' menu</li><p><b>Now you can create Forms with confirmed data. Check next steps</b></p><li>Use 'FSD Tools' -> 'Create Slotting form COOP' or 'Create Slotting form TVT'</li><li>Enter your mission title and click OK</li><li>Do you want to get feedback after misson? Then click YES on pop-up.</li><li>Relax and wait for a while</li><li>After confirmation message appeared, check the links at sidebar (check bottom) and open them in the new tab</li><p><b>Form was created and waiting for your attention. Check the values of existing items and edit them if you need it</b></p><li>When you are ready, click 'Start Feedback form' from Form's 'FSD Tools' menu</li><li>Now form will be prepared for publishing. Take a minute for relax and you are almost done</li><li>Check 'Change Theme' to give your forms some kawaiiness</li><li>Publish it!</li></ol><p>If you don't want to use the form anymore - do not forget to <b>'Inactivate'</b> it from form's 'FSD Tools' menu - form will be closed for respondents and all triggers will be terminated.<br /> Now you can simply delete it from your drive</p>"
	return htmlText
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
