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

//Generate an API key for every new User (Natitek)
    
    function generateApiKey() {
  return crypto.randomBytes(32).toString("hex");}

  const newApiKey = generateApiKey();

    user = new User({
      name,
      email,
      password,
      newApiKey
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

// verify UserIssuedApiKey
async function verifyApiKey(req, res, next) {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "API key missing" });
    }

    const user = await User.findOne({ apiKey });

    if (!user) {
      return res.status(403).json({ error: "Invalid API key" });
    }

    // attach user for later use
    req.user = user;

    next();
  } catch (err) {
    console.error("API key verification failed:", err);
    res.status(500).json({ error: "Server error" });
  }
}
async function addTransaction(req,res,next){

}

router.post('/sync', verifyApiKey,addTransaction,(req,res)=>{
  console.log(req);
  
  res.json({ status: 'inside Sync', timestamp: new Date() });
});

router.get("/api/apikey", verifyApiKey, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("apiKey");

    if (!user || !user.apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    res.json({
      apiKey: user.apiKey
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;