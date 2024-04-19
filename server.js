require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start the server after successfully connecting to MongoDB
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch(err => console.error('Error connecting to MongoDB', err));

// Define User schema and model
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String,
  balance: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('User', UserSchema);

// Add routes below...

// Example route to fetch username
app.get('/GetUsername/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send({ username: user.fullName });
  } catch (error) {
    console.error('Error fetching username:', error);
    res.status(500).send('Error fetching username');
  }
});

// Example login route
app.post('/Login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email, password });
    if (!existingUser) {
      return res.status(400).send('User not found');
    }
    res.send({ exist: true, balance: existingUser.balance, email: existingUser.email });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

// Example signup route
app.post('/Signup', async (req, res) => {
  try {
    const { fullName, email, password, balance } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }
    const newUser = new User({ fullName, email, password, balance });
    await newUser.save();
    res.send('User created successfully');
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send('Error signing up');
  }
});

// Example route to update balance
app.post('/UpdateBalance', async (req, res) => {
  try {
    const { email, balance } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send('User not found');
    }
    user.balance = balance;
    await user.save();
    res.send('Balance updated successfully');
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).send('Error updating balance');
  }
});
