require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); 
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // New: To read cookies for SSR
const authRoutes = require('./routes/auth');

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser()); // Use this to read the "token" cookie

// 1. Protection Middleware for HTML Pages
const protectDashboard = (req, res, next) => {
    // For SSR, we usually check cookies because headers are hard to send via browser URL bar
    const token = req.cookies.token; 

    if (!token) {
        return res.redirect('/'); // No token? Kicked back to login before seeing a single line of HTML
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.redirect('/'); // Invalid token? Redirected.
        req.user = user;
        next();
    });
};

// 2. The SSR Dashboard Route
// This replaces just "opening the file." The server validates first.
app.get('/dashboard', protectDashboard, (req, res) => {
    // Move proposal_dashboard.html one folder UP or into a "private" folder 
    // so express.static doesn't serve it automatically.
    res.sendFile(path.join(__dirname, '../client/proposal_dashboard.html'));
});

// 3. API Route for the actual data
app.get('/api/dashboard-data', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid Token" });
        res.json({
            message: "Will you marry me?",
            user: user.username 
        });
    });
});

// Static files (Login page, CSS, JS)
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('/api', authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Port ${PORT}`));