const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username taken' });
    }
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
        { id: user._id, username: user.username }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
    );

    // --- SSR UPDATE START ---
    // Set the token as an HttpOnly cookie
    res.cookie('token', token, {
        httpOnly: true, // Prevents JavaScript (and hackers) from stealing the token
        secure: process.env.NODE_ENV === 'production', // Use HTTPS in production (Render)
        sameSite: 'strict', // Prevents CSRF attacks
        maxAge: 3600000 // 1 hour in milliseconds
    });
    // --- SSR UPDATE END ---

    // We still send the token back in JSON for any client-side scripts that need it,
    // but the Cookie is what the Server will use for SSR.
    res.json({ token, message: "Login successful" });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Added a logout route to clear the cookie
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out" });
});

module.exports = router;