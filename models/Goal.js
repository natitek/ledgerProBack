import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date
    },
    dailyAmount: {
        type: Number,
        default: 0
    },
    durationDays: {
        type: Number
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Goal', GoalSchema);
