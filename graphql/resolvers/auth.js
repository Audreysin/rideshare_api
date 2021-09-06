const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
    },
    login: async ({email, password}) => {
        const user = await User.findOne({ email: email });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const pwdIsCorrect = await bcrypt.compare(password, user.password);
        if (!pwdIsCorrect) {
            throw new Error ('Invalid credentials');
        }
        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            'somesecretkey',
            {expiresIn: '1h'}
        );
        return { userId: user.id, token: token, tokenExpiration: 1}
    }
}