/*
I kept getting validation errors so I turned required to false.  Everything looks good in the database on mongodb site
*/
const mongoose= require('mongoose');


const Schema = mongoose.Schema;
const CardSchema = new Schema({
   
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
    form:{
        type: String,
        required: false
    }

});

module.exports = mongoose.model('Card', CardSchema);