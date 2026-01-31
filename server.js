import express, { json } from 'express';
import cors from 'cors';
import authRoutes from "./routes/auth.js";
import popupRoutes from "./routes/popup.js";
import userRoutes from "./routes/user.js";
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });


const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Ledgerpro';
    await mongoose.connect(mongoURI);
    console.log(`${new Date()} MongoDB Connected...`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174' , 'https://journee-striped-chase.ngrok-free.dev'],
  credentials: true,
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

app.use(json());



//Routes
app.use('/api/auth', authRoutes);
app.use('/api/popup', popupRoutes);
app.use('/api/user', userRoutes);


/*Run*/
app.get('/', (req, res) => {
  console.log("GET / Request received");
  res.json({ status: 'Server is running', timestamp: new Date() });
});


/* Starting Server */
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});