/*
 * View
 */

// a view is where the output is created.
var baseView = function ( model ) {
	var that = this;
	that.model = model;

	return that;
};

// a view might have a function that returns the rendered output.
baseView.prototype.output = function () {
	// htmlData used to create a template may come from anywhere
	// but in this example template comes from this inline string.
	var instance = this;
	var modelData = instance.model;
	var htmlData;
	var template;
	var tempFunc;
	var html;
	
	$.ajax({
  		type: 'GET',
  		url: 'src/views/html/manager.html',
  		dataType: 'html',
  		async: false,
  		success: function(data){
 	  		template = data;
 	  		tempFunc = doT.template(template);
 	  		html = tempFunc(modelData);
  		},
  		error: function(xhr, type, data){
  			alert("error");
  		}
	});

	return html;
};

// a view might have a function that renders the output.
baseView.prototype.render = function () {
	// this view renders to the element with the id of "output"
	var outputValue = this.output();
	document.getElementById('mainContainer').innerHTML = outputValue;
	var el = document.getElementById('mainContainer');
	
};