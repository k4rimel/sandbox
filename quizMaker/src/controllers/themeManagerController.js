var ThemeManagerController = function () {
	this.container = $('#mainContainer');
	return this;
};

// if(ThemeManagerController.prototype.initializer === true) return;
// ThemeManagerController.prototype.initializer = true;

ThemeManagerController.prototype.init = function () {
	var that = this;
	that.loadThemes("theme1","theme2");
};

ThemeManagerController.prototype.loadThemes = function () {
	var model = ThemeManagerModel.find(arguments);
	var view = new ThemeManagerView(model);

	view.render();
};
ThemeManagerController.prototype.destroy = function () {
	// Zoom in
};
Core.register('ThemeManager', function()
{
   var controller = new ThemeManagerController();
   return controller;
});


