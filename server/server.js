require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const crypto = require('crypto'); // Added for auto-session generation
const authRoutes = require('./routes/auth');
const User = require('./models/User'); 

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- 1. PRO SECURITY: MASTER KEY REDIRECT MIDDLEWARE ---
// This checks for the manual 'master_key' cookie and bypasses the login screen
const checkMasterKey = async (req, res, next) => {
    const manualKey = req.cookies.master_key;

    if (manualKey) {
        try {
            const user = await User.findOne({ authId: manualKey });
            
            if (user) {
                // Key matches! Auto-generate a new session
                const newSessionId = crypto.randomBytes(16).toString('hex');
                user.currentSessionId = newSessionId;
                await user.save();

                // Create the signed token
                const token = jwt.sign(
                    { id: user._id, username: user.username, sessionId: newSessionId },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Set the token cookie and teleport to dashboard
                res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'lax' });
                return res.redirect('/dashboard');
            }
        } catch (err) {
            console.error("Master Key Check Error:", err);
        }
    }
    next(); // No key or invalid key? Proceed as normal.
};

// --- 2. UPDATED SESSION-AWARE MIDDLEWARE ---
const protect = async (req, res, next) => {
    const token = req.cookies.token; 
    
    if (!token) {
        return res.redirect('/'); 
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || user.currentSessionId !== decoded.sessionId) {
            console.log("❌ Session expired or replaced. Redirecting...");
            res.clearCookie('token'); 
            return res.redirect('/'); 
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        return res.redirect('/'); 
    }
};

// --- ROUTES ---

app.use('/api', authRoutes);

// Apply checkMasterKey ONLY to the landing/login page
app.get('/', checkMasterKey, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/dashboard', protect, (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.sendFile(path.join(__dirname, '../private/proposal_dashboard.html'));
});

app.get('/private/:fileName', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../private', req.params.fileName));
});

app.get('/api/dashboard-data', protect, (req, res) => {
    res.json({
        message: "Will you marry me?",
        user: req.user.username 
    });
});

app.use(express.static(path.join(__dirname, '../client')));

// --- THE FIX FOR NODE v22 ---
app.use((req, res) => {
    res.redirect('/');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Secure Connection Established'))
    .catch(err => console.error('Database connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server locked and loaded on port ${PORT}`));