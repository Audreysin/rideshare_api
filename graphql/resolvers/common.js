const User = require('../../models/user');
const Ride = require('../../models/ride');

const populateRide = async rideIds => {
    try {
        const rides = await Ride.find({_id: {$in:  rideIds}});
        return rides.map(ride => {
            return transformRide(ride);
        });
    } catch (err) {
        throw err;
    }
}

const populateUser = async userId => {
    try {
        const userData = await User.findById(userId);
        return { 
            ...userData._doc, 
            _id: userData.id, 
            createdRides: populateRide.bind(this, userData._doc.createdRides) 
        };
    } catch(err) {
        throw err;
    }
}

const transformRide = ride => {
    return {
        ...ride._doc, 
        _id:ride._doc._id.toString(),
        date: new Date(ride._doc.date).toISOString(),
        creator: populateUser.bind(this, ride._doc.creator)
    };
}

exports.transformRide = transformRide;