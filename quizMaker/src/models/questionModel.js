

	'use strict';
/*
 * QuestionModel
 */

// a QuestionModel is where the data object is created.
var QuestionModel = function (quiz) {
	this.quiz = quiz;
	this.label = "";
	this.answers = [];
	this.correctAnswers = [];

	// return the QuestionModel instance
	return this;
};

// a QuestionModel constructor might have a function that creates new QuestionModel instances.
QuestionModel.find = function ( id ) {
	// data used to create a new QuestionModel may come from anywhere
	// but in this example data comes from this inline object.
	var questionData = {};
	

	var question = new QuestionModel(questionData);
	return question;
};