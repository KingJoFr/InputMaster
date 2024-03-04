/*
I kept getting validation errors so I turned required to false.  Everything looks good in the database on mongodb site
*/
const mongoose= require('mongoose');


const Schema = mongoose.Schema;
const CardSchema = new Schema({
   //first 4 properties are for the flashcard app.
    generic: {
        type: String,
        required: false
    },
    brand: {
        type: String,
        required: false
    },
    use: {
        type: String,
        required: false
    },
    dea_class:{
        type: String,
        required: false
    },

    //these properties will be used to generate the random sig
  
    

});
/* removed action from schema.  That can be decided programatically based on route.
  If it is oral action is take, if intramuscullar action is inject etc*/

module.exports = mongoose.model('Card', CardSchema);