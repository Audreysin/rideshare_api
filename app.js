const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema} = require('graphql');
const mongoose = require('mongoose');

const Ride = require('./models/ride')

const app = express();
const db_uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lhpdr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
            }

            input RideInput {
                destLocation: String!
                departLocation: String!
                date: String!
                price: Float!
                description: String!
                isDriver: Boolean!
            }

            type RootQuery {
                rides: [Ride!]!
            }
            
            type RootMutation {
                createRide(rideInput: RideInput): Ride
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
                            return { ...ride._doc, _id:ride._doc._id.toString() };
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
                    isDriver: args.rideInput.isDriver
                });
                return newRide
                    .save()
                    .then(result => {
                        console.log(result);
                        return { ...result._doc, _id:result._doc._id.toString() };
                    })
                    .catch(err => {
                        console.log(err);
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
