var ThemeManagerView = function ( model ) {
	var that = this;
	that.model = model;

	return that;
};

ThemeManagerView.prototype.output = function () {
	var instance = this;
	var modelData = instance.model;
	var htmlData;
	var template;
	var tempFunc;
	var html;

	$.ajax({
  		type: 'GET',
  		url: 'src/views/html/themes.html',
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

ThemeManagerView.prototype.render = function () {
	var outputValue = this.output();
	var container = $(".mainContainer");
	container.html(outputValue);
	this.setHandlers();
	container.removeClass('left');
	container.addClass('center transition');
};

ThemeManagerView.prototype.setHandlers = function() {
	var that = this;
	$(".themeListItem").click(function(event) {
		var quizzes = $(this).attr('data-quizzes').split(",");
		that.displayQuizzes(quizzes);
	});

}
ThemeManagerView.prototype.displayQuizzes = function(quizzes) {
	Core.go('QuizManager', quizzes);
}