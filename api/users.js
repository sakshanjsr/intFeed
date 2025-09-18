// api/users.js
const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

// Mongoose connection (optimized for serverless)
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw new Error('Database connection failed.');
  }
};

// API Route Handler
export default async (req, res) => {
  await connectDB();

  if (req.method === 'POST') {
    const { name, age } = req.body;
    try {
      const newUser = new User({ name, age });
      await newUser.save();
      return res.status(201).json({ message: 'Record saved successfully!', user: newUser });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'Duplicate record already exists.' });
      }
      console.error('Error saving user:', err);
      return res.status(500).json({ error: 'Something went wrong.' });
    }
  } else if (req.method === 'GET') {
    try {
      const users = await User.find({}).sort({ _id: 1 });
      return res.status(200).json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Could not retrieve users.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};