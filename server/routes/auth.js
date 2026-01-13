const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node tool for random IDs
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Ensure your User model has currentSessionId field
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

        // 1. GENERATE A NEW SESSION ID
        const sessionId = crypto.randomBytes(16).toString('hex');

        // 2. SAVE SESSION ID TO THE DATABASE
        user.currentSessionId = sessionId;
        await user.save();

        // 3. INCLUDE SESSION ID IN THE JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                sessionId: sessionId // The "Double Lock" link
            }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true, 
            secure: true,      
            sameSite: 'lax',   
            maxAge: 3600000    
        });

        res.json({ message: "Login successful" });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/logout', async (req, res) => {
    try {
        // Find user by token data if you want to kill the session in DB too
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.decode(token);
            if (decoded) {
                // Wipe the session ID from DB so the token becomes useless
                await User.findByIdAndUpdate(decoded.id, { currentSessionId: null });
            }
        }
        res.clearCookie('token');
        res.json({ message: "Logged out" });
    } catch (err) {
        res.status(500).json({ error: "Logout error" });
    }
});

module.exports = router;