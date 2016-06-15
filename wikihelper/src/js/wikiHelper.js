
/*		
 *	COMMON FUNCTIONS
*/ 

function escapeQuotes(str) {
	return ( str.replace(new RegExp('"','g'),'""') );
};

function showFormattedCode(code, type) {
	if (type == "SQF") {
		$( "#result-tab-header > b" ).html("SQF Code");
	} else {
		$( "#result-tab-header > b" ).html("Git Wiki Code");
	};
	$( "#result-tab" ).css( "top", "15%" );
	$( "#result-tab-data" ).html( code );	
}


function getCodeToDisplay() {
	var code = getCode();
	code = code.replace(/<br \/>/g, "\n&lt;br /&gt;");cod
	code = code.replace(/</g, "&lt;");
	code = code.replace(/>/g, "&gt;");
	code = code.replace(/(\r\n|\n|\r)/g,"<br />");
	
	$( "#result-tab" ).css( "top", "15%" );
	$( "#result-tab-data" ).html( code );
}

function closeCodeDisplay() {
	$( "#result-tab" ).css( "top", "-3000px" );
};


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
	
	this.getWikiCode = function () {
		Spec.get();
		
		var inputText = "";
		for (var i=0; i< Spec.inputs.length; i++) {
			var inputData = Spec.inputs[i];
			
			var inputDescs = inputData.desc.split("\n");
			var inputDesc = inputDescs[0];
			for (var j=1; j < inputDescs.length; j++) {
				inputDesc += " " + inputDescs[i];
			}
			
			inputText += "<br />&lt;br /&gt;`" + i + ": "+ inputData.type + "	- " + inputDesc + "`";
		};
		
		var codeBlocks = [
			"##### " + Spec.name
			, "`" + Spec.expression + "`"
			, "&lt;br /&gt;&lt;br /&gt;`INPUT:`" + inputText
			, "&lt;br /&gt;`OUTPUT: " + Spec.output + "`"
			, "&lt;br /&gt;&lt;br /&gt;" + Spec.description.replace(/(\r\n|\n|\r)/g," ")
		];
		var output = "";
		for (var i=0; i<codeBlocks.length; i++) {
			output += "<br />" + codeBlocks[i];
		};
	
		return output;
	};
	this.getSqfCode = function () {
		Spec.get();
		
		var descriptionLines = Spec.description.split("\n");
		var description = descriptionLines[0];
		for (var i=1; i< descriptionLines.length; i++) {
			description += "<br /> *      " +  descriptionLines[i];
		};
		
		var examples = "";
		var examplesLines = Spec.examples.split("\n");
		for (var i=0; i< examplesLines.length; i++) {
			examples += "<br /> *      " +  examplesLines[i];
		};
		
		var inputText = "";
		for (var i=0; i< Spec.inputs.length; i++) {
			var inputData = Spec.inputs[i];
			
			var inputDescs = inputData.desc.split("\n");
			var inputDesc = inputDescs[0];
			for (var j=1; j < inputDescs.length; j++) {
				inputDesc += "<br /> *                " +  inputDescs[i];
			}
			
			inputText += "<br /> * " + i + ": "+ inputData.type + " - " + inputDesc;
		};
		
		var codeBlocks = [
			"/*"
			, " * " + Spec.expression
			, " * " + description
			, " * "
			, " * INPUT:" + inputText
			, " * OUTPUT: " + Spec.output
			, " * "
			, " * EXAMPLES:" + examples
			, " */"
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
	$( ".btn-get-wiki" ).on("click", function () {
		showFormattedCode( Spec.getWikiCode(), "WIKI" );
	});
	$( ".btn-get-sqf" ).on("click", function () {
		showFormattedCode( Spec.getSqfCode(), "SQF" );
	});
});
