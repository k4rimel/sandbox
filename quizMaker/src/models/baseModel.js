'use strict';

// a baseModel is where the data object is created.
var baseModel = function (data) {
	this.data = data;

	// return the baseModel instance
	return this;
};
// a baseModel constructor might have a function that creates new baseModel instances.
baseModel.find = function () {
	// data used to create a new baseModel may come from anywhere
	// but in this example data comes from this inline object.
	// var args = arguments[0];
	// var innerData = this.get();
	this.get();


	var model = new baseModel();
	return model;
};

baseModel.get = function () {
	
};