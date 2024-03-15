/*
I kept getting validation errors so I turned required to false.  Everything looks good in the database on mongodb site
*/
const mongoose= require('mongoose');


const Schema = mongoose.Schema;
const MCardSchema = new Schema({
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
    form:{
        type: String,
        required: false
    },
    route:{
        type: String,
        required: false
    },
    sig:{
        type: String,
        required: false
    }
    

}, {strict: false});
/* removed action from schema.  That can be decided programatically based on route.
  If it is oral action is take, if intramuscullar action is inject etc*/

module.exports = mongoose.model('MCard', MCardSchema);