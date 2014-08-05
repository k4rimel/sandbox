/* ==========================================================================
 * A "Hello World"-like example of Javascript using the MVC pattern.
 * This time with the addition of events.
 * ========================================================================== */



/*
 * Model
 */

// a model is where the data object is created.
var _Model = function ( data ) {
	// the model instance has a property called "myProperty"
	// created from the data's "yourProperty".
	this.myProperty = data.yourProperty;

	// return the model instance
	return this;
};

// a model constructor might have a function that creates new model instances.
_Model.find = function ( id ) {
	// data used to create a new model may come from anywhere
	// but in this example data comes from this inline object.
	var ourData = {
		'123': {
			yourProperty: 'You clicked.'
		},
		'456': {
			yourProperty: 'You pressed a key.'
		}
	};

	// get a new model instance containing our data.
	var model = new _Model(ourData[id]);

	// return the model.
	return model;
};



/*
 * View
 */

// a view is where the output is created.
var _View = function ( model ) {
	this.model = model;

	return this;
};

// a view might have a function that returns the rendered output.
_View.prototype.output = function () {
	// data used to create a template may come from anywhere
	// but in this example template comes from this inline string.
	var ourData = '<h1><%= myProperty %></h1>';

	// store this instance for reference in the replace function below
	var instance = this;

	// return the template using values from the model.
	return ourData.replace(/<%=\s+(.*?)\s+%>/g, function (m, m1) {
		return instance.model[m1];
	});
};

// a view might have a function that renders the output.
_View.prototype.render = function () {
	// this view renders to the element with the id of "output"
	document.getElementById('output').innerHTML = this.output();
};


/*
 * Controller
 */

// a controller is where the model and the view are used together.
var _Controller = {};

// this function uses the Model and View together.
_Controller.loadView = function ( id ) {
	// get the model.
	var model = _Model.find( id );

	// get a new view.
	var view = new _View(model);

	// run the view's "render" function
	view.render();
};



/*
 * Event
 */

var Event123 = 1 << 0;
var Event456 = 1 << 1;

// an event is where something happening is captured.
var _Event = function (flag) {
	// check if Event123 was passed
	if (flag & Event123) {
		// run the controller's show function
		_Controller.loadView(123);
	}

	// check if Event456 was passed
	if (flag & Event456) {
		// run the controller's show function
		_Controller.loadView(456);
	}
};



/*
 * Example
 */

function bootstrapper() {
	document.onclick = function () {
		_Event(Event123);
	};

	document.onkeydown = function () {
		_Event(Event456);
	};
}

bootstrapper();