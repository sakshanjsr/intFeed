// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow requests from the React frontend
app.use(express.json()); // Allows parsing of JSON request bodies

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

// Create a unique compound index on name and age
userSchema.index({ name: 1, age: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

// API Routes
app.post('/api/users', async (req, res) => {
  const { name, age } = req.body;
  try {
    const existingUser = await User.findOne({ name, age });
    if (existingUser) {
      return res.status(409).json({ error: 'Duplicate record already exists.' });
    }
    const newUser = new User({ name, age });
    await newUser.save();
    res.status(201).json({ message: 'Record saved successfully!', user: newUser });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate record already exists.' });
    }
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}).sort({ _id: 1 });
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Could not retrieve users.' });
  }
});

// Start the server after connecting to the database
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
  });
});