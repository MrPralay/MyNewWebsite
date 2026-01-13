require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const User = require('./models/User'); 

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

// --- THE FIX FOR NODE v22 ---
// This acts as a catch-all for any undefined routes without using symbols that crash the server
app.use((req, res) => {
    res.redirect('/');
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Secure Connection Established'))
    .catch(err => console.error('Database connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server locked and loaded on port ${PORT}`));