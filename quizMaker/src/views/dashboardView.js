var DashboardView = function ( model ) {
	var that = this;
	that.model = model;

	return that;
};

DashboardView.prototype.output = function () {
	var instance = this;
	var modelData = instance.model;
	console.log(modelData);
	var htmlData;
	var template;
	var tempFunc;
	var html;

	$.ajax({
  		type: 'GET',
  		url: 'src/views/html/dashboard.html',
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

DashboardView.prototype.render = function () {
	var outputValue = this.output();
	var container = $(".mainContainer");
	container.html(outputValue);
	this.setHandlers();
};

DashboardView.prototype.setHandlers = function() {
	var that = this;
}
DashboardView.prototype.displayQuizzes = function(quizzes) {
	Core.go('QuizEditor', quizzes);
}