const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth')

const app = express();
const db_uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.lhpdr.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(isAuth);

app.use(
    '/api',
    graphqlHTTP({
        schema: graphQlSchema,
        rootValue: graphQlResolvers,
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
