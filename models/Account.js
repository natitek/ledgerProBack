import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    colorIndex: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Account', AccountSchema);
