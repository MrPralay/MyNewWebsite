require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cookieParser());

// --- THE BOUNCER MIDDLEWARE ---
const protect = (req, res, next) => {
    const token = req.cookies.token; 
    if (!token) {
        return res.redirect('/'); // Hard stop. No files sent.
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.redirect('/'); 
        req.user = user;
        next();
    });
};

// 1. Serve the Dashboard HTML
app.get('/dashboard', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../private/proposal_dashboard.html'));
});

// 2. Serve Private Assets (JS and CSS)
// This allows the HTML to load <link> and <script> from the private folder
app.get('/private/:fileName', protect, (req, res) => {
    const file = req.params.fileName;
    res.sendFile(path.join(__dirname, '../private', file));
});

// 3. API Data Route
app.get('/api/dashboard-data', protect, (req, res) => {
    res.json({
        message: "Will you marry me?",
        user: req.user.username 
    });
});

// 4. Public files (Login page, login.js)
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/api', authRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Connected'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));