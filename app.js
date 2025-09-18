// app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3000;
require('dotenv').config();

// Database connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
};

// Define the User schema and model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

// Add a unique compound index for the name and age combination
userSchema.index({ name: 1, age: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { message: null, error: null });
});

app.post('/save', async (req, res) => {
  const { name, age } = req.body;
  try {
    const existingUser = await User.findOne({ name, age });
    if (existingUser) {
      return res.render('index', { error: 'Error: Duplicate record already exists.', message: null });
    }

    const newUser = new User({ name, age });
    await newUser.save();

    res.render('index', { message: 'Success: Record saved successfully!', error: null });
  } catch (err) {
    if (err.code === 11000) { // MongoDB duplicate key error code
      res.render('index', { error: 'Error: Duplicate record already exists.', message: null });
    } else {
      console.error('Error saving user:', err);
      res.render('index', { error: 'Error: Something went wrong.', message: null });
    }
  }
});

app.get('/list', async (req, res) => {
  try {
    const users = await User.find({}).sort({ _id: 1 });
    res.render('list', { users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.render('list', { users: [], error: 'Could not retrieve list of users.' });
  }
});

// Connect to the database and start the server
connectDB().then(() => {
    app.listen(port, () => {
      console.log(`intFeed listening at http://localhost:${port}`);
    });
});