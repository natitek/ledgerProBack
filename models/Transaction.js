import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String, // 'income' or 'expense'
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Transaction', TransactionSchema);
