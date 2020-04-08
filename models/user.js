const mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: false },
    sid: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }
}),
    User = mongoose.model('user', userSchema);

module.exports = User;