require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const User = require('./models/User'); // <--- ADD THIS to access the DB

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- UPDATED SESSION-AWARE MIDDLEWARE ---
const protect = async (req, res, next) => {
    const token = req.cookies.token; 
    
    if (!token) {
        return res.redirect('/'); 
    }

    try {
        // 1. Verify the JWT first
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 2. Look up the user in DB to check their session
        const user = await User.findById(decoded.id);

        // 3. THE DOUBLE LOCK: Check if session ID matches
        if (!user || user.currentSessionId !== decoded.sessionId) {
            console.log("❌ Session expired or replaced. Redirecting...");
            res.clearCookie('token'); // Wipe the invalid cookie
            return res.redirect('/'); 
        }

        // Attach user info to the request
        req.user = user;
        next();
    } catch (err) {
        console.error("Auth Error:", err.message);
        return res.redirect('/'); 
    }
};

// --- ROUTES ORDER ---

app.use('/api', authRoutes);

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Fix for Node v22 / Express 5 wildcard error
app.get('/:path*', (req, res) => {
    res.redirect('/');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Secure Connection Established'))
    .catch(err => console.error('Database connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server locked and loaded on port ${PORT}`));