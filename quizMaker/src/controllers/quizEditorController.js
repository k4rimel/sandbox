var QuizEditorController = function () {
	this.container = $('.mainContainer');
	return this;
};

// if(QuizEditorController.prototype.initializer === true) return;
// QuizEditorController.prototype.initializer = true;

QuizEditorController.prototype.init = function () {
	var that = this;
	if(typeof(arguments[0]) !== 'undefined') {
		that.loadQuizzes.apply(that, arguments[0]);
	}
};

QuizEditorController.prototype.loadQuizzes = function () {
	var model = DashboardModel.find(arguments);
	var view = new QuizManagerView(model);

	view.render();
};
QuizEditorController.prototype.destroy = function () {
	$(".mainContainer").addClass('hidden');
};
Core.register('QuizEditor', function()
{
	var controller = new QuizEditorController();
   	return controller;
});


