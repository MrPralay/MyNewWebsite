const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        // Ensure your User model has currentSessionId AND authId fields
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: 'Username taken' });
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

        // 1. GENERATE SESSION ID & MASTER AUTH ID
        const sessionId = crypto.randomBytes(16).toString('hex');
        const masterAuthId = crypto.randomBytes(24).toString('hex'); // This is your Master Key

        // 2. SAVE BOTH TO DATABASE
        user.currentSessionId = sessionId;
        user.authId = masterAuthId; // The key you'll find in MongoDB
        await user.save();

        // 3. INCLUDE SESSION ID IN THE JWT (Standard Security)
        const token = jwt.sign(
            { id: user._id, username: user.username, sessionId: sessionId }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true, 
            secure: true,      
            sameSite: 'lax',   
            maxAge: 3600000    
        });

        // We do NOT send masterAuthId in a cookie automatically. 
        // You will go to MongoDB Atlas to copy it for your manual test.
        res.json({ message: "Login successful. Master Key generated in DB." });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.decode(token);
            if (decoded) {
                // PRO SECURITY: Wipe BOTH the Session and the Master Key
                await User.findByIdAndUpdate(decoded.id, { 
                    currentSessionId: null,
                    authId: null 
                });
            }
        }
        res.clearCookie('token');
        res.clearCookie('master_key'); // Clears the manual cookie if it exists
        res.json({ message: "Logged out. All keys destroyed." });
    } catch (err) {
        res.status(500).json({ error: "Logout error" });
    }
});

module.exports = router;