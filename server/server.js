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

// --- SECURITY MIDDLEWARE ---
const protect = (req, res, next) => {
    const token = req.cookies.token; 
    if (!token) return res.redirect('/'); 

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.redirect('/'); 
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// A. Serve Dashboard HTML
app.get('/dashboard', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../private/proposal_dashboard.html'));
});

// B. Serve Private Assets (CSS/JS)
app.get('/private/:fileName', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../private', req.params.fileName));
});

// C. API Data
app.get('/api/dashboard-data', protect, (req, res) => {
    res.json({
        message: "Will you marry me?",
        user: req.user.username 
    });
});

// D. Logout (Clears Cookie)
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out" });
});

// E. Public Files
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/api', authRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ Connected'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));