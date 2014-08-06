'use strict';
var ThemeManagerModel = function (data) {
	this.themes = data;
	this.getTheme = function(id) {

		if(this.themes.length > 1) {
			for (var i = 0; i < this.themes.length; i++) {
				if(this.themes[i].Quiz.id === id) {
					return this.themes[i].Quiz;
				}
			};
		} else {
			return this.themes[0].Quiz;
		}
	}
	return this;
};
ThemeManagerModel.find = function () {
	var args = arguments[0];
	var managerData = this.getData(args);

	
	var manager = new ThemeManagerModel(managerData)
	return manager;
};

ThemeManagerModel.getData = function (args) {

	var outputData = [];
	for (var i = 0; i < args.length; i++) {
		$.ajax({
	  		type: 'GET',
	  		url: 'data/themes/'+args[i]+'.json',
	  		dataType: 'json',
	  		async: false,
	  		success: function(data){
			 	outputData.push(data);	
	  		},
	  		error: function(xhr, type){
	  			console.log("error");
	  		}
		});
	};
	
	return outputData;
};