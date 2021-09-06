const { buildSchema} = require('graphql');

module.exports = buildSchema(`
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

    type AuthData {
        userId: ID!
        token: String!
        tokenExpiration: Int!
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
        login(email: String!, password: String!): AuthData!
    }

    type RootMutation {
        createRide(rideInput: RideInput): Ride
        createUser(userInput: UserInput): User
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`)