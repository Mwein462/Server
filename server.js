// Load environment variables
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB', err));

// Define User schema and model
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  balance: {
    type: Number,
    default: 0 // Default balance value
  }
});

const User = mongoose.model('User', UserSchema);

// Add this route to fetch username
app.get('/GetUsername/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send('User not found');
    }
    // Return the user's username
    res.send({ username: user.fullName });
  } catch (error) {
    console.error('Error fetching username:', error);
    res.status(500).send('Error fetching username');
  }
});

// Add a new route to fetch user's full name and balance
app.get('/GetUserInfo/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    // Find the user by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send('User not found');
    }
    // Return the user's full name and balance
    res.send({ fullName: user.fullName, balance: user.balance });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).send('Error fetching user info');
  }
});

// Login route
app.post('/Login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ email, password });
    if (!existingUser) {
      return res.status(400).send('not exist');
    }
    // Return user's balance along with other details
    res.send({ exist: true, balance: existingUser.balance, email: existingUser.email });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

// Signup route
app.post('/Signup', async (req, res) => {
  try {
    const { fullName, email, password, balance } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('exist');
    }
    // Create a new user
    const newUser = new User({ fullName, email, password, balance });
    await newUser.save();
    res.send('success');
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send('Error signing up');
  }
});

// Update balance route
app.post('/UpdateBalance', async (req, res) => {
  try {
    const { email, balance } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }
    // Update the balance
    user.balance = balance;
    await user.save();
    res.send('Balance updated successfully');
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).send('Error updating balance');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
