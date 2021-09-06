const bcrypt = require('bcryptjs');
const Ride = require('../../models/ride');
const User = require('../../models/user');

const populateRide = async rideIds => {
    try {
        const rides = await Ride.find({_id: {$in:  rideIds}});
        return rides.map(ride => {
            return { 
                ...ride._doc, 
                _id: ride.id, 
                date: new Date(ride.date).toISOString(), 
                creator: populateUser.bind(this, ride.creator)
            };
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

module.exports = {
    rides: async () => {
        try {
            const rides = await Ride.find();
            return rides.map(ride => {
                return { 
                    ...ride._doc, 
                    _id:ride._doc._id.toString(),
                    date: new Date(ride._doc.date).toISOString(),
                    creator: populateUser.bind(this, ride._doc.creator)
                };
            });
        } catch(err) {
            throw err
        }
    },
    createRide: args => {
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
        return newRide
            .save()
            .then(result => {
                createdRide = { 
                    ...result._doc, 
                    _id:result._doc._id.toString(), 
                    date: new Date(result._doc.date).toISOString(), 
                    creator: populateUser.bind(this, result._doc.creator) 
                };
                return User.findById('613616427985426a2bdeed91');
            })
            .then(user => {
                if (!user) {
                    throw new Error("User not found");
                }
                user.createdRides.push(newRide);
                return user.save();
            })
            .then(result => {
                return createdRide;
            })
            .catch(err => {
                console.log(err);
            });
    },
    createUser: args => {
        return User.findOne({ email: args.userInput.email }).then(user => {
            if (user) {
                throw new Error('User already exists.')
            }
            return bcrypt.hash(args.userInput.password, 12);
        })
        .then(hashedPassword => {
            const newUser = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            return newUser.save()
                .then(result => {
                    console.log(result);
                    return { ...result._doc, password: null, _id: result._doc._id.toString() };
                })
                .catch(err => {
                    console.log(err);
                }); 
            })
        .catch(err => {
            throw err
        });
    }

}