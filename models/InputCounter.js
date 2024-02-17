const mongoose= require('mongoose');


const Schema = mongoose.Schema;
const ICounterSchema = new Schema({
        icount: {
            type: Number,
            requred: true
        }

        
    });

module.exports = mongoose.model('ICounter', ICounterSchema);