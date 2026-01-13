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
    
    if (!token) {
        console.log("❌ No Token: Redirecting to Login");
        return res.redirect('/'); 
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("❌ Invalid Token: Redirecting to Login");
            return res.redirect('/'); 
        }
        req.user = user;
        next();
    });
};

// --- ROUTES ORDER (STRICT) ---

// 1. Auth API
app.use('/api', authRoutes);

// 2. The Dashboard (Protected)
// This MUST stay above express.static so the bouncer catches it first
app.get('/dashboard', protect, (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    // Points to the PRIVATE folder
    res.sendFile(path.join(__dirname, '../private/proposal_dashboard.html'));
});

// 3. Private Assets (Protected)
app.get('/private/:fileName', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../private', req.params.fileName));
});

// 4. API Data (Protected)
app.get('/api/dashboard-data', protect, (req, res) => {
    res.json({
        message: "Will you marry me?",
        user: req.user.username 
    });
});

// 5. Public Static Files
// DO NOT put proposal_dashboard.html in this /client folder
app.use(express.static(path.join(__dirname, '../client')));

// 6. Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 7. Global Catch-all (Final Security Layer)
app.get('*', (req, res) => {
    res.redirect('/');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Secure Connection Established'))
    .catch(err => console.error('Database connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server locked and loaded on port ${PORT}`));