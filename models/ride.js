const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rideSchema = new Schema({
    destLocation: {
        type: String,
        required: true
    },
    departLocation: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isDriver: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Ride', rideSchema);