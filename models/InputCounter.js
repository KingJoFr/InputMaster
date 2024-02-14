const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InputCounter = new Schema(
    {
        count: {
            type: Number,
            required: false
        }
    }
);

module.exports = mongoose.model('InpCount', InputCounter);