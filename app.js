const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema} = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Ride = require('./models/ride');
const User = require('./models/user');
const app = express();
const db_uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lhpdr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const populateRide = rideIds => {
    return Ride.find({_id: {$in:  rideIds}}).then(rides => {
        return rides.map(ride => {
            return { ...ride._doc, _id: ride.id, creator: populateUser.bind(this, ride.creator)}
        })
    })
    .catch(err => {
        throw err;
    })
}

const populateUser = userId => {
    return User.findById(userId)
        .then(userData => {
            return { ...userData._doc, _id: userData.id, createdRides: populateRide.bind(this, userData._doc.createdRides) };
        })
        .catch(err => {
            throw err
        })
}

app.use(
    '/api',
    graphqlHTTP({
        schema: buildSchema(`
            type Ride {
                _id: ID!
                destLocation: String!
                departLocation: String!
                date: String!
                price: Float!
                description: String!
                isDriver: Boolean!
                creator: User!
            }

            type User {
                _id: ID!
                email: String!
                password: String
                createdRides: [Ride!]
            }

            input RideInput {
                destLocation: String!
                departLocation: String!
                date: String!
                price: Float!
                description: String!
                isDriver: Boolean!
            }

            input UserInput {
                email: String!
                password: String!
            }

            type RootQuery {
                rides: [Ride!]!
            }
            
            type RootMutation {
                createRide(rideInput: RideInput): Ride
                createUser(userInput: UserInput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
        `),
        rootValue: {
            rides: () => {
                return Ride
                    .find()
                    .then(rides => {
                        return rides.map(ride => {
                            return { 
                                ...ride._doc, 
                                _id:ride._doc._id.toString(),
                                creator: populateUser.bind(this, ride._doc.creator)
                            };
                        });
                    })
                    .catch(err => {
                        throw err;
                    });
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
                        createdRide = { ...result._doc, _id:result._doc._id.toString(), creator: populateUser.bind(this, result._doc.creator) };
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

        },
        graphiql: true
    })
);

mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true })
.then (() => {
    app.listen(3000);
    console.log("Connection successful");
})
.catch(err => {
    console.log(err);
});
