const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// REGISTER
// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({ username, password: hashedPassword });
    
    // Save to MongoDB
    await newUser.save();
    
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    // 11000 is the specific MongoDB code for "Duplicate Entry"
    if (err.code === E11000) {
      return res.status(400).json({ error: 'Username already taken!' });
    }
    
    // For other errors, send the message
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;