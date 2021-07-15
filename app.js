const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema} = require('graphql');
const mongoose = require('mongoose');

const app = express();
const db_uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lhpdr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(db_uri);

const rides = [];

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
                time: String!
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
                return rides;
            },
            createRide: (args) => {
                const newRide = {
                    _id: Math.random().toString(),
                    destLocation: args.rideInput.destLocation,
                    departLocation: args.rideInput.departLocation,
                    time: args.rideInput.time,
                    date: args.rideInput.date,
                    price: +args.rideInput.price,
                    description: args.rideInput.description,
                    isDriver: args.rideInput.isDriver
                }
                rides.push(newRide);
                return newRide;
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
