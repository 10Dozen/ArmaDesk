function dzn_mp_parseFromMenu() {
	SpreadsheetApp.getUi().alert('Starting to parsing mission data. It could take a long time.');
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
  
  SpreadsheetApp.getUi().alert('Mission.sqm file has been parsed. Check values in lists');
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
   Logger.log(unitList);
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
       if ( cell.offset(n,0).getValue() != "") {
         k = 0;
         output.push(cell.offset(n,0).getValue());
       } else {
         k++
       }       
      n++
    }
    
    return output
  } 
  
  SpreadsheetApp.getUi().alert('Starting to prepare data for using with Forms. Press OK and wait for a while.'); 
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var sides = getEditedValuesFromRange('mp_sides');
  ss.getRangeByName('slotForm_defSides').setValue(sides.join(" | "));
  
  var slotSides = ['mp_westRoles', 'mp_eastRoles', 'mp_indepRoles', 'mp_civRoles'];
  var roles 
  var feedbackRoles = []
  for (var i = 0; i < slotSides.length; i++) {    
    // Get edited slots    
    roles = getEditedValuesFromRange(slotSides[i]);
    Logger.log(roles)
    
    // Slotting
    ss.getRangeByName('slotForm_defSlots' + (i+1).toString()).setValue(roles.join(" | "));
    
    // Feedback    
    for (var j = 0; j < roles.length; j++) {
      if (roles[j].indexOf("!") == -1) {
        feedbackRoles.push(sides[i] + " - " + roles[j]);
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
  
  SpreadsheetApp.getUi().alert('Edited Data was confirmed and could be used for creation of forms.');
}


