'use strict';
/*
 * DashboardModel
 */

var DashboardModel = function (data) {
	this.Themes = data;
	return this;
};
DashboardModel.find = function () {

	var args = arguments[0];
	var managerData = this.getData(args);


	var manager = new DashboardModel(managerData)
	return manager;
};

DashboardModel.getData = function (args) {

	var outputData = [];
	for (var i = 0; i < args.length; i++) {
		$.ajax({
	  		type: 'GET',
	  		url: 'data/themes/'+args[i],
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