const mongoose = require('mongoose');
const passportLocaMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    admin: {
        type: Boolean,
        default: false
    }
});

userSchema.plugin(passportLocaMongoose);

module.exports = mongoose.model('User', userSchema);