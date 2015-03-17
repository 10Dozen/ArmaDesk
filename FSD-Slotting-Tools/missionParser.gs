function mp_trim(str) {
	var	str = str.replace(/^\s\s*/, ''),
	ws = /\s/,
	k = str.length;
	while (ws.test(str.charAt(--k)));
			
	return str.slice(0, k + 1);
}

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
		cell.setValue(mp_trim(roles[i]));
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
