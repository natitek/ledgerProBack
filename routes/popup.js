import { Router } from 'express';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import auth from '../middleware/auth.js';

const router = Router();

/*Transaction Popup*/
router.post('/add-transaction', auth, async (req, res) => {
  const { type, name, amount } = req.body;

  if (!name || isNaN(amount) || amount <= 0) {
    return res.status(422).json({
      status: 'Error',
      message: 'Invalid Description or Amount'
    });
  }

  try {
    const newTransaction = new Transaction({
      userId: req.user.id,
      accountId: req.body.accountId, // Added accountId
      type,
      name,
      amount,
      date: new Date()
    });

    await newTransaction.save();

    res.status(200).json({
      status: 'Success',
      message: 'Transaction-Added',
      transaction: newTransaction
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }

  console.log(`Transaction-Add attempt detected, Details: ${type}, ${name}, ${amount}`);
});

/*Add-Account Popup*/
router.post('/add-account', auth, async (req, res) => {
  const { Bank, number, amount } = req.body;

  if (!Bank || isNaN(number) || number <= 0 || !amount) {
    return res.status(422).json({
      status: 'Error',
      message: 'Invalid Account Number or Balance'
    });
  }

  try {
    const { Bank, number, amount, colorIndex } = req.body;

    const newAccount = new Account({
      userId: req.user.id,
      bankName: Bank,
      accountNumber: number,
      balance: amount,
      colorIndex: colorIndex || 0
    });

    await newAccount.save();

    res.status(200).json({
      status: 'Success',
      message: 'Account-Added',
      account: newAccount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }

  console.log(`Account-Change attempt detected, Details: ${Bank}, ${number}, ${amount}, ${colorIndex}`);

});


export default router;