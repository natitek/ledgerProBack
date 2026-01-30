import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = Router();

// Sign Up
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    res.status(201).json({ status: 'success', message: 'Account Created! Please Sign In.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ status: 'error', message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ status: 'error', message: 'Invalid Credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          status: 'success',
          message: 'Login successful!',
          token,
          user: { id: user.id, name: user.name, email: user.email }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// Verify Token (Optional utility route)
router.get('/verify', (req, res) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    res.json({ valid: true, user: decoded.user });
  } catch (err) {
    res.status(401).json({ valid: false, msg: 'Token is not valid' });
  }
});

export default router;