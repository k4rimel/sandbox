// Cordova is ready
//
function onDeviceReady() {
   var db = window.openDatabase("quizplayer", "1.0", "quizplayer db", 200000);
   db.transaction(createDB, errorCB, successCB);
}

// Create the Database
//
function createDB(tx) {
   	tx.executeSql('CREATE TABLE IF NOT EXISTS THEME (id unique PRIMARY KEY AUTOINCREMENT, label');
    tx.executeSql('CREATE TABLE IF NOT EXISTS QUIZ (id unique PRIMARY KEY AUTOINCREMENT, label, themeId, FOREIGN KEY(themeId) REFERENCES THEME(id))');
    tx.executeSql('CREATE TABLE IF NOT EXISTS QUESTION (id unique PRIMARY KEY AUTOINCREMENT, label, quizId, FOREIGN KEY(quizId) REFERENCES QUIZ(id)))');
    tx.executeSql('CREATE TABLE IF NOT EXISTS PROPOSITION (id unique PRIMARY KEY AUTOINCREMENT, label, isValid, questionId, FOREIGN KEY(quizId) REFERENCES QUESTION(id)))');
	
	tx.executeSql('INSERT INTO THEME (id,label) VALUES ("1", "Theme 1")');
	tx.executeSql('INSERT INTO THEME (id,label) VALUES ("2", "Theme 2")');
	tx.executeSql('INSERT INTO QUIZ (id, label, themeId) VALUES ("1", "Quiz 1", "1")');
	tx.executeSql('INSERT INTO QUIZ (id, label, themeId) VALUES ("1", "Question 1", "1")');
	tx.executeSql('INSERT INTO QUESTION (id, label, isValid, questionId) VALUES ("1", "prop 1 valid", "true", "1")');
	tx.executeSql('INSERT INTO QUESTION (id, label, isValid, questionId) VALUES ("1", "prop 2 invalid", "false", "1")');
}
function queryDB(tx) {
    tx.executeSql('SELECT * FROM QUIZ', [], querySuccess, errorCB);
}

// Query the success callback
//
function querySuccess(tx, results) {
    msgContainer.innerHTML =  results.rows.length;
    // this will be true since it was a select statement and so rowsAffected was 0
    if (!results.rowsAffected) {
      alert('No rows affected!');
      return false;
    }
    // for an insert statement, this property will return the ID of the last inserted row
    alert("Last inserted row ID = " + results.insertId);
}

// Transaction error callback
//
function successCB() {
    var db = window.openDatabase("quizplayer", "1.0", "quizplayer db", 200000);
    db.transaction(queryDB, errorCB);
}
function errorCB(err) {
    msgContainer.innerHTML = "Error processing SQL: "+err.code;
}

// Transaction success callback
//
