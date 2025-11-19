const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatarUrl: {
        type: String,
        required: true
    },
    cloudinary_id: {
        type: String
    }
},
{
    timestamps: true
});

const User = mongoose.model("User", userSchema);
module.exports = User;