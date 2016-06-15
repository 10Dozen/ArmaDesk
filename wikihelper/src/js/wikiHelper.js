var Spec;

var code = "";

var textAreaSettings = {
	"cols": 50
	,"rows": 10
	,"width": "800px"
}

/*		
 *	COMMON FUNCTIONS
*/ 

function escapeQuotes(str) {
	return ( str.replace(new RegExp('"','g'),'""') );
};

function getCode() {	
	var debriefing;
	var debriefingBlockStart = "class CfgDebriefing\n{";
	var debriefingBlockEnd = "\n};";
	
	var debriefingClasses = "";
	for (var i = 0; i < Endings.length; i++) {
		var Ending = Endings[i];
		
		var text = '\n	class ' + Ending.name
			+ '\n	{'
			+ '\n		title = "' + escapeQuotes(Ending.title) + '";'
			+ '\n		subtitle = "' + escapeQuotes(Ending.subtitle) + '";'
			+ '\n		description = "' + escapeQuotes(Ending.description) + '";'
			+ '\n	};';

		debriefingClasses = debriefingClasses + text;		
	};

	debriefing = debriefingBlockStart + debriefingClasses + debriefingBlockEnd;
	return debriefing;
};

function getCodeToDisplay() {
	var code = getCode();
	code = code.replace(/<br \/>/g, "\n&lt;br /&gt;");
	code = code.replace(/</g, "&lt;");
	code = code.replace(/>/g, "&gt;");
	code = code.replace(/(\r\n|\n|\r)/g,"<br />");
	
	$( "#result-tab" ).css( "top", "15%" );
	$( "#result-tab-data" ).html( code );
}

function closeCodeDisplay() {
	$( "#result-tab" ).css( "top", "-3000px" );
};

function getCodeToFile() {
	var a = document.createElement('a');
	a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent( getCode() ));
	a.setAttribute('download', "Endings.hpp" );
	a.click();
}


/*		
 *	ENDING FUNCTIONS
*/ 

var Specification = function () {
	this.name = "";
	this.expression = "";
	this.inputs = [];
	this.output = "";
	this.description = "";
	this.examples = "";
	
	this.$form = $(".fnc-item");
	this.init = function () {
		$( ".inputs-btn" ).on('click', function () {
			Spec.addInput();
		});
	};	
	
	this.clear = function () {
		$( ".fnc-name" ).val("");
		$( ".fnc-expression" ).val("");
		$( ".fnc-output" ).val("");
		$( ".fnc-desc" ).val("");
		$( ".fnc-examples" ).val("");
		this.inputs = [];
		$( ".inputs-list" ).html("");
		this.get();
	};
	this.get = function () {
		this.name = $( ".fnc-name" ).val();
		this.expression = $( ".fnc-expression" ).val();
		this.output = $( ".fnc-output" ).val();
		this.description = $( ".fnc-desc" ).val();
		this.examples = $( ".fnc-examples" ).val();
		
		var inputsItems = $(".inputs-list").children();
		for (var i = 0; i < this.inputs.length; i++) {
			var input = (this.inputs)[i];
			input.type = $( inputsItems[i] ).find(".input-type").val();
			input.desc = $( inputsItems[i] ).find(".input-desc").val();
		}		
	};
	
	this.addInput = function () {
		var id = (this.inputs).length;
		
		$( ".inputs-list" ).append( "<div class='inputs-" + id + "' iid='" + id + "'><li><span class='inputs-number'>" + id + "</span><span class='inputs-remove'>✘</span>"
			+ "<div class='dl-2'><input class='input-type' placeholder='Type (e.g. STRING)'></input></div>"
			+ "</li><li><div class='dl-2'><textarea class='input-desc' cols='35' rows='3' placeholder='Description'></textarea></div></li></div>"
		);
		
		$(".inputs-list").find(".inputs-" + id).find('.inputs-remove').on('click', function () {
			console.log(123);
			var $item = $(this).parent().parent();
			console.log($item);
			var id = $( $item ).attr("iid");
			
			$($item).remove();
			(Spec.inputs).splice(id,1);
			Spec.recalculateInputs();
		});
		
		(this.inputs).push( {"type":"","desc":""} );		
	};
	this.recalculateInputs = function () {
		var inputsItems = $(".inputs-list").children();
		for (var i = 0; i < this.inputs.length; i++) {
			$( inputsItems[i] ).attr("iid", i);
			$( inputsItems[i] ).attr("class", "inputs-" + i);
			$( inputsItems[i] ).find(".inputs-number").html(i);
		}	
	};
	
	this.getWikiCode = function () {};
	this.getSqfCode = function () {
		Spec.get();
		var inputText = "";
		for (var i=0; i< Spec.inputs.length; i++) {
			var inputData = Spec.inputs[i];
			inputText += "<br /> * " + i + ": "+ inputData.type + " - " + inputData.desc;
		};
		
		var codeBlocks = [
			"/*"
			, " * " + Spec.expression
			, " * " + Spec.description
			, " * "
			, " * INPUT:" + inputText
			, " * OUTPUT: " + Spec.output
			, " * " + Spec.examples
		];
		
		var output = "";
		for (var i=0; i<codeBlocks.length; i++) {
			output += "<br />" + codeBlocks[i];
		};
		
		return output;
	};
	
	this.init();
};

$( document ).ready(function() {
    Spec = new Specification();
	$( ".btn-clear" ).on("click", function () {
			Spec.clear();
	});
});

/*

var a = [];

function getEndingById(id) {
	var ending = {};
	for (var i = 0; i < Endings.length; i++) {
		if (Endings[i].id == id) { 
			ending = Endings[i]; 
			break;
		}
	};	
	return ending;
}

function checkDuplicateNames(name) {
	var result = true;
	for (var i = 0; i < Endings.length; i++) {
		if (Endings[i].name == name) {
			result = false;
			break;
		};
	};
	
	if (name == "") { result = false };
	return result;
};


var Ending = function () {
	this.id = EndingsMaxId;
	this.name = "END" + EndingsMaxId;
	this.title = "";
	this.subtitle = "";
	this.description = "";
	this.$form = $(
		"<ul class='ending-item' endingId='" + this.id + "'>"
		+ "<div class='ending-remove' title='Delete ending'>✖</div>"
		+ "<span><div class='ending-name' title='Ending class name (no spaces allowed)'>" + this.name + "</div></span>"
		+ "<li><div class='dl-1'>Title</div><div class='dl-2'>"
		+ "<input class='topicInput ending-title' placeholder='Mission Accomplished'></input></div></li>"
		+ "<li><div class='dl-1'>Subtitle</div><div class='dl-2'>"
		+ "<input class='topicInput  ending-subtitle' placeholder='All mission objectives completed'></input></div></li>"
		+ "<li><div class='dl-1'>Description</div><div class='dl-3'>"
		+ "<textarea class='topicData ending-desc' cols='" + textAreaSettings.cols 
			+ "' rows='" + textAreaSettings.rows + "'></textarea>"
		+ "</div></li><hr /></ul>"	
	);
	
	
	this.setEndingName = function (newName) {
		this.name = newName.replace(/[-[\]{}()*+?.,\\^$|#\s!@%=&]/g, "")	
		$( this.$form ).find('.ending-name').html( this.name );
		$( this.$form ).find('.ending-name').css("display", "inline-block");
	};
	this.draw = function () {
		$( "#endings-form" ).append( this.$form );
	}
	
	this.initEvents = function () {
		$(this.$form).find('.ending-remove').on('click', function () {			
			var self = getEndingById( $ ($(this).parents()[0]).attr("endingId")  );
			self.remove();
		});
		
		$(this.$form).find('.ending-name').on('click', function () {			
			var id = $( $(this).parents()[1] ).attr("endingId");
			var name = $( this ).html();
			$( this ).css( "display", "none" );
			
			var $inputName = $(this).parent().append(
				"<div class='ending-name-input' endingId='" + id + "'>"
				+ "<input value='" + name + "'/>"
				+  "<span class='ending-name-btn ending-name-accept'>✓</span>"
				+ "<span class='ending-name-btn ending-name-decline'>✗</span></div>"
			);			
			
			$( $inputName ).find('.ending-name-btn').on('click', function () {
				$( $( this ).parent() ).find( '.ending-name-accept' ).off();
				$( $( this ).parent() ).find( '.ending-name-decline' ).off();
				$( $( this ).parent() ).remove();
			})
			$( $inputName ).find('.ending-name-accept').on('click', function () {
				var newName = $( this ).parent().find('input').val();				
				var ending = getEndingById( $(this).parent().attr("endingId")  );
				
				if ( !checkDuplicateNames(newName) ) { newName = ending.name; }
				ending.setEndingName(newName);			
			});
			$( $inputName ).find('.ending-name-decline').on('click', function () {
				var ending = getEndingById( $(this).parent().attr("endingId")  );
				ending.setEndingName(ending.name);
			});			
		});
		
		$(this.$form).find('.ending-title').on('blur', function () {			
			var self = getEndingById( $ ($(this).parents()[2]).attr("endingId")  );
			self.title = $( this ).val();
		});
		$(this.$form).find('.ending-subtitle').on('blur', function () {			
			var self = getEndingById( $ ($(this).parents()[2]).attr("endingId")  );
			self.subtitle = $( this ).val();
		});
		$(this.$form).find('.ending-desc').on('blur', function () {			
			var self = getEndingById( $ ($(this).parents()[2]).attr("endingId")  );
			self.description = $( this ).val();
		});
	}
	
	this.remove = function () {
		Endings.splice( Endings.indexOf(this), 1 );			
		
		$( this.$form ).find('.ending-remove').off();
		$( this.$form ).find('.ending-name').off();
		$( this.$form ).find('.ending-name-btn').off();
		$( this.$form ).find('.ending-title').off();
		$( this.$form ).find('.ending-subtitle').off();
		$( this.$form ).find('.ending-desc').off();
		
		$( this.$form ).remove();
		
		console.log("Ending Removed");
	}
	
	this.init = function () {
		this.draw();
		this.initEvents();	
		
		EndingsMaxId++;
		Endings.push(this);
	}
	
	this.init();	
}

function addEnding() {
	var ending = new Ending();
	console.log('Ending added');
}

*/
