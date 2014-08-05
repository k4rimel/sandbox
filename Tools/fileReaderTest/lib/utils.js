var Utils = {
	dom : {
		hide:function(element) {
        	element.style.display= "none";
	    },
	    show:function(element) {
	        element.style.display= "block";
	    }
	},
	db :{
		query : function(db, tx, queryStr) {
			db.transaction(function() {
				tx.executeSql(queryStr);
			}, function() {
				console.log("Error processing SQL: "+err);
			}, function() {
				return true;
			});
		}
	} 
    
};