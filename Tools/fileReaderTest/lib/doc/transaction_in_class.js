var myObject {

    /**
     * The given model data
     * @param mixed
     */
    data = null,


    /**
     * Init function
     */
    init: function(){
        myObject.loadModel();
    },


    /*
     * Load data model
     */
    loadModel: function(){

        db.transaction(function(tx){

            //reset data
            window.myObject.data = [];  

            //select wonster from sqlLite db
            tx.executeSql('SELECT * FROM bikiniBottom',
            [],
            function(tx, results){ 
                if(results.rows.length > 0){
                    for (var i=0; i<results.rows.length; i++){
                        window.myObject.data[i] = results.rows.item(i).data;
                    }
                }else{
                    window.myObject.data = null;
                }
             });
        }); 
    }
}