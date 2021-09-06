const authResolver = require('./auth');
const rideResolver = require('./rides');

const rootResolver = {
    ...authResolver,
    ...rideResolver
};

module.exports = rootResolver;