import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    googleId: {
       type: String}
        ,

    apiKey: {
        type: String,
        unique: true
    }
});

export default mongoose.model('User', UserSchema);
