const Ride = require('../../models/ride');
const User = require('../../models/user');
const { transformRide } = require('./common')

module.exports = {
    rides: async () => {
        try {
            const rides = await Ride.find();
            return rides.map(ride => {
                return transformRide(ride);
            });
        } catch(err) {
            throw err
        }
    },
    createRide: async args => {
        const newRide = new Ride({
            destLocation: args.rideInput.destLocation,
            departLocation: args.rideInput.departLocation,
            date: new Date(args.rideInput.date),
            price: args.rideInput.price,
            description: args.rideInput.description,
            isDriver: args.rideInput.isDriver,
            creator: '613616427985426a2bdeed91' // const obtained from MongoDB for now
        });
        let createdRide;
        try {
            const result = await newRide.save();
            createdRide = transformRide(result);
            const user = await User.findById('613616427985426a2bdeed91');
            if (!user) {
                throw new Error("User not found");
            }
            user.createdRides.push(newRide);
            await user.save();
            return createdRide;
        } catch(err) {
            throw err;
        }
    }
}

