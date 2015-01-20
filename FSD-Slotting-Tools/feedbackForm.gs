function dzn_feedForm_getStringtable() {
	var strvals = {
		"defaultRoles" : 	["Alhpa - SL", "Alpha - Medic", "Alpha 1 - FTL", "Alpha 1 - AR", "Alpha 1 - AAR", "Alpha 1 - Rifleman"],
		"defaultBriefing" : ["Быстро", "Понятно", "Медленно", "Непонятно"],
		"defaultAction" : 	["Организованно", "Тактикульно", "Весело", "Скучно", "Сплошной пост-рок", "Как стадо"],
		"defaultResult" : 	["Все молодцы", "Школота сплошная", "У всех бугурт", "Только я один в белом пальто красивый", "Элитный чейрборн"],
		"strNick" : "",
		"strScore" : 		"Общее ощущение от игры",
		"strRole" : 		"Выберите вашу роль в миссии",
		"strBriefingScore" : "Как прошел брифинг?",
		"strBriefing" : 	"Опишите как вы поняли задачу вашего отряда и общую задачу вашей стороны",
		"strActionScore" : 	"Как прошла мисиия?",
		"strAction" : 		"Опишите, что с вами приключилось за игру",
		"strResultScore" : 	"Что по итогу?",
		"strResult" : 		"Выскажите свое мнение по итогам игры - похвалите напарников, поругайте тим киллеров.",
		"strResponse" : 	"Спасибо за фидбек! Вновь посетите форму, чтобы увидеть свой овтет."
	};
	return strvals
}


//***********************
// Adds FSD Menu for Feedback Form
function dzn_feedForm_addMenu() {
	FormApp.getUi()
		.createMenu('FSD Tools')
		.addItem('✓ Start Feedback form', 'dzn_feedForm_initializeFromMenu')
		.addSeparator()
		.addItem('↺ Recreate with Defaults', 'dzn_feedForm_preInitializeFromMenu')		
  		.addItem('⨯ Inactivate Feedback form', 'dzn_form_inactivateFormFromMenu')
		.addToUi();
}

//*****************************
// Preinitialize the form from Menu
function dzn_feedForm_preInitializeFromMenu() {
	var formId = FormApp.getActiveForm().getId();
	var ssId = dzn_form_getPropertySheet(formId, 'feed');
  Logger.log(ssId);
  
	dzn_feedForm_preInitialize(formId,ssId);
	FormApp.getUi().alert('✔ OK\n\nDefault view restored');
}

//*****************************
// Preinitialize the form
function dzn_feedForm_preInitialize(formId, ssId) {
	var form = FormApp.openById(formId);

	Logger.log('Pre-Initialization!  Clearing form!');
	var items = form.getItems();
	for (var i = 0; i < items.length; i++) {form.deleteItem(items[i]);}
	form.deleteAllResponses();
	
	Logger.log('  Adding input forms!');
	var headers = ["Roles Values", "Briefing feedback Values", "Action feedback Values", "Result feedback Values"];

	var ss = SpreadsheetApp.openById(ssId);
	var values = [
		ss.getRangeByName('feedForm_defRoles').getValue(),
		ss.getRangeByName('feedForm_defBrief').getValue(),
		ss.getRangeByName('feedForm_defAction').getValue(),
		ss.getRangeByName('feedForm_defResult').getValue()
	];
	
	var ids = [];
	for (var i = 0; i < headers.length; i++) {
		var itemId = form.addSectionHeaderItem().setTitle(headers[i]).setHelpText(values[i]).getId();
		ids.push(itemId);
	}
   
	ss.getRangeByName('feedForm_ids').setValue(ids.join(" | "));  

	var triggers = ScriptApp.getUserTriggers(form);
	for (var i = 0; i < triggers.length; i++) {
		ScriptApp.deleteTrigger(triggers[i]);
	}
	ScriptApp.newTrigger('dzn_feedForm_addMenu').forForm(form).onOpen().create();  

	Logger.log('Pre-Initialized!');
}

//***********************
// Initialize Feedback Form
function dzn_feedForm_initializeFromMenu() {
	Logger.log('Initialization!');
	Logger.log('Get IDs from PropertyService!');

	var form = FormApp.getActiveForm();
	var strVars = dzn_feedForm_getStringtable(); // [ names, defaults ]
	var ss = SpreadsheetApp.openById(dzn_form_getPropertySheet(form.getId(), 'feed')); //properties

	var idList = ss.getRangeByName('feedForm_ids').getValue().split(" | ");
	Logger.log('   Get input values');
	var inputKeyNames = ["roles", "briefing", "action", "result"];
	var inputDefaults = [strVars.defaultRoles, strVars.defaultBriefing, strVars.defaultAction, strVars.defaultResult];

	var inputs = {"name" : "CustomizedInputs"};
	for (var i = 0; i < idList.length; i++) {
		var inputValue = form.getItemById(idList[i]).getHelpText();
		if (inputValue.length > 0) {
			inputs[inputKeyNames[i]] = inputValue.split(" | ");
		} else {
			inputs[inputKeyNames[i]] = inputDefaults[i];
		}
	}  

	Logger.log('  Clearing form');
	var items = form.getItems();
	for (var i = 0; i < items.length; i++) {form.deleteItem(items[i]);}

	Logger.log('   Add new items');
	var itemMap = [
		"img",
		"brkAAR - Фидбек",
		"sclОбщая оценка",      
		"strНик в игре",
		"lstРоль",
		"brkAAR - Часть 1 - Планирование",
			"cbx0Брифинг",
			"tbx0Брифинг",
		"brkAAR - Часть 2 - Исполнение",
			"cbx1Акция",
			"tbx1Акция",
		"brkAAR - Часть 3 - Выводы",
			"cbx2Результаты",
			"tbx2Результаты"
	];  		

	var ids = {"name" : "IDs of Items"};
	for (var i = 0; i < itemMap.length; i++) {
		var name = itemMap[i];
		var itemName = name.substring(3,name.length); //item displayed names

		//Item names: img - image, brk - break page, scl - scale item, str - oneline text, lst - list, cbx - checkbox, tbx - text box
		var itemType = name.substring(0,3);
		switch (itemType) {
			case "img":
				var img = UrlFetchApp.fetch('http://cs608928.vk.me/v608928222/5f5f/MQqIEc6_iKY.jpg');
				form.addImageItem().setTitle(itemName).setImage(img).setAlignment(FormApp.Alignment.CENTER);
				break;
			case "brk":
				form.addPageBreakItem().setTitle(itemName);
				break;
			case "scl":
				var itemId = form.addScaleItem().setTitle(itemName).setHelpText(strVars.strScore)
                                .setLabels("Не понравилось", "Фантастически!").setBounds(0,10)
                                .getId().toString();
				ids["scoreId"] = itemId;
				break;
			case "str":
				var itemId = form.addTextItem().setTitle(itemName).setHelpText(strVars.strNick).getId().toString();;
				ids["nickId"] = itemId;
				break;
			case "lst":
				var itemId = form.addListItem().setTitle(itemName).setHelpText(strVars.strRole).setChoiceValues(inputs.roles).getId().toString();
				ids["roleId"] = itemId;
				break;
			case "cbx":
				var item = form.addCheckboxItem().setTitle(itemName.substring(1,itemName.length));            
				var helpText, choices, key;
				switch (name.substring(3,4)) {
					case "0":
						helpText = strVars.strBriefingScore;
						choices = inputs.briefing;
						key = "briefingScoreId";
						break;
					case "1":
						helpText = strVars.strActionScore;
						choices = inputs.action;
						key = "actionScoreId";
						break;
					case "2":
						helpText = strVars.strResultScore;
						choices = inputs.result;
						key = "resultScoreId";
						break;
				}
				item.setHelpText(helpText).setChoiceValues(choices);
				ids[key] = item.getId().toString();
				break;
			case "tbx":
				var item = form.addParagraphTextItem().setTitle(itemName.substring(1,itemName.length));            
				var helpText, key;
				switch (name.substring(3,4)) {
					case "0":
						helpText = strVars.strBriefing;				       
						key = "briefingId";
						break;
					case "1":
						helpText = strVars.strAction;
						key = "actionId";
						break;
					case "2":
						helpText = strVars.strResult;
						key = "resultId";
						break;
				}
				item.setHelpText(helpText);
				ids[key] = item.getId().toString();
				break;
		}
	}

	form.setProgressBar(true);
	form.setConfirmationMessage(strVars.strResponse)

	Logger.log('  Add properties');
	var idsArray = [
		ids.scoreId, ids.nickId, ids.roleId, 
		ids.briefingScoreId, ids.briefingId,
		ids.actionScoreId, ids.actionId,
		ids.resultScoreId, ids.resultId
	];
  
	ss.getRangeByName('feedForm_names').setValue('scoreId | nickId | roleId | briefScoreId | briefingId | actionScoreId | actionId | resultScoreId | resultId');
	ss.getRangeByName('feedForm_ids').setValue(idsArray.join(" | "));
  
	Logger.log('Feedback Form Initialized!');
	ScriptApp.newTrigger('dzn_feedForm_onSave').forForm(form).onFormSubmit().create();
	FormApp.getUi().alert('✔ OK\n\nFeedback Form Initialized!');
}

// **************************
// On Save
function dzn_feedForm_onSave() {
	var form = FormApp.getActiveForm();
	var ss = SpreadsheetApp.openById(dzn_form_getPropertySheet(form.getId(), 'feed')); //properties
	Logger.log(form);
  	Logger.log(form.getId());
	var idNames = ss.getRangeByName('feedForm_names').getValue().split(" | ");
	var idItems = ss.getRangeByName('feedForm_ids').getValue().split(" | ");

	var formResponse = form.getResponses();
	var lastResponse = formResponse[formResponse.length-1];
	var response = {"name" : "Response"};
	for (var i = 0; i < idNames.length; i++) {response[idNames[i]] = idItems[i];}

	// Head
	var headItems = ["nickId","roleId","scoreId"];
	var formattedResponses = [];
	for (var i = 0; i < headItems.length; i++) {
		var currentResponse = lastResponse.getResponseForItem(form.getItemById(response[headItems[i]]));
		if (currentResponse != null) {
			currentResponse = currentResponse.getResponse();
			if (currentResponse == 10) {
				currentResponse = "10 из 10!"; 
			}
        	} else {
			switch (i) {
				case 1:
					currentResponse = '';
					break;
				case 2:
					currentResponse = 'Без оценки';
					break;
			}
		}
		formattedResponses.push(currentResponse);
	}
	var AARTitle = formattedResponses[0] + " (" + formattedResponses[1] + ") - " + formattedResponses[2];

	// Body
	var bodyItems = ["briefingId","actionId","resultId"];
	var formattedResponses = [];
	for (var i = 0; i < headItems.length; i++) {
		var currentResponse = lastResponse.getResponseForItem(form.getItemById(response[bodyItems[i]]));
		if (currentResponse != null) {
			currentResponse = currentResponse.getResponse()
			if (currentResponse == "") {
				currentResponse = "";
			} else {
				switch (i) {
					case 0:
						currentResponse = "\nО брифинге:\n    " + currentResponse + "\n";
						break;
					case 1:
						currentResponse = "\nОб исполнении:\n    " + currentResponse + "\n";
						break;
					case 2:
						currentResponse = "\nО результатах:\n    " + currentResponse + "\n";
						break;
				}
			}
		} else {
			currentResponse = "";
		}
		formattedResponses.push(currentResponse);
	}
	var AARBody = formattedResponses[0] + formattedResponses[1] + formattedResponses[2];

	// Footer
	var footerItems = ["briefScoreId","actionScoreId","resultScoreId"];
	var formattedResponses = [];
	for (var i = 0; i < headItems.length; i++) {
		var currentResponse = lastResponse.getResponseForItem(form.getItemById(response[footerItems[i]]));
		if (currentResponse != null) {
			if (currentResponse == "") {
				currentResponse = "";
			} else {
				currentResponse = currentResponse.getResponse()
				switch (i) {
					case 0:
						currentResponse = "\n  Брифинг:		" + currentResponse.join(", ");
						break;
					case 1:
						currentResponse = "\n  Акция:		" + currentResponse.join(", ");
						break;
					case 2:
						currentResponse = "\n  Выводы:		" + currentResponse.join(", ");
						break;
				}
			}
		} else {
			currentResponse = "";
		}
		formattedResponses.push(currentResponse);
	}
	var AARFooter = "";
	if (formattedResponses.join("") != "") {
		AARFooter = "\n\nСтатистика:" + formattedResponses[0] + formattedResponses[1] + formattedResponses[2];
	}

	// Adding item with Formatted Response
	var item = form.addSectionHeaderItem().setTitle(AARTitle).setHelpText(AARBody + AARFooter);
	form.moveItem(item.getIndex(), 1);

	Logger.log("AAR Added!");
}
