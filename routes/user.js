import { Router } from 'express';
import Reminder from '../models/Reminder.js';
import Goal from '../models/Goal.js';
import auth from '../middleware/auth.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

const router = Router();

/*Set-Reminder*/
router.post('/set-reminder', auth, async (req, res) => {
  const { name, amount, remdate, type, accountId } = req.body;

  if (!name || isNaN(amount) || amount <= 0) {
    return res.status(422).json({
      status: 'Error',
      message: 'Invalid Name or Amount'
    });
  }

  try {
    const newReminder = new Reminder({
      userId: req.user.id,
      name,
      amount,
      date: remdate,
      type,
      accountId
    });

    await newReminder.save();

    res.status(200).json({
      status: 'Success',
      message: 'Reminder-Set',
      reminder: newReminder
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }

  console.log(`Reminder setting detected, Details: ${name}, ${amount}, ${remdate}, ${type}`);

});

/*Set-Goal*/
router.post('/set-goal', auth, async (req, res) => {
  const { Gname, Tamount, deadlineOption, accountId } = req.body;

  if (!Gname || isNaN(Tamount) || Tamount <= 0 || !deadlineOption) {
    return res.status(422).json({
      status: 'Error',
      message: 'Make sure all fields are filled and valid'
    });
  }

  try {
    // Calculate deadline date based on option (days)
    const deadlineDate = new Date();
    const days = parseInt(deadlineOption);
    deadlineDate.setDate(deadlineDate.getDate() + days);
    const dailyAmount = (Tamount / days).toFixed(2);

    const newGoal = new Goal({
      userId: req.user.id,
      name: Gname,
      targetAmount: Tamount,
      deadline: deadlineDate,
      dailyAmount: parseFloat(dailyAmount),
      durationDays: days,
      accountId
    });

    await newGoal.save();

    res.status(200).json({
      status: 'Success',
      message: 'Goal-Set',
      goal: newGoal
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }

  console.log(`Goal setting detected, Details: ${Gname}, ${Tamount}, ${deadlineOption}`);

});

router.get('/dashboard-data', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await Account.find({ userId }).sort({ createdAt: 1 });

    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    // Fetch User for Name
    const user = await User.findById(userId).select('name');

    // Calculate computed balance, income, and expense for each account
    const accountsWithStats = accounts.map(account => {
      const accountIncome = transactions
        .filter(t => t.type === 'income' && t.accountId && t.accountId.toString() === account._id.toString())
        .reduce((acc, t) => acc + t.amount, 0);

      const accountExpense = transactions
        .filter(t => t.type === 'expense' && t.accountId && t.accountId.toString() === account._id.toString())
        .reduce((acc, t) => acc + t.amount, 0);

      return {
        bankName: account.bankName,
        accountNumber: account.accountNumber,
        balance: account.balance + accountIncome - accountExpense,
        income: accountIncome,
        expense: accountExpense,
        colorIndex: account.colorIndex || 0,
        id: account._id
      };
    });

    // Aggregates
    const totalBalance = accountsWithStats.reduce((acc, a) => acc + a.balance, 0);
    const totalIncome = accountsWithStats.reduce((acc, a) => acc + a.income, 0);
    const totalExpense = accountsWithStats.reduce((acc, a) => acc + a.expense, 0);

    // Prepare data for frontend
    const dashboardData = {
      userName: user ? user.name : 'User',
      accounts: accountsWithStats,
      totalBalance,
      totalIncome,
      totalExpense,
      recentTransactions: transactions.slice(0, 10),
      chartData: transactions.map(t => ({
        type: t.type,
        Description: t.name,
        Amount: t.amount,
        accountId: t.accountId
      }))
    };

    res.json({ status: 'Success', data: dashboardData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/* Get Reminders */
router.get('/reminders', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ date: 1 });
    res.json({ status: 'Success', reminders });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});

/* Delete Reminder */
router.delete('/reminder/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ status: 'Error', message: 'Reminder not found' });
    if (reminder.userId.toString() !== req.user.id) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    await reminder.deleteOne();
    res.json({ status: 'Success', message: 'Reminder Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});

/* Get Goals */
router.get('/goals', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ status: 'Success', goals });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});

/* Delete Goal */
router.delete('/goal/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ status: 'Error', message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    await goal.deleteOne();
    res.json({ status: 'Success', message: 'Goal Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});

/* Contribute to Goal */
router.post('/contribute-goal', auth, async (req, res) => {
  const { goalId, amount } = req.body;
  if (!goalId || isNaN(amount) || amount <= 0) {
    return res.status(422).json({ status: 'Error', message: 'Invalid Input' });
  }

  try {
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ status: 'Error', message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    goal.currentAmount += parseFloat(amount);
    await goal.save();

    res.json({ status: 'Success', message: 'Contribution Added', goal });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});

/* Update Reminder */
router.put('/reminder/:id', auth, async (req, res) => {
  const { name, amount, remdate, type } = req.body;
  try {
    let reminder = await Reminder.findById(req.params.id);
    if (!reminder) return res.status(404).json({ status: 'Error', message: 'Reminder not found' });
    if (reminder.userId.toString() !== req.user.id) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    reminder.name = name || reminder.name;
    reminder.amount = amount || reminder.amount;
    reminder.date = remdate || reminder.date;
    reminder.type = type || reminder.type;

    await reminder.save();
    res.json({ status: 'Success', message: 'Reminder Updated', reminder });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});

/* Update Goal */
router.put('/goal/:id', auth, async (req, res) => {
  const { name, targetAmount } = req.body;
  try {
    let goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ status: 'Error', message: 'Goal not found' });
    if (goal.userId.toString() !== req.user.id) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    goal.name = name || goal.name;
    if (targetAmount) {
      goal.targetAmount = targetAmount;
      if (goal.durationDays) {
        goal.dailyAmount = parseFloat((targetAmount / goal.durationDays).toFixed(2));
      }
    }

    await goal.save();
    res.json({ status: 'Success', message: 'Goal Updated', goal });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});


/* Delete Transaction */
router.delete('/transaction/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ status: 'Error', message: 'Transaction not found' });
    if (transaction.userId.toString() !== req.user.id) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    // When a transaction is deleted, we might need to adjust the account balance.
    // However, in this app, balance seems to be computed from transactions on-the-fly in /dashboard-data.
    // Let's check Account model to be sure.

    await transaction.deleteOne();
    res.json({ status: 'Success', message: 'Transaction Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});


/* Update Account */
router.put('/account/:id', auth, async (req, res) => {
  const { accountNumber, balance, colorIndex } = req.body;
  try {
    let account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ status: 'Error', message: 'Account not found' });
    if (account.userId.toString() !== req.user.id) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    account.accountNumber = accountNumber || account.accountNumber;
    if (balance !== undefined) account.balance = balance;
    if (colorIndex !== undefined) account.colorIndex = colorIndex;

    await account.save();
    res.json({ status: 'Success', message: 'Account Updated', account });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});

/* Delete Account */
router.delete('/account/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ status: 'Error', message: 'Account not found' });
    if (account.userId.toString() !== req.user.id) return res.status(401).json({ status: 'Error', message: 'Unauthorized' });

    // Delete associated transactions, goals, and reminders
    await Transaction.deleteMany({ accountId: req.params.id });
    await Goal.deleteMany({ accountId: req.params.id });
    await Reminder.deleteMany({ accountId: req.params.id });

    await account.deleteOne();
    res.json({ status: 'Success', message: 'Account and associated data deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'Error', message: 'Server Error' });
  }
});


export default router;