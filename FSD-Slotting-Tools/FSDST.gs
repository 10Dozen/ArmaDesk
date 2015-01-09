 function onOpen() {
   FormApp.getUi()
       .createMenu('FSD Tools')
       .addItem('Create FSD Tools Folder on Drive', 'dzn_createFolder')
       .addSeparator()
       .addItem('Create Sloting form COOP', 'myFunction')
       .addItem('Create Sloting form TVT', 'myFunction')
       .addSeparator()
       .addItem('Create Feedback form (COOP)', 'myFunction')
       .addToUi(); 
 }


// Creating base folder
function dzn_createFolder() {  
  if (DriveApp.getFoldersByName("ARMA FSD Tools").hasNext()) {
    FormApp.getUi().alert('Folder already exists');
  } else {
    FormApp.getUi().alert('Folder with name "ARMA FSD Tools" will be created in the root of your Google Drive');
    DriveApp.createFolder("ARMA FSD Tools");
    FormApp.getUi().alert('Folder "ARMA FSD Tools" was created successfully');
  }  
}


function showPrompt() {
  var ui = FormApp.getUi(); // Same variations.

  var result = ui.prompt(
      'Let\'s get to know each other!',
      'Please enter your name:',
      ui.ButtonSet.OK_CANCEL);

  // Process the user's response.
  var button = result.getSelectedButton();
  var text = result.getResponseText();
  if (button == ui.Button.OK) {
    // User clicked "OK".
    ui.alert('Your name is ' + text + '.');
 
  
  } else if (button == ui.Button.CANCEL) {
    // User clicked "Cancel".
    ui.alert('I didn\'t get your name.');
  } else if (button == ui.Button.CLOSE) {
    // User clicked X in the title bar.
    ui.alert('You closed the dialog.');
  }
}





function dzn_getFormName() {
 var ui = FormApp.getUi();
  var result = ui.prompt('Create Form - Step 1 of 2 - Enter Game Date','Please enter date of the game:', ui.ButtonSet.OK_CANCEL);
    
  var steps = 0;
  var outputText = [];
  // result
 var button = result.getSelectedButton();
 var text = result.getResponseText();
  
  if (button = ui.Button.OK) {
    steps++;
   var result2 = ui.prompt('Create Form - Step 2 of 2 - Enter Game Name','Please enter name of the game:', ui.ButtonSet.OK_CANCEL);
    outputText = text;
    
    button = result2.getSelectedButton();
    text = result2.getResponseText();
    if (button = ui.Button.OK) {
      steps++
        
      outputText = outputText + " " + text;
    }    
  }
  
  var output = "null";
  if (steps == 2) { 
    output = outputText;
  }

  output
}






function myssFunction() {
  
var file = DocsList.getFileById(sheet.getId());
var folder = DocsList.getFolder("ARMA FSD Tools");
file.addToFolder(folder);

// remove document from the root folder
folder = DocsList.getRootFolder();
file.removeFromFolder(folder);
}






function dzn_createSlottingCoop() {
  if (!(DriveApp.getFoldersByName("ARMA FSD Tools").hasNext())) {
    FormApp.getUi().alert('There is no "ARMA FSD Tools" folder on your Drive. Please, create it via "FSD Tools" menu');    
  }
  //var name = dzn_getFormName();
  var name = "421/4214/124124 fock'2312423'";
  Logger.log(name)
  
  if (name != "null") {    
   var folderId =  DriveApp.getFoldersByName("ARMA FSD Tools").next().createFolder(name).getId();
   var folder = DocsList.getFolderById(folderId);
    var fileId = FormApp.create(name).getId();
    var file = DocsList.getFileById(fileId);
    file.addToFolder(folder);
    file.removeFromFolder(DocsList.getRootFolder());
  };

  
  
  //
  
}

function dzn_createSlottingTvt() {
  
}

function dzn_createFeedbackCoop() {
  
}



function dzn_getToday() {
    var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd='0'+dd
} 

if(mm<10) {
    mm='0'+mm
} 

today = dd+'/'+mm+'/'+yyyy;
Logger.log(today);
}
