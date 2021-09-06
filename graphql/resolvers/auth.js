const bcrypt = require('bcryptjs');
const User = require('../../models/user');

module.exports = {
    createUser: async args => {
        try {
            const user = await User.findOne({ email: args.userInput.email });
            if (user) {
                throw new Error('User already exists.');
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const newUser = new User({
                email: args.userInput.email,
                password: hashedPassword
            });
            const result = await newUser.save();
            return { ...result._doc, password: null, _id: result._doc._id.toString() };
        } catch(err) {
            throw err;
        }
    }
}